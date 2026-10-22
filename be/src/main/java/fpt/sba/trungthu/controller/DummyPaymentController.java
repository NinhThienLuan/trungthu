package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.DummyOrderResponse;
import fpt.sba.trungthu.service.impl.DummyPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dummy")
@RequiredArgsConstructor
@Tag(name = "Dummy payment", description = "Demo-only checkout and payment so inventory flows can be tested")
public class DummyPaymentController {

    private final DummyPaymentService dummyPaymentService;

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Create VietQR orders from selected cart lines and reserve stock")
    public ResponseEntity<ApiResponseDTO<List<DummyOrderResponse>>> checkout() {
        return ResponseEntity.ok(ApiResponseDTO.success(dummyPaymentService.checkout()));
    }

    @PostMapping("/orders/{orderId}/pay")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Pretend the VietQR transfer arrived")
    public ResponseEntity<ApiResponseDTO<DummyOrderResponse>> pay(@PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponseDTO.success(dummyPaymentService.pay(orderId)));
    }

    @PostMapping("/orders/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Cancel an unpaid order and return its stock")
    public ResponseEntity<ApiResponseDTO<DummyOrderResponse>> cancel(@PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponseDTO.success(dummyPaymentService.cancel(orderId)));
    }

    @PostMapping("/provider/orders/{orderId}/advance")
    @PreAuthorize("hasRole('PROVIDER')")
    @Operation(summary = "Move an order to the next production or delivery step")
    public ResponseEntity<ApiResponseDTO<DummyOrderResponse>> advance(@PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponseDTO.success(dummyPaymentService.advance(orderId)));
    }
}
