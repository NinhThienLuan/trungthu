package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.BulkDeliveryRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.BulkOrderResponse;
import fpt.sba.trungthu.service.impl.BulkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class BulkOrderController {
    private final BulkOrderService service;

    @GetMapping("/api/bulk-orders/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<List<BulkOrderResponse>>> mine() {
        return ResponseEntity.ok(ApiResponseDTO.success(service.mine()));
    }

    @GetMapping("/api/provider/bulk-orders")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<List<BulkOrderResponse>>> providerOrders() {
        return ResponseEntity.ok(ApiResponseDTO.success(service.providerOrders()));
    }

    @PutMapping("/api/bulk-orders/{id}/delivery")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> delivery(@PathVariable UUID id,
            @Valid @RequestBody BulkDeliveryRequest input) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.setDelivery(id, input)));
    }

    @PostMapping("/api/bulk-orders/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.cancel(id)));
    }

    @PostMapping("/api/provider/bulk-orders/{id}/deposit")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> deposit(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.confirmDeposit(id)));
    }

    @PostMapping("/api/provider/bulk-orders/{id}/days/{dayId}/complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> completeDay(@PathVariable UUID id, @PathVariable UUID dayId) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.completeDay(id, dayId)));
    }

    @PostMapping("/api/provider/bulk-orders/{id}/dispatch")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> dispatch(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.dispatch(id)));
    }

    @PostMapping("/api/provider/bulk-orders/{id}/delivered")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> delivered(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.delivered(id)));
    }

    @PostMapping("/api/provider/bulk-orders/{id}/balance")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> balance(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.confirmBalance(id)));
    }
}
