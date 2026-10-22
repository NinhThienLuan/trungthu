package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.GiftSetComponent;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class GiftSetComponentResponse {
    private UUID id;
    private UUID variantId;
    private UUID productId;
    private String productName;
    private String variantName;
    private ProductType productType;
    private Integer perSetQuantity;
    private Integer quantity;
    private Integer directQuantity;
    private BigDecimal price;
    private Integer weightGram;
    private Integer boxCapacity;

    public static GiftSetComponentResponse fromEntity(GiftSetComponent component) {
        ProductVariant variant = component.getComponentVariant();
        return GiftSetComponentResponse.builder()
                .id(component.getId())
                .variantId(variant.getId())
                .productId(variant.getProduct().getId())
                .productName(variant.getProduct().getName())
                .variantName(variant.getVariantName())
                .productType(variant.getProduct().getProductType())
                .perSetQuantity(component.getPerSetQuantity())
                .quantity(component.getQuantity())
                .directQuantity(component.getDirectQuantity())
                .price(variant.getPrice())
                .weightGram(variant.getWeightGram())
                .boxCapacity(variant.getBoxCapacity())
                .build();
    }
}
