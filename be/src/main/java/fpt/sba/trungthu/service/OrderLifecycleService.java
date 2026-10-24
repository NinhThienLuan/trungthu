package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;

import java.math.BigDecimal;
import java.util.UUID;

public interface OrderLifecycleService {
    OrderDetailResponse confirmDeposit(UUID orderId, BigDecimal receivedAmount);
    OrderDetailResponse cancel(UUID orderId);
    OrderDetailResponse changeStatus(UUID orderId, OrderStatus status, BigDecimal collectedAmount);
    void expire(UUID orderId);

}
