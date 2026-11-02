package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.CreateOrdersCommand;
import fpt.sba.trungthu.dto.request.OrderQueryRequest;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.dto.response.OrderSummaryResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.entity.Order;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    List<Order> createOrders(CreateOrdersCommand command);

    @PreAuthorize("hasRole('CUSTOMER')")
    PageResponse<OrderSummaryResponse> getMyOrders(OrderQueryRequest query);

    @PreAuthorize("hasRole('PROVIDER')")
    PageResponse<OrderSummaryResponse> getProviderOrders(OrderQueryRequest query);

    @PreAuthorize("hasAnyRole('CUSTOMER', 'PROVIDER')")
    OrderDetailResponse getOrderDetail(UUID orderId);
}
