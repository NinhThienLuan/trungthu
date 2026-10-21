package fpt.sba.trungthu.controller;

import tools.jackson.databind.JsonNode;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.PayosPaymentResponse;
import fpt.sba.trungthu.service.impl.PayosPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PayosController {
    private final PayosPaymentService payments;

    @PostMapping("/api/orders/{id}/payos")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<PayosPaymentResponse>> getOrCreate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(payments.getOrCreate(id)));
    }

    @PostMapping("/api/payments/payos/webhook")
    public ResponseEntity<Void> webhook(@RequestBody JsonNode payload) {
        payments.receiveWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
