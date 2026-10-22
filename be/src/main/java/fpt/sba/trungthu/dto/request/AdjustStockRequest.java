package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdjustStockRequest {

    @NotNull(message = "Adjustment type is required")
    private InventoryAuditType type;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Adjustment quantity must be greater than 0")
    private Integer quantity;

    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
}
