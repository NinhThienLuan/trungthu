package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.OrderPaymentStatus;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@SuperBuilder
public class OrderSummaryResponse {
    private UUID id;
    private String code;
    private UUID providerId;
    private String storeName;
    private LocalDate deliveryDate;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private OrderPaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private Instant createdAt;
}
