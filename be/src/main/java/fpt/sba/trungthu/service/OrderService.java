package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.CreateOrdersCommand;
import fpt.sba.trungthu.dto.request.OrderQueryRequest;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.dto.response.OrderSummaryResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.entity.Order;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    List<Order> createOrders(CreateOrdersCommand command);

    PageResponse<OrderSummaryResponse> getMyOrders(OrderQueryRequest query);

    PageResponse<OrderSummaryResponse> getProviderOrders(OrderQueryRequest query);

    OrderDetailResponse getOrderDetail(UUID orderId);
}
