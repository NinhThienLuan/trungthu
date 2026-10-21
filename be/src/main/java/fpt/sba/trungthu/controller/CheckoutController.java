package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.CheckoutRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.CheckoutPreviewResponse;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.service.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CheckoutController {
    private final CheckoutService checkoutService;

    @PostMapping("/preview")
    public ResponseEntity<ApiResponseDTO<CheckoutPreviewResponse>> preview(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(ApiResponseDTO.success(checkoutService.preview(request)));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<List<OrderDetailResponse>>> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(ApiResponseDTO.success(checkoutService.checkout(request)));
    }
}
