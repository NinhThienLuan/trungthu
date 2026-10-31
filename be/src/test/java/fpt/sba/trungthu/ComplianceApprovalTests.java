package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.ReviewComplianceDocRequest;
import fpt.sba.trungthu.entity.StoreComplianceDoc;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocType;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.StoreComplianceDocRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.ComplianceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
class ComplianceApprovalTests {
    @Autowired private ComplianceService compliance;
    @Autowired private StoreComplianceDocRepository docs;
    @Autowired private UserRepository users;
    @MockitoBean private SecurityContextService security;

    @Test
    void providerBecomesApprovedOnlyAfterAllThreeDocumentTypesAreApproved() {
        User admin = user(UserRole.PLATFORM_ADMIN);
        User seller = user(UserRole.PROVIDER);
        when(security.getCurrentUser()).thenReturn(admin);

        StoreComplianceDoc rejected = doc(seller, ComplianceDocType.IDENTITY_KYC);
        compliance.reviewDocument(rejected.getId(), review(ComplianceDocStatus.REJECTED, "Ảnh mờ"));
        approve(doc(seller, ComplianceDocType.FOOD_SAFETY_CERT));
        approve(doc(seller, ComplianceDocType.BUSINESS_LICENSE));
        assertThat(users.findById(seller.getId()).orElseThrow().getIsComplianceApproved()).isFalse();

        StoreComplianceDoc kyc = doc(seller, ComplianceDocType.IDENTITY_KYC);
        var reviewed = approve(kyc);
        assertThat(users.findById(seller.getId()).orElseThrow().getIsComplianceApproved()).isTrue();
        assertThat(reviewed.getVerifiedByEmail()).isEqualTo(admin.getEmail());
    }

    private fpt.sba.trungthu.dto.response.ComplianceDocResponse approve(StoreComplianceDoc doc) {
        return compliance.reviewDocument(doc.getId(), review(ComplianceDocStatus.APPROVED, null));
    }

    private static ReviewComplianceDocRequest review(ComplianceDocStatus status, String reason) {
        return ReviewComplianceDocRequest.builder().newStatus(status).rejectionReason(reason).build();
    }

    private StoreComplianceDoc doc(User seller, ComplianceDocType type) {
        return docs.save(StoreComplianceDoc.builder().provider(seller).documentType(type)
                .documentUrl("/uploads/compliance/" + UUID.randomUUID() + ".png")
                .verificationStatus(ComplianceDocStatus.PENDING).submittedAt(LocalDateTime.now()).build());
    }

    private User user(UserRole role) {
        return users.save(User.builder().email(UUID.randomUUID() + "@example.com").password("hash")
                .fullName(role.name()).role(role).status(UserStatus.ACTIVE)
                .isComplianceApproved(false).isSeasonActive(true).build());
    }
}
