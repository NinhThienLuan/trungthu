package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.OrderPaymentStatus;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record DummyOrderResponse(UUID id, String code, OrderStatus status, OrderPaymentStatus paymentStatus,
        BigDecimal totalAmount) {
}
