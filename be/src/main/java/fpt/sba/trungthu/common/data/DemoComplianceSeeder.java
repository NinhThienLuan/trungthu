package fpt.sba.trungthu.common.data;

import fpt.sba.trungthu.entity.StoreComplianceDoc;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocType;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.StoreComplianceDocRepository;
import fpt.sba.trungthu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.UUID;

/**
 * Gian đủ điều kiện bán cần bản ghi giấy tờ, không chỉ cờ isComplianceApproved,
 * vì trang Hồ sơ & thẩm định đọc STORE_COMPLIANCE_DOC.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.demo-seed", havingValue = "true", matchIfMissing = true)
@Order(20)
@RequiredArgsConstructor
public class DemoComplianceSeeder implements CommandLineRunner {

    private static final String ADMIN = "admin@trungthu.fpt.edu.vn";

    private final UserRepository users;
    private final StoreComplianceDocRepository documents;

    @Value("${app.storage.base-path:uploads}")
    private String storagePath;

    @Value("${app.storage.base-url:/uploads}")
    private String storageUrl;

    @Override
    public void run(String... args) {
        User admin = users.findByEmail(ADMIN)
                .orElseThrow(() -> new IllegalStateException("Admin " + ADMIN + " is missing"));
        for (User provider : users.findAll()) {
            if (provider.getRole() != UserRole.PROVIDER || provider.getStatus() != UserStatus.ACTIVE
                    || !Boolean.TRUE.equals(provider.getIsComplianceApproved())) {
                continue;
            }
            EnumSet<ComplianceDocType> approved = EnumSet.noneOf(ComplianceDocType.class);
            documents.findByProviderIdOrderBySubmittedAtDesc(provider.getId()).stream()
                    .filter(doc -> doc.getVerificationStatus() == ComplianceDocStatus.APPROVED)
                    .forEach(doc -> approved.add(doc.getDocumentType()));
            for (ComplianceDocType type : ComplianceDocType.values()) {
                if (!approved.contains(type)) {
                    save(provider, admin, type);
                }
            }
        }
    }

    private void save(User provider, User admin, ComplianceDocType type) {
        String filename = UUID.randomUUID() + ".jpg";
        Path path = Paths.get(storagePath, "compliance", filename);
        try {
            Files.createDirectories(path.getParent());
            Files.write(path, DemoAlbum.bytes(file(type)));
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Cannot store compliance image " + file(type), exception);
        }
        String prefix = storageUrl.endsWith("/") ? storageUrl : storageUrl + "/";
        LocalDateTime now = LocalDateTime.now();
        documents.save(StoreComplianceDoc.builder()
                .provider(provider)
                .verifiedBy(admin)
                .documentType(type)
                .documentUrl(prefix + "compliance/" + filename)
                .verificationStatus(ComplianceDocStatus.APPROVED)
                .submittedAt(now)
                .verifiedAt(now)
                .build());
        log.info("Seeded {} compliance document for {}", type, provider.getEmail());
    }

    private static String file(ComplianceDocType type) {
        return switch (type) {
            case FOOD_SAFETY_CERT -> "compliance-attp.jpg";
            case BUSINESS_LICENSE -> "compliance-gpkd.jpg";
            case IDENTITY_KYC -> "compliance-cccd.jpg";
        };
    }
}
