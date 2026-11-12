package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.CreateOrdersCommand;
import fpt.sba.trungthu.dto.request.OrderQueryRequest;
import fpt.sba.trungthu.dto.response.AdminOrderResponse;
import fpt.sba.trungthu.dto.response.BakeSheetResponse;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.dto.response.OrderSummaryResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface OrderService {
    List<Order> createOrders(CreateOrdersCommand command);

    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    PageResponse<AdminOrderResponse> getAdminOrders(OrderStatus status, int page, int size);

    @PreAuthorize("hasRole('CUSTOMER')")
    PageResponse<OrderSummaryResponse> getMyOrders(OrderQueryRequest query);

    @PreAuthorize("hasRole('PROVIDER')")
    PageResponse<OrderSummaryResponse> getProviderOrders(OrderQueryRequest query);

    @PreAuthorize("hasAnyRole('CUSTOMER', 'PROVIDER')")
    OrderDetailResponse getOrderDetail(UUID orderId);

    @PreAuthorize("hasRole('PROVIDER')")
    List<BakeSheetResponse> getBakeSheet(LocalDate date);
}
