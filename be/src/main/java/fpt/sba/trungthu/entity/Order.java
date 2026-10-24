package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.OrderPaymentStatus;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "`ORDER`", indexes = {
        @Index(name = "IX_ORDER_customer_id", columnList = "customer_id"),
        @Index(name = "IX_ORDER_provider_id", columnList = "provider_id"),
        @Index(name = "IX_ORDER_checkout_id", columnList = "checkout_id"),
        @Index(name = "IX_ORDER_status_hold", columnList = "order_status,hold_expires_at")
}, uniqueConstraints = {
        @UniqueConstraint(name = "UQ_ORDER_order_code", columnNames = "order_code"),
        @UniqueConstraint(name = "UQ_ORDER_checkout_provider", columnNames = {"checkout_id", "provider_id"})
})
@Check(name = "CK_ORDER_amounts", constraints = "subtotal_amount >= 0 AND shipping_fee >= 0 "
        + "AND total_amount >= 0 AND deposit_amount >= 0 AND deposit_amount <= total_amount "
        + "AND list_amount >= 0 AND discount_amount >= 0 AND discount_amount <= list_amount")
@Check(name = "CK_ORDER_hold_count", constraints = "hold_extension_count BETWEEN 0 AND 1")
@Check(name = "CK_ORDER_cod", constraints = "payment_method <> 'COD' OR (deposit_amount = 0 AND hold_expires_at IS NULL)")
@Check(name = "CK_ORDER_hold_state", constraints = "(order_status = 'PENDING_DEPOSIT' AND payment_method = 'VIETQR' "
        + "AND hold_expires_at IS NOT NULL) OR (order_status <> 'PENDING_DEPOSIT' AND hold_expires_at IS NULL)")
@Check(name = "CK_ORDER_hold_audit", constraints = "hold_extension_count = 0 OR "
        + "(hold_extended_at IS NOT NULL AND hold_extended_by IS NOT NULL AND hold_extension_reason IS NOT NULL)")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ORDER_customer_id"))
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_ORDER_provider_id"))
    private User provider;

    @Column(name = "checkout_id", nullable = false, updatable = false)
    private UUID checkoutId;

    @Column(name = "order_code", nullable = false, updatable = false, length = 255)
    private String orderCode;

    @Column(name = "subtotal_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal subtotalAmount;

    @Builder.Default
    @Column(name = "list_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal listAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "discount_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "shipping_fee", nullable = false, precision = 18, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Builder.Default
    @Column(name = "deposit_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 30)
    private OrderStatus orderStatus;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private OrderPaymentStatus paymentStatus = OrderPaymentStatus.UNPAID;

    @org.hibernate.annotations.Nationalized
    @Column(name = "receiver_name", nullable = false, length = 255)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    private String receiverPhone;

    @org.hibernate.annotations.Nationalized
    @Column(name = "shipping_address", nullable = false, length = 100000)
    private String shippingAddress;

    @Column(name = "ordered_at", nullable = false, updatable = false)
    private Instant orderedAt;

    @Column(name = "hold_expires_at")
    private Instant holdExpiresAt;

    @Builder.Default
    @Column(name = "hold_extension_count", nullable = false)
    private Integer holdExtensionCount = 0;

    @Column(name = "hold_extended_at")
    private Instant holdExtendedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hold_extended_by", foreignKey = @ForeignKey(name = "FK_ORDER_hold_extended_by"))
    private User holdExtendedBy;

    @Column(name = "hold_extension_reason", length = 500)
    private String holdExtensionReason;

    @Builder.Default
    @Column(name = "require_vat_invoice", nullable = false)
    private Boolean requireVatInvoice = false;

    @Column(name = "vat_company_name", length = 255)
    private String vatCompanyName;

    @Column(name = "vat_tax_code", length = 50)
    private String vatTaxCode;

    @Column(name = "vat_company_address", length = 100000)
    private String vatCompanyAddress;

    @Column(name = "vat_email", length = 254)
    private String vatEmail;

    public void transitionOrderStatus(OrderStatus targetStatus) {
        if (orderStatus == null) {
            throw new IllegalStateException("Order status must be initialized before a transition");
        }
        orderStatus.validateTransition(targetStatus);
        orderStatus = targetStatus;
    }

    public void transitionPaymentStatus(OrderPaymentStatus targetStatus) {
        paymentStatus.validateTransition(targetStatus);
        paymentStatus = targetStatus;
    }

    @PrePersist
    protected void setOrderedAt() {
        if (orderedAt == null) {
            orderedAt = Instant.now();
        }
    }
}
