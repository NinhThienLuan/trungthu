package fpt.sba.trungthu.common.mapper;

import fpt.sba.trungthu.dto.ProductView;
import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product, ProductView view) {
        if (product == null) {
            return null;
        }
        return ProductResponse.fromEntity(product, view);
    }

    public ProductVariantResponse toVariantResponse(ProductVariant variant, boolean includeStock) {
        if (variant == null) {
            return null;
        }
        return ProductVariantResponse.fromEntity(variant, includeStock);
    }

    public Product toEntity(ProductRequest request, User provider) {
        return Product.builder()
                .provider(provider)
                .name(request.getName().trim())
                .description(request.getDescription())
                .productType(request.getProductType())
                .status(ProductStatus.DRAFT)
                .build();
    }

    public void updateEntity(Product product, ProductRequest request) {
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setProductType(request.getProductType());
        if (product.getProductType() == fpt.sba.trungthu.entity.enumeration.ProductType.GIFT_SET) {
            product.setSalePrice(request.getSalePrice());
        } else if (request.getSalePrice() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only a gift set can be discounted");
        }
    }

    public void updateVariantEntity(ProductVariant variant, ProductVariantRequest request, String normalizedSku) {
        variant.setVariantName(request.getVariantName().trim());
        variant.setSku(normalizedSku);
        variant.setPrice(request.getPrice());
        variant.setWeightGram(request.getWeightGram());
        variant.setBoxCapacity(request.getBoxCapacity());
    }

    public ProductStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }
        try {
            return ProductStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be DRAFT, ACTIVE, or ARCHIVED");
        }
    }
}
