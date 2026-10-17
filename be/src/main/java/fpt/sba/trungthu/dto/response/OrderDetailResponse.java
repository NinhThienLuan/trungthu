package fpt.sba.trungthu.dto.response;

import lombok.Getter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@SuperBuilder
public class OrderDetailResponse extends OrderSummaryResponse {
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private BigDecimal subtotalAmount;
    private BigDecimal shippingFee;
    private BigDecimal depositAmount;
    private Instant holdExpiresAt;
    private List<OrderLineResponse> lines;
}
