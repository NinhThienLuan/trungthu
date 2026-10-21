package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/api/products", "/api/public/products"})
@RequiredArgsConstructor
@Tag(name = "Product Catalog", description = "Browse active products and variants with pagination")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List active products with pagination, total count, and optional type filter")
    public ResponseEntity<ApiResponseDTO<PageResponse<ProductResponse>>> getProducts(
            @RequestParam(required = false) ProductType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<ProductResponse> pagedProducts = productService.getProducts(type, pageable);
        return ResponseEntity.ok(ApiResponseDTO.success(pagedProducts));
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Get active product detail with active variants")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> getProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(ApiResponseDTO.success(productService.getProductDetail(productId)));
    }
}
