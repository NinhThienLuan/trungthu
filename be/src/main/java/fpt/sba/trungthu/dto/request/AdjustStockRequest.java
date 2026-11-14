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

    @NotNull(message = "Loại điều chỉnh là bắt buộc")
    private InventoryAuditType type;

    @NotNull(message = "Số lượng là bắt buộc")
    @Positive(message = "Số lượng điều chỉnh phải lớn hơn 0")
    private Integer quantity;

    @NotBlank(message = "Lý do là bắt buộc")
    @Size(max = 500, message = "Lý do tối đa 500 ký tự")
    private String reason;
}
