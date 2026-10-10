package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/provider/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROVIDER')")
@Tag(name = "Provider Products", description = "Provider manages own products & variants (SKU, price, stock)")
public class ProviderProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List my products with all variants (including hidden)")
    public ResponseEntity<ApiResponseDTO<List<ProductResponse>>> getMyProducts(Authentication authentication) {
        return ResponseEntity.ok(ApiResponseDTO.success(productService.getMyProducts(authentication.getName())));
    }

    @PostMapping
    @Operation(summary = "Create a product (LOOSE_CAKE requires shelfLifeDays)")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> createProduct(
            Authentication authentication, @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<ProductResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Product created successfully")
                        .data(response)
                        .build());
    }

    @PutMapping("/{productId}")
    @Operation(summary = "Update product info, or hide it with status=HIDDEN")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> updateProduct(
            Authentication authentication, @PathVariable UUID productId, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponseDTO.success("Product updated successfully",
                productService.updateProduct(authentication.getName(), productId, request)));
    }

    @PostMapping("/{productId}/variants")
    @Operation(summary = "Add a variant (LOOSE_CAKE needs weightGram, BOX_SHELL needs boxCapacity 2/4/6)")
    public ResponseEntity<ApiResponseDTO<ProductVariantResponse>> addVariant(
            Authentication authentication, @PathVariable UUID productId, @Valid @RequestBody ProductVariantRequest request) {
        ProductVariantResponse response = productService.addVariant(authentication.getName(), productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<ProductVariantResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Variant created successfully")
                        .data(response)
                        .build());
    }

    @PutMapping("/{productId}/variants/{variantId}")
    @Operation(summary = "Update variant price/stock/info, or hide it with status=HIDDEN")
    public ResponseEntity<ApiResponseDTO<ProductVariantResponse>> updateVariant(
            Authentication authentication, @PathVariable UUID productId, @PathVariable UUID variantId,
            @Valid @RequestBody ProductVariantRequest request) {
        return ResponseEntity.ok(ApiResponseDTO.success("Variant updated successfully",
                productService.updateVariant(authentication.getName(), productId, variantId, request)));
    }
}
