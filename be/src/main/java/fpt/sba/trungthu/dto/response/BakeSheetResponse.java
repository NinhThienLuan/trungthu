package fpt.sba.trungthu.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BakeSheetResponse {
    private UUID variantId;
    private String productName;
    private String variantName;
    private int bakeQuantity;
    private List<String> orderCodes;
}
