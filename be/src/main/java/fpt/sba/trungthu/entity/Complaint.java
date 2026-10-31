package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import fpt.sba.trungthu.entity.enumeration.ComplaintStatus;
import fpt.sba.trungthu.entity.enumeration.ComplaintType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "COMPLAINT", indexes = { @Index(name = "IX_COMPLAINT_customer_id", columnList = "customer_id"),
        @Index(name = "IX_COMPLAINT_order_id", columnList = "order_id"),
        @Index(name = "IX_COMPLAINT_provider_id", columnList = "provider_id") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint extends CreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "FK_COMPLAINT_customer_id"))
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "FK_COMPLAINT_order_id"))
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_COMPLAINT_provider_id"))
    private User provider;

    // Loại khiếu nại: PRODUCT_QUALITY, DELIVERY, PAYMENT, OTHER
    @Enumerated(EnumType.STRING)
    @Column(name = "complaint_type", nullable = false, length = 50)
    private ComplaintType complaintType;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "description", length = 100000)
    private String description;

    // Trạng thái khiếu nại: OPEN → IN_PROGRESS → RESOLVED / CLOSED / REJECTED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ComplaintStatus status;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    /** Cách xử lý (hoàn tiền, đổi bánh...) hoặc lý do từ chối, do xưởng/admin ghi */
    @Column(name = "resolution", length = 2000)
    private String resolution;

    // Chuyển trạng thái khiếu nại với validation
    public void transitionStatus(ComplaintStatus newStatus) {
        this.status.validateTransition(newStatus);
        this.status = newStatus;
        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.REJECTED) {
            this.resolvedAt = LocalDateTime.now();
        }
    }
}

