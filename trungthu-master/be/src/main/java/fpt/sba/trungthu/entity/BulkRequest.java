package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.BulkRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Checks;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "BULK_REQUEST", indexes = {
        @Index(name = "IX_BULK_REQUEST_customer_id", columnList = "customer_id") }, uniqueConstraints = {
                @UniqueConstraint(name = "UQ_BULK_REQUEST_request_code", columnNames = { "request_code" }) })
@Checks({ @Check(name = "CK_BULK_REQUEST_requested_quantity", constraints = "requested_quantity > 0"),
        @Check(name = "CK_BULK_REQUEST_expected_budget", constraints = "expected_budget >= 0") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BulkRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "FK_BULK_REQUEST_customer_id"))
    private User customer;

    @Column(name = "request_code", nullable = false, length = 255)
    private String requestCode;

    @Column(name = "description", length = 100000)
    private String description;

    @Column(name = "requested_quantity", nullable = false)
    private Integer requestedQuantity;

    @Column(name = "expected_date")
    private LocalDate expectedDate;

    @Column(name = "expected_budget", precision = 18, scale = 2)
    private BigDecimal expectedBudget;

    // Trạng thái đơn đặt hàng số lượng lớn: OPEN → QUOTED / CANCELLED → ACCEPTED / REJECTED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BulkRequestStatus status;

    // Chuyển trạng thái bulk request với validation
    public void transitionStatus(BulkRequestStatus newStatus) {
        this.status.validateTransition(newStatus);
        this.status = newStatus;
    }
}

