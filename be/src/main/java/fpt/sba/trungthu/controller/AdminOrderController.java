package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.AdminOrderResponse;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class AdminOrderController {
    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "List orders across all stores, optionally filtered by status, newest first")
    public ApiResponseDTO<PageResponse<AdminOrderResponse>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return ApiResponseDTO.success(orderService.getAdminOrders(status, page, size));
    }
}
