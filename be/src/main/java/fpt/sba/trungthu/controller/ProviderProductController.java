package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/provider/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROVIDER')")
@Tag(name = "Provider Products", description = "Provider manages own products & variants (SKU, price, stock)")
public class ProviderProductController {

    private final ProductService productService;
    private final SecurityContextService securityContextService;

    @GetMapping
    @Operation(summary = "List my products with all variants, supporting pagination and total count")
    public ResponseEntity<ApiResponseDTO<?>> getMyProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        
        // Nếu client truyền page/size thì trả về PageResponse chuẩn, ngược lại trả về List tương thích
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            PageResponse<ProductResponse> pagedResult = productService.getMyProducts(providerEmail, pageable);
            return ResponseEntity.ok(ApiResponseDTO.success(pagedResult));
        }

        List<ProductResponse> listResult = productService.getMyProducts(providerEmail);
        return ResponseEntity.ok(ApiResponseDTO.success(listResult));
    }

    @PostMapping
    @Operation(summary = "Create a product")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        ProductResponse response = productService.createProduct(providerEmail, request);
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
            @PathVariable UUID productId, @Valid @RequestBody ProductRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Product updated successfully",
                productService.updateProduct(providerEmail, productId, request)));
    }

    @PostMapping("/{productId}/variants")
    @Operation(summary = "Add a variant (LOOSE_CAKE needs weightGram, BOX_SHELL needs boxCapacity > 0)")
    public ResponseEntity<ApiResponseDTO<ProductVariantResponse>> addVariant(
            @PathVariable UUID productId, @Valid @RequestBody ProductVariantRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        ProductVariantResponse response = productService.addVariant(providerEmail, productId, request);
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
            @PathVariable UUID productId, @PathVariable UUID variantId,
            @Valid @RequestBody ProductVariantRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Variant updated successfully",
                productService.updateVariant(providerEmail, productId, variantId, request)));
    }
}
