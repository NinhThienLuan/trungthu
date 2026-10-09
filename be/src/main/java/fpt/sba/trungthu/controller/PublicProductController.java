package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/products")
@RequiredArgsConstructor
@Tag(name = "Public Products", description = "Browse active products & variants (no login required)")
public class PublicProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List active products, optionally filtered by type")
    public ResponseEntity<ApiResponseDTO<List<ProductResponse>>> getProducts(
            @RequestParam(required = false) ProductType type) {
        return ResponseEntity.ok(ApiResponseDTO.success(productService.getPublicProducts(type)));
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Get active product detail with its active variants")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> getProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(ApiResponseDTO.success(productService.getPublicProduct(productId)));
    }
}
