package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private UUID providerId;
    private String storeName;
    private String name;
    private String description;
    private ProductType productType;
    private Integer shelfLifeDays;
    private fpt.sba.trungthu.entity.enumeration.ProductStatus status;
    private LocalDateTime createdAt;
    private List<ProductVariantResponse> variants;

    /**
     * @param activeVariantsOnly true cho API công khai: khách chỉ thấy biến thể đang bán.
     */
    public static ProductResponse fromEntity(Product product, boolean activeVariantsOnly) {
        return ProductResponse.builder()
                .id(product.getId())
                .providerId(product.getProvider().getId())
                .storeName(product.getProvider().getStoreName())
                .name(product.getName())
                .description(product.getDescription())
                .productType(product.getProductType())
                .shelfLifeDays(product.getShelfLifeDays())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .variants(product.getVariants().stream()
                        .filter(v -> !activeVariantsOnly || fpt.sba.trungthu.entity.enumeration.ProductStatus.ACTIVE == v.getStatus())
                        .map(ProductVariantResponse::fromEntity)
                        .toList())
                .build();
    }
}
