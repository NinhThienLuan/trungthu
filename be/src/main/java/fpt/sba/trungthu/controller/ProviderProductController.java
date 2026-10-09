package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.ProductImageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/provider/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROVIDER')")
@Tag(name = "Provider Product Management", description = "Endpoints for Providers to CRUD products, variants, and images")
public class ProviderProductController {

    private final ProductService productService;

    private String getAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized access");
        }
        return authentication.getName();
    }

    // ─── Product Endpoints ───────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create a new product with optional initial variants")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> createProduct(
            Authentication authentication,
            @Valid @RequestBody ProductRequest request) {
        String email = getAuthenticatedEmail(authentication);
        ProductResponse response = productService.createProduct(email, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<ProductResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Product created successfully")
                        .data(response)
                        .build());
    }

    @GetMapping
    @Operation(summary = "Get paginated list of products owned by the authenticated Provider")
    public ResponseEntity<ApiResponseDTO<Page<ProductResponse>>> getProviderProducts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String email = getAuthenticatedEmail(authentication);
        Page<ProductResponse> response = productService.getProviderProducts(email, page, size);
        return ResponseEntity.ok(ApiResponseDTO.success("Fetched provider products successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product details by ID")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> getProductById(
            Authentication authentication,
            @PathVariable UUID id) {
        String email = getAuthenticatedEmail(authentication);
        ProductResponse response = productService.getProductById(email, id);
        return ResponseEntity.ok(ApiResponseDTO.success("Fetched product successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product (name, description, status)")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> updateProduct(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody ProductRequest request) {
        String email = getAuthenticatedEmail(authentication);
        ProductResponse response = productService.updateProduct(email, id, request);
        return ResponseEntity.ok(ApiResponseDTO.success("Product updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product and all its variants & images (including Cloudinary)")
    public ResponseEntity<ApiResponseDTO<Void>> deleteProduct(
            Authentication authentication,
            @PathVariable UUID id) {
        String email = getAuthenticatedEmail(authentication);
        productService.deleteProduct(email, id);
        return ResponseEntity.ok(ApiResponseDTO.success("Product deleted successfully", null));
    }

    // ─── Variant Endpoints ───────────────────────────────────────────────

    @PostMapping("/{id}/variants")
    @Operation(summary = "Add a new variant to a product")
    public ResponseEntity<ApiResponseDTO<ProductVariantResponse>> addVariant(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody ProductVariantRequest request) {
        String email = getAuthenticatedEmail(authentication);
        ProductVariantResponse response = productService.addVariant(email, id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<ProductVariantResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Variant added successfully")
                        .data(response)
                        .build());
    }

    @PutMapping("/variants/{variantId}")
    @Operation(summary = "Update an existing variant")
    public ResponseEntity<ApiResponseDTO<ProductVariantResponse>> updateVariant(
            Authentication authentication,
            @PathVariable UUID variantId,
            @Valid @RequestBody ProductVariantRequest request) {
        String email = getAuthenticatedEmail(authentication);
        ProductVariantResponse response = productService.updateVariant(email, variantId, request);
        return ResponseEntity.ok(ApiResponseDTO.success("Variant updated successfully", response));
    }

    @DeleteMapping("/variants/{variantId}")
    @Operation(summary = "Delete a variant and all its images (including Cloudinary)")
    public ResponseEntity<ApiResponseDTO<Void>> deleteVariant(
            Authentication authentication,
            @PathVariable UUID variantId) {
        String email = getAuthenticatedEmail(authentication);
        productService.deleteVariant(email, variantId);
        return ResponseEntity.ok(ApiResponseDTO.success("Variant deleted successfully", null));
    }

    // ─── Image Endpoints (Cloudinary Upload) ─────────────────────────────

    @PostMapping(value = "/variants/{variantId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload an image file for a variant (stored on Cloudinary)")
    public ResponseEntity<ApiResponseDTO<ProductImageResponse>> uploadImage(
            Authentication authentication,
            @PathVariable UUID variantId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", defaultValue = "false") Boolean isPrimary,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder) {
        String email = getAuthenticatedEmail(authentication);
        ProductImageResponse response = productService.uploadImage(email, variantId, file, isPrimary, displayOrder);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<ProductImageResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Image uploaded successfully")
                        .data(response)
                        .build());
    }

    @DeleteMapping("/images/{imageId}")
    @Operation(summary = "Delete an image (also removes from Cloudinary)")
    public ResponseEntity<ApiResponseDTO<Void>> deleteImage(
            Authentication authentication,
            @PathVariable UUID imageId) {
        String email = getAuthenticatedEmail(authentication);
        productService.deleteImage(email, imageId);
        return ResponseEntity.ok(ApiResponseDTO.success("Image deleted successfully", null));
    }
}
