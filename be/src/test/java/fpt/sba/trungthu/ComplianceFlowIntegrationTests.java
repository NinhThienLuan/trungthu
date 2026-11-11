package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.ReviewComplianceDocRequest;
import fpt.sba.trungthu.dto.request.UploadComplianceDocRequest;
import fpt.sba.trungthu.dto.response.ComplianceDocResponse;
import fpt.sba.trungthu.entity.StoreComplianceDoc;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocType;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.StoreComplianceDocRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.ComplianceService;
import fpt.sba.trungthu.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * CRITICAL FIX #5: Integration tests cho toàn bộ Compliance flow
 * Verify: upload → review → auto-approve flag → email notifications
 */
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
    "app.demo-seed=false" // Disable demo seeders để test isolation
})
@Transactional
class ComplianceFlowIntegrationTests {

    @Autowired private ComplianceService complianceService;
    @Autowired private StoreComplianceDocRepository complianceDocRepository;
    @Autowired private UserRepository userRepository;
    @MockitoBean private SecurityContextService securityContextService;
    @MockitoBean private EmailService emailService; // Mock để không gửi email thật trong test

    private User provider;
    private User admin;

    @BeforeEach
    void setUp() {
        // Tạo provider và admin cho test
        provider = userRepository.save(User.builder()
                .email("provider-" + UUID.randomUUID() + "@test.com")
                .password("hash")
                .fullName("Test Provider")
                .storeName("Test Shop")
                .role(UserRole.PROVIDER)
                .status(UserStatus.ACTIVE)
                .isComplianceApproved(false)
                .isSeasonActive(true)
                .build());

        admin = userRepository.save(User.builder()
                .email("admin-" + UUID.randomUUID() + "@test.com")
                .password("hash")
                .fullName("Test Admin")
                .role(UserRole.PLATFORM_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        // Mock security context để trả về admin khi review
        when(securityContextService.getCurrentUser()).thenReturn(admin);
    }

    @Test
    void providerUploadsThreeDocuments_AdminApprovesAll_FlagSetAndEmailsSent() {
        // Provider uploads 3 loại giấy tờ
        MockMultipartFile foodSafetyCert = pdfFile();
        MockMultipartFile businessLicense = pdfFile();
        MockMultipartFile identityKyc = pdfFile();

        ComplianceDocResponse doc1 = complianceService.uploadDocument(provider.getEmail(), uploadRequest(ComplianceDocType.FOOD_SAFETY_CERT, foodSafetyCert));
        ComplianceDocResponse doc2 = complianceService.uploadDocument(provider.getEmail(), uploadRequest(ComplianceDocType.BUSINESS_LICENSE, businessLicense));
        ComplianceDocResponse doc3 = complianceService.uploadDocument(provider.getEmail(), uploadRequest(ComplianceDocType.IDENTITY_KYC, identityKyc));

        // Verify: Upload thành công, status = PENDING
        assertThat(doc1.getVerificationStatus()).isEqualTo(ComplianceDocStatus.PENDING);
        assertThat(doc2.getVerificationStatus()).isEqualTo(ComplianceDocStatus.PENDING);
        assertThat(doc3.getVerificationStatus()).isEqualTo(ComplianceDocStatus.PENDING);

        // Verify: Email thông báo admin đã gửi 3 lần
        verify(emailService, times(3)).sendNewComplianceDocumentToAdmin(anyString(), eq(provider.getEmail()), anyString());

        // Admin approve giấy 1 và 2
        complianceService.reviewDocument(doc1.getId(), approveRequest());
        complianceService.reviewDocument(doc2.getId(), approveRequest());

        // Verify: Provider chưa đạt compliance (thiếu 1 loại)
        User providerAfterTwo = userRepository.findById(provider.getId()).orElseThrow();
        assertThat(providerAfterTwo.getIsComplianceApproved()).isFalse();

        // Verify: Email approved gửi 2 lần, chưa có email fully approved
        verify(emailService, times(2)).sendComplianceApprovedEmail(eq(provider.getEmail()), anyString());
        verify(emailService, never()).sendComplianceFullyApprovedEmail(anyString());

        // Admin approve giấy thứ 3 (cuối cùng)
        complianceService.reviewDocument(doc3.getId(), approveRequest());

        // Verify: Provider đạt compliance đầy đủ
        User providerAfterThree = userRepository.findById(provider.getId()).orElseThrow();
        assertThat(providerAfterThree.getIsComplianceApproved()).isTrue();

        // Verify: Email fully approved đã gửi
        verify(emailService).sendComplianceFullyApprovedEmail(provider.getEmail());
    }

    @Test
    void adminRejectsDocument_FlagIsUnset_EmailSent() {
        // Provider upload 3 giấy tờ PENDING
        StoreComplianceDoc doc1 = pendingDoc(provider, ComplianceDocType.FOOD_SAFETY_CERT);
        StoreComplianceDoc doc2 = pendingDoc(provider, ComplianceDocType.BUSINESS_LICENSE);
        StoreComplianceDoc doc3 = pendingDoc(provider, ComplianceDocType.IDENTITY_KYC);

        // Admin approve tất cả 3 giấy
        complianceService.reviewDocument(doc1.getId(), approveRequest());
        complianceService.reviewDocument(doc2.getId(), approveRequest());
        complianceService.reviewDocument(doc3.getId(), approveRequest());

        // Verify: Provider đạt compliance approved
        User providerAfterApprove = userRepository.findById(provider.getId()).orElseThrow();
        assertThat(providerAfterApprove.getIsComplianceApproved()).isTrue();

        // Simulate: Doc1 cũ bị xóa/expired (giấy hết hạn)
        complianceDocRepository.delete(doc1);

        // Provider upload lại giấy FOOD_SAFETY_CERT mới (PENDING)
        StoreComplianceDoc newDoc1 = pendingDoc(provider, ComplianceDocType.FOOD_SAFETY_CERT);

        // Admin reject giấy mới này
        complianceService.reviewDocument(newDoc1.getId(), rejectRequest("Giấy hết hạn"));

        // Verify: Provider không còn compliance approved (thiếu FOOD_SAFETY_CERT approved)
        User providerAfterReject = userRepository.findById(provider.getId()).orElseThrow();
        assertThat(providerAfterReject.getIsComplianceApproved()).isFalse();

        // Verify: Email rejected đã gửi
        verify(emailService).sendComplianceRejectedEmail(eq(provider.getEmail()), eq("FOOD_SAFETY_CERT"), eq("Giấy hết hạn"));
    }

    @Test
    void uploadDocumentWithSpoofedContentType_Rejected() {
        // Attacker gửi virus.exe với Content-Type: application/pdf
        // CRITICAL FIX #1: Magic bytes validation phải chặn file này
        MockMultipartFile fakeFile = new MockMultipartFile(
                "file",
                "virus.exe",
                "application/pdf", // Giả mạo
                new byte[]{0x4D, 0x5A} // Magic bytes của .exe (MZ)
        );

        UploadComplianceDocRequest request = uploadRequest(ComplianceDocType.FOOD_SAFETY_CERT, fakeFile);

        // Verify: Upload bị reject vì magic bytes không khớp
        assertThatThrownBy(() -> complianceService.uploadDocument(provider.getEmail(), request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("File content does not match declared type");
    }

    @Test
    void getDocumentsByStatus_ReturnsCorrectDocuments() {
        // Tạo documents với các status khác nhau
        StoreComplianceDoc pending1 = pendingDoc(provider, ComplianceDocType.FOOD_SAFETY_CERT);
        StoreComplianceDoc pending2 = pendingDoc(provider, ComplianceDocType.BUSINESS_LICENSE);
        StoreComplianceDoc approved = approvedDoc(provider, ComplianceDocType.IDENTITY_KYC);

        // Get pending documents
        List<ComplianceDocResponse> pendingDocs = complianceService.getDocumentsByStatus(ComplianceDocStatus.PENDING);
        assertThat(pendingDocs).hasSize(2);
        assertThat(pendingDocs).extracting("id").contains(pending1.getId(), pending2.getId());

        // Get approved documents
        List<ComplianceDocResponse> approvedDocs = complianceService.getDocumentsByStatus(ComplianceDocStatus.APPROVED);
        assertThat(approvedDocs).hasSize(1);
        assertThat(approvedDocs).extracting("id").contains(approved.getId());
    }

    @Test
    void hasApprovedDocument_ReturnsTrueWhenApproved() {
        // Provider chưa có giấy tờ
        assertThat(complianceService.hasApprovedDocument(provider.getEmail())).isFalse();

        // Upload và approve 1 giấy
        approvedDoc(provider, ComplianceDocType.FOOD_SAFETY_CERT);

        // Verify: Provider có approved document
        assertThat(complianceService.hasApprovedDocument(provider.getEmail())).isTrue();
    }

    @Test
    void reviewDocument_OnlyPendingCanBeReviewed() {
        StoreComplianceDoc approvedDoc = approvedDoc(provider, ComplianceDocType.FOOD_SAFETY_CERT);

        // Verify: Không thể review lại document đã approved
        assertThatThrownBy(() -> complianceService.reviewDocument(approvedDoc.getId(), approveRequest()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only PENDING documents can be reviewed");
    }

    @Test
    void reviewDocument_RejectionRequiresReason() {
        StoreComplianceDoc pendingDoc = pendingDoc(provider, ComplianceDocType.FOOD_SAFETY_CERT);

        // Verify: Reject không có lý do → exception
        ReviewComplianceDocRequest invalidRequest = ReviewComplianceDocRequest.builder()
                .newStatus(ComplianceDocStatus.REJECTED)
                .rejectionReason(null)
                .build();

        assertThatThrownBy(() -> complianceService.reviewDocument(pendingDoc.getId(), invalidRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Rejection reason is required");
    }

    // ==================== Helper Methods ====================

    private UploadComplianceDocRequest uploadRequest(ComplianceDocType type, MockMultipartFile file) {
        return UploadComplianceDocRequest.builder()
                .documentType(type.name())
                .file(file)
                .build();
    }

    private ReviewComplianceDocRequest approveRequest() {
        return ReviewComplianceDocRequest.builder()
                .newStatus(ComplianceDocStatus.APPROVED)
                .build();
    }

    private ReviewComplianceDocRequest rejectRequest(String reason) {
        return ReviewComplianceDocRequest.builder()
                .newStatus(ComplianceDocStatus.REJECTED)
                .rejectionReason(reason)
                .build();
    }

    private MockMultipartFile pdfFile() {
        // PDF magic bytes: %PDF
        byte[] pdfContent = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34};
        return new MockMultipartFile("file", "document.pdf", "application/pdf", pdfContent);
    }

    private StoreComplianceDoc pendingDoc(User provider, ComplianceDocType type) {
        return complianceDocRepository.save(StoreComplianceDoc.builder()
                .provider(provider)
                .documentType(type)
                .documentUrl("/uploads/compliance/" + UUID.randomUUID() + ".pdf")
                .verificationStatus(ComplianceDocStatus.PENDING)
                .submittedAt(java.time.LocalDateTime.now())
                .build());
    }

    private StoreComplianceDoc approvedDoc(User provider, ComplianceDocType type) {
        return complianceDocRepository.save(StoreComplianceDoc.builder()
                .provider(provider)
                .documentType(type)
                .documentUrl("/uploads/compliance/" + UUID.randomUUID() + ".pdf")
                .verificationStatus(ComplianceDocStatus.APPROVED)
                .submittedAt(java.time.LocalDateTime.now())
                .verifiedAt(java.time.LocalDateTime.now())
                .verifiedBy(admin)
                .build());
    }
}
