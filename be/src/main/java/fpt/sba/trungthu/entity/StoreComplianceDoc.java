package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "STORE_COMPLIANCE_DOC", indexes = {
        @Index(name = "IX_STORE_COMPLIANCE_DOC_provider_id", columnList = "provider_id"),
        @Index(name = "IX_STORE_COMPLIANCE_DOC_verified_by", columnList = "verified_by") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class StoreComplianceDoc extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_STORE_COMPLIANCE_DOC_provider_id"))
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "verified_by", nullable = true, foreignKey = @ForeignKey(name = "FK_STORE_COMPLIANCE_DOC_verified_by"))
    private User verifiedBy;

    // Loại tài liệu: BUSINESS_LICENSE, FOOD_SAFETY_CERT, TAX_CERT, ...
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private ComplianceDocType documentType;

    @Column(name = "document_url", nullable = false, length = 2048)
    private String documentUrl;

    // Trạng thái xác minh: PENDING → APPROVED / REJECTED
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private ComplianceDocStatus verificationStatus;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @org.hibernate.annotations.Nationalized
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @PrePersist
    protected void setSubmittedAt() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }

    // Chuyển trạng thái xác minh với validation
    public void transitionVerificationStatus(ComplianceDocStatus newStatus) {
        this.verificationStatus.validateTransition(newStatus);
        this.verificationStatus = newStatus;
    }
}

