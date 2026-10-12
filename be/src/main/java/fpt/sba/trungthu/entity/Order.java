package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "`ORDER`", indexes = {
        @Index(name = "IX_ORDER_customer_id", columnList = "customer_id") }, uniqueConstraints = {
                @UniqueConstraint(name = "UQ_ORDER_order_code", columnNames = { "order_code" }) })
@Check(name = "CK_ORDER_total_amount", constraints = "total_amount >= 0")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ORDER_customer_id"))
    private User customer;

    @Column(name = "order_code", nullable = false, length = 255)
    private String orderCode;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 30)
    private fpt.sba.trungthu.entity.enumeration.OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private fpt.sba.trungthu.entity.enumeration.PaymentStatus paymentStatus;

    /**
     * Chuyển đổi trạng thái đơn hàng có kiểm tra switch-case
     */
    public void transitionOrderStatus(fpt.sba.trungthu.entity.enumeration.OrderStatus targetStatus) {
        if (this.orderStatus != null) {
            this.orderStatus.validateTransition(targetStatus);
        }
        this.orderStatus = targetStatus;
    }

    /**
     * Chuyển đổi trạng thái thanh toán có kiểm tra switch-case
     */
    public void transitionPaymentStatus(fpt.sba.trungthu.entity.enumeration.PaymentStatus targetStatus) {
        if (this.paymentStatus != null) {
            this.paymentStatus.validateTransition(targetStatus);
        }
        this.paymentStatus = targetStatus;
    }

    @Column(name = "shipping_address", nullable = false, length = 100000)
    private String shippingAddress;

    @Column(name = "ordered_at", nullable = false, updatable = false)
    private LocalDateTime orderedAt;

    @PrePersist
    protected void setOrderedAt() {
        if (orderedAt == null) {
            orderedAt = LocalDateTime.now();
        }
    }
}
