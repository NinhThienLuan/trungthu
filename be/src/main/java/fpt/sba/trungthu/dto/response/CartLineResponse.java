package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class CartLineResponse {
    private UUID variantId;
    private UUID setProductId;
    private UUID productId;
    private String productName;
    private String variantName;
    private BigDecimal price;
    private Integer quantity;
    private Integer stockQuantity;
    private VariantStatus status;
    private boolean selected;
    private boolean buyable;
}
