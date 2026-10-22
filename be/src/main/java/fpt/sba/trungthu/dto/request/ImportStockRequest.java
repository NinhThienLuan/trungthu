package fpt.sba.trungthu.dto.request;

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
public class ImportStockRequest {

    @NotNull(message = "Quantity is required")
    @Positive(message = "Imported quantity must be greater than 0")
    private Integer quantity;

    @NotBlank(message = "Lý do nhập kho là bắt buộc")
    @Size(max = 500, message = "Lý do tối đa 500 ký tự")
    private String reason;
}
