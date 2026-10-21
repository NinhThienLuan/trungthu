package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface OrderLifecycleService {
    OrderDetailResponse confirmDeposit(UUID orderId, BigDecimal receivedAmount);
    HoldResponse extendHold(UUID orderId, String reason);
    OrderDetailResponse cancel(UUID orderId);
    OrderDetailResponse changeStatus(UUID orderId, OrderStatus status, BigDecimal collectedAmount);
    void expire(UUID orderId);

    record HoldResponse(Instant holdExpiresAt, int extensionCount) {}
}
