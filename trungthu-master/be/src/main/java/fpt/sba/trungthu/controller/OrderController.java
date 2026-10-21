package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.OrderQueryRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.dto.response.OrderSummaryResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Buyer and seller read their own orders")
public class OrderController {
    private final OrderService orderService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "List my orders, filtered by status and inclusive delivery dates")
    public ResponseEntity<ApiResponseDTO<PageResponse<OrderSummaryResponse>>> getMyOrders(
            @Valid @ModelAttribute OrderQueryRequest query) {
        return ResponseEntity.ok(ApiResponseDTO.success(orderService.getMyOrders(query)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'PROVIDER')")
    @Operation(summary = "Get an order owned by the current buyer or provider")
    public ResponseEntity<ApiResponseDTO<OrderDetailResponse>> getOrderDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(orderService.getOrderDetail(id)));
    }
}
