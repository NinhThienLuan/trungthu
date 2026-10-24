package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.entity.ProductImage;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.repository.ProductImageRepository;
import fpt.sba.trungthu.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;

@RestController
@RequestMapping({"/api/products", "/api/public/products"})
@RequiredArgsConstructor
@Tag(name = "Product Catalog", description = "Browse active products and variants with pagination")
public class ProductController {

    private final ProductService productService;
    private final ProductImageRepository productImages;

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

    // ponytail: ảnh vẫn lưu base64 trong DB, endpoint này chỉ giải mã; chuyển sang StorageService (file/CDN) khi cần scale
    @GetMapping("/images/{imageId}")
    @Operation(summary = "Image file of a product album entry (album URLs point here)")
    public ResponseEntity<byte[]> getImage(@PathVariable UUID imageId) {
        String url = productImages.findById(imageId).map(ProductImage::getImageUrl)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));
        int comma = url.indexOf(',');
        if (!url.startsWith("data:") || comma < 0 || !url.substring(0, comma).endsWith(";base64")) {
            return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(url)).build();
        }
        String mime = url.substring(5, comma - ";base64".length());
        if (!mime.matches("image/(jpeg|png|webp|gif)")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mime))
                // id ảnh đổi mỗi lần seller thay album -> cache lâu an toàn
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic().immutable())
                .body(Base64.getDecoder().decode(url.substring(comma + 1)));
    }
}
