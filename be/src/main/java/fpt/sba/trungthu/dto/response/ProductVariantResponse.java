package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.ProductVariant;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {
    private UUID id;
    private String variantName;
    private String sku;
    private BigDecimal price;
    private Integer stockQuantity;
    private Integer weightGram;
    private Integer boxCapacity;
    private String status;

    public static ProductVariantResponse fromEntity(ProductVariant variant) {
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
}
