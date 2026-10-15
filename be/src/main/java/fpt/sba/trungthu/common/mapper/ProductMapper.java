package fpt.sba.trungthu.common.mapper;

import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class ProductMapper {

    /**
     * Chuyển đổi từ Product Entity sang ProductResponse DTO
     * @param product Entity sản phẩm
     * @param activeVariantsOnly Nếu là true (cho khách xem), chỉ lấy các biến thể ACTIVE
     */
    public ProductResponse toResponse(Product product, boolean activeVariantsOnly) {
        if (product == null) {
            return null;
        }

        List<ProductVariantResponse> variantResponses = Collections.emptyList();
        if (product.getVariants() != null) {
            variantResponses = product.getVariants().stream()
                    .filter(v -> !activeVariantsOnly || ProductStatus.ACTIVE == v.getStatus())
                    .map(this::toVariantResponse)
                    .toList();
        }

        return ProductResponse.builder()
                .id(product.getId())
                .providerId(product.getProvider() != null ? product.getProvider().getId() : null)
                .storeName(product.getProvider() != null ? product.getProvider().getStoreName() : null)
                .name(product.getName())
                .description(product.getDescription())
                .productType(product.getProductType())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .variants(variantResponses)
                .build();
    }

    /**
     * Chuyển đổi từ ProductVariant Entity sang ProductVariantResponse DTO
     */
    public ProductVariantResponse toVariantResponse(ProductVariant variant) {
        if (variant == null) {
            return null;
        }
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .variantName(variant.getVariantName())
                .sku(variant.getSku())
                .price(variant.getPrice())
                .stockQuantity(variant.getStockQuantity())
                .weightGram(variant.getWeightGram())
                .boxCapacity(variant.getBoxCapacity())
                .status(variant.getStatus())
                .build();
    }

    /**
     * Khởi tạo Product Entity mới từ ProductRequest
     */
    public Product toEntity(ProductRequest request, User provider) {
        ProductStatus status = ProductStatus.ACTIVE;
        if (request.getStatus() != null) {
            try {
                status = ProductStatus.valueOf(request.getStatus().trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        return Product.builder()
                .provider(provider)
                .name(request.getName().trim())
                .description(request.getDescription())
                .productType(request.getProductType())
                .status(status)
                .build();
    }

    /**
     * Cập nhật thông tin Product Entity từ ProductRequest
     */
    public void updateEntity(Product product, ProductRequest request) {
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setProductType(request.getProductType());
        if (request.getStatus() != null) {
            try {
                product.setStatus(ProductStatus.valueOf(request.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
    }

    /**
     * Cập nhật thông tin ProductVariant Entity từ ProductVariantRequest
     */
    public void updateVariantEntity(ProductVariant variant, ProductVariantRequest request, String normalizedSku) {
        variant.setVariantName(request.getVariantName().trim());
        variant.setSku(normalizedSku);
        variant.setPrice(request.getPrice());
        variant.setStockQuantity(request.getStockQuantity());
        variant.setWeightGram(request.getWeightGram());
        variant.setBoxCapacity(request.getBoxCapacity());
        if (request.getStatus() != null) {
            try {
                variant.setStatus(ProductStatus.valueOf(request.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }
    }
}
