package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.CreatedEntity;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import fpt.sba.trungthu.entity.enumeration.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PAYMENT_TRANSACTION", indexes = {
        @Index(name = "IX_PAYMENT_TRANSACTION_order_id", columnList = "order_id") }, uniqueConstraints = {
                @UniqueConstraint(name = "UQ_PAYMENT_TRANSACTION_transaction_code", columnNames = {
                        "transaction_code" }) })
@Check(name = "CK_PAYMENT_TRANSACTION_amount", constraints = "amount >= 0")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction extends CreatedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PAYMENT_TRANSACTION_order_id"))
    private Order order;

    @Column(name = "transaction_code", nullable = false, length = 255)
    private String transactionCode;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    // Phương thức thanh toán: CASH, BANK_TRANSFER, MOMO, VNPAY, ...
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    // Trạng thái giao dịch: PENDING → COMPLETED / FAILED / REFUNDED
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus;

    @Column(name = "gateway_transaction_id", length = 255)
    private String gatewayTransactionId;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // Chuyển trạng thái thanh toán với validation
    public void transitionPaymentStatus(PaymentStatus newStatus) {
        this.paymentStatus.validateTransition(newStatus);
        this.paymentStatus = newStatus;
    }
}

