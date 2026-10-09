package fpt.sba.trungthu.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;
import java.time.LocalDateTime;
import org.hibernate.annotations.FractionalSeconds;
import java.time.ZoneOffset;

@Entity
@Table(name = "STORE_COMPLIANCE_DOC", indexes = {@Index(name = "IX_STORE_COMPLIANCE_DOC_provider_id", columnList = "provider_id"), @Index(name = "IX_STORE_COMPLIANCE_DOC_verified_by", columnList = "verified_by")})
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class StoreComplianceDoc {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "document_id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_STORE_COMPLIANCE_DOC_provider_id"))
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "verified_by", nullable = true, foreignKey = @ForeignKey(name = "FK_STORE_COMPLIANCE_DOC_verified_by"))
    private User verifiedBy;

    @Column(name = "document_type", nullable = false, length = 255)
    private String documentType;

    @Column(name = "document_url", nullable = false, length = 2048)
    private String documentUrl;

    @Column(name = "verification_status", nullable = false, length = 30)
    private String verificationStatus;

    @Column(name = "submitted_at", nullable = false)
    @FractionalSeconds(0)
    private LocalDateTime submittedAt;

    @Column(name = "verified_at")
    @FractionalSeconds(0)
    private LocalDateTime verifiedAt;

    @PrePersist
    protected void setSubmittedAt() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now(ZoneOffset.UTC);
        }
    }
}
