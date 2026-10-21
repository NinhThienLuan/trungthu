package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import fpt.sba.trungthu.entity.enumeration.TransactionStatus;
import fpt.sba.trungthu.entity.enumeration.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "PAYMENT_TRANSACTION", indexes = {
        @Index(name = "IX_PAYMENT_TRANSACTION_order_id", columnList = "order_id"),
        @Index(name = "IX_PAYMENT_TRANSACTION_subscription_id", columnList = "subscription_id"),
        @Index(name = "IX_PAYMENT_TRANSACTION_payos_code", columnList = "payos_order_code")
}, uniqueConstraints = @UniqueConstraint(name = "UQ_PAYMENT_TRANSACTION_transaction_code", columnNames = "transaction_code"))
@Check(name = "CK_PAYMENT_TRANSACTION_amount", constraints = "amount > 0")
@Check(name = "CK_PAYMENT_TRANSACTION_owner", constraints = "(transaction_type = 'SUBSCRIPTION_FEE' "
        + "AND subscription_id IS NOT NULL AND order_id IS NULL) OR (transaction_type IN ('ORDER_DEPOSIT', 'ORDER_BALANCE') "
        + "AND order_id IS NOT NULL AND subscription_id IS NULL)")
@Check(name = "CK_PAYMENT_TRANSACTION_paid_at", constraints = "(payment_status = 'SUCCESS' AND paid_at IS NOT NULL) "
        + "OR (payment_status <> 'SUCCESS' AND paid_at IS NULL)")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction extends CreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", foreignKey = @ForeignKey(name = "FK_PAYMENT_TRANSACTION_order_id"))
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", foreignKey = @ForeignKey(name = "FK_PAYMENT_TRANSACTION_subscription_id"))
    private Subscription subscription;

    @Column(name = "transaction_code", nullable = false, updatable = false, length = 255)
    private String transactionCode;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private TransactionType transactionType;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private TransactionStatus paymentStatus = TransactionStatus.PENDING;

    // Business payment time; createdAt only records when the pending transaction was created.
    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "payos_order_code")
    private Long payosOrderCode;

    @Column(name = "payos_payment_link_id", length = 100)
    private String payosPaymentLinkId;

    @Column(name = "payos_checkout_url", length = 2048)
    private String payosCheckoutUrl;

    @Column(name = "payos_qr_code", length = 2048)
    private String payosQrCode;

    @Column(name = "payos_external_reference", length = 255)
    private String payosExternalReference;

    public void transitionPaymentStatus(TransactionStatus targetStatus) {
        paymentStatus.validateTransition(targetStatus);
        paymentStatus = targetStatus;
    }
}
