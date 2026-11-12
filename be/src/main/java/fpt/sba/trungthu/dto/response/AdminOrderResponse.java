package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminOrderResponse(
        UUID id,
        String code,
        Instant orderedAt,
        OrderStatus status,
        BigDecimal totalAmount,
        String storeName,
        String providerName,
        String providerEmail,
        String buyerName,
        String buyerEmail
) {}
