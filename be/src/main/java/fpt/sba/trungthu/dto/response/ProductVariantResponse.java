package fpt.sba.trungthu.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer stockQuantity;
    private Integer weightGram;
    private Integer boxCapacity;
    private VariantStatus status;
    private Boolean purchasable;
    private Boolean notifyAvailable;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Boolean hasOrders;

    public static ProductVariantResponse fromEntity(ProductVariant variant, boolean includeStock) {
        ProductStatus productStatus = variant.getProduct() == null ? null : variant.getProduct().getStatus();
        int stock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        boolean onSale = productStatus == ProductStatus.ACTIVE;
        boolean listed = onSale || productStatus == ProductStatus.SOLD_OUT;
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .variantName(variant.getVariantName())
                .sku(variant.getSku())
                .price(variant.getPrice())
                .stockQuantity(includeStock ? variant.getStockQuantity() : null)
                .weightGram(variant.getWeightGram())
                .boxCapacity(variant.getBoxCapacity())
                .status(variant.getStatus())
                .purchasable(onSale && variant.getStatus() == VariantStatus.IN_STOCK && stock > 0)
                .notifyAvailable(listed && variant.getStatus() == VariantStatus.OUT_OF_STOCK)
                .build();
    }
}
