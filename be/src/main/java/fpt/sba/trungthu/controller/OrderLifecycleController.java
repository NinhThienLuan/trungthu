package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.service.OrderLifecycleService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class OrderLifecycleController {
    private final OrderLifecycleService lifecycle;

    public record DepositRequest(@NotNull @DecimalMin("0.01") BigDecimal receivedAmount) {}
    public record StatusRequest(@NotNull OrderStatus status, BigDecimal collectedAmount) {}

    @PostMapping("/api/provider/orders/{id}/confirm-deposit")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<OrderDetailResponse>> confirmDeposit(@PathVariable UUID id,
            @Valid @RequestBody DepositRequest request) {
        return ResponseEntity.ok(ApiResponseDTO.success(lifecycle.confirmDeposit(id, request.receivedAmount())));
    }

    @PostMapping("/api/orders/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'PROVIDER')")
    public ResponseEntity<ApiResponseDTO<OrderDetailResponse>> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(lifecycle.cancel(id)));
    }

    @PatchMapping("/api/provider/orders/{id}/status")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<OrderDetailResponse>> changeStatus(@PathVariable UUID id,
            @Valid @RequestBody StatusRequest request) {
        return ResponseEntity.ok(ApiResponseDTO.success(
                lifecycle.changeStatus(id, request.status(), request.collectedAmount())));
    }
}
