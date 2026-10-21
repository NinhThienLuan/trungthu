package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.OrderQueryRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
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

@RestController
@RequestMapping("/api/provider/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROVIDER')")
@Tag(name = "Provider Orders", description = "Provider reads orders belonging to their own store")
public class ProviderOrderController {
    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "List my store orders, filtered by status and inclusive delivery dates")
    public ResponseEntity<ApiResponseDTO<PageResponse<OrderSummaryResponse>>> getProviderOrders(
            @Valid @ModelAttribute OrderQueryRequest query) {
        return ResponseEntity.ok(ApiResponseDTO.success(orderService.getProviderOrders(query)));
    }
}
