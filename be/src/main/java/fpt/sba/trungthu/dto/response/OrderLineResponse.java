package fpt.sba.trungthu.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class OrderLineResponse {
    private UUID variantId;
    private String productName;
    private String variantName;
    private int quantity;
    private BigDecimal unitPrice;
    private String personalizationText;
    private BigDecimal personalizationFee;
    private BigDecimal subtotal;
}
