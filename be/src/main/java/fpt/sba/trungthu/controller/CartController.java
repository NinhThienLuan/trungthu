package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.AddCartItemRequest;
import fpt.sba.trungthu.dto.request.UpdateCartItemRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.CartLineResponse;
import fpt.sba.trungthu.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;
    private final SecurityContextService securityContextService;

    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<CartLineResponse>>> list() {
        return ResponseEntity.ok(ApiResponseDTO.success(
                cartService.list(securityContextService.getCurrentUserEmail())));
    }

    @PostMapping
    public ResponseEntity<ApiResponseDTO<CartLineResponse>> add(@Valid @RequestBody AddCartItemRequest request) {
        CartLineResponse line = cartService.add(securityContextService.getCurrentUserEmail(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<CartLineResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Added to cart")
                        .data(line)
                        .build());
    }

    @PatchMapping("/{variantId}")
    public ResponseEntity<ApiResponseDTO<CartLineResponse>> update(
            @PathVariable UUID variantId, @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(ApiResponseDTO.success(
                cartService.update(securityContextService.getCurrentUserEmail(), variantId, request)));
    }

    @DeleteMapping("/{variantId}")
    public ResponseEntity<ApiResponseDTO<Void>> remove(@PathVariable UUID variantId) {
        cartService.remove(securityContextService.getCurrentUserEmail(), variantId);
        return ResponseEntity.ok(ApiResponseDTO.success("Removed", null));
    }

    @PostMapping("/{variantId}/swap/{targetVariantId}")
    public ResponseEntity<ApiResponseDTO<CartLineResponse>> swap(
            @PathVariable UUID variantId, @PathVariable UUID targetVariantId) {
        return ResponseEntity.ok(ApiResponseDTO.success(
                cartService.swapVariant(securityContextService.getCurrentUserEmail(), variantId, targetVariantId)));
    }
}
