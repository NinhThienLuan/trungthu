package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.OrderQueryRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.BakeSheetResponse;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.dto.response.OrderSummaryResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Buyer and seller read their own orders")
public class OrderController {
    private final OrderService orderService;

    @GetMapping("/api/orders/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "List my orders, filtered by status and inclusive delivery dates")
    public ResponseEntity<ApiResponseDTO<PageResponse<OrderSummaryResponse>>> getMyOrders(
            @Valid @ModelAttribute OrderQueryRequest query) {
        return ResponseEntity.ok(ApiResponseDTO.success(orderService.getMyOrders(query)));
    }

    @GetMapping({"/api/provider/orders", "/api/orders/provider"})
    @PreAuthorize("hasRole('PROVIDER')")
    @Operation(summary = "List my store orders, filtered by status and inclusive delivery dates")
    public ResponseEntity<ApiResponseDTO<PageResponse<OrderSummaryResponse>>> getProviderOrders(
            @Valid @ModelAttribute OrderQueryRequest query) {
        return ResponseEntity.ok(ApiResponseDTO.success(orderService.getProviderOrders(query)));
    }

    @GetMapping("/api/orders/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'PROVIDER')")
    @Operation(summary = "Get an order owned by the current buyer or provider")
    public ResponseEntity<ApiResponseDTO<OrderDetailResponse>> getOrderDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(orderService.getOrderDetail(id)));
    }

    @GetMapping("/api/provider/bake-sheet")
    @PreAuthorize("hasRole('PROVIDER')")
    @Operation(summary = "Get daily bake sheet for provider")
    public ResponseEntity<ApiResponseDTO<List<BakeSheetResponse>>> getBakeSheet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponseDTO.success(orderService.getBakeSheet(date)));
    }
}
