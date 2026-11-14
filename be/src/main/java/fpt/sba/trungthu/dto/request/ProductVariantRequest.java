package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantRequest {

    @NotBlank(message = "Tên phân loại không được để trống")
    @Size(max = 255, message = "Tên phân loại tối đa 255 ký tự")
    private String variantName;

    @NotBlank(message = "SKU không được để trống")
    @Pattern(regexp = "[A-Za-z0-9_-]{1,50}", message = "SKU chỉ gồm chữ, số, '-' hoặc '_' (tối đa 50 ký tự)")
    private String sku;

    @NotNull(message = "Giá là bắt buộc")
    @DecimalMin(value = "0", message = "Giá không được âm")
    @Digits(integer = 16, fraction = 2, message = "Giá không đúng định dạng")
    private BigDecimal price;

    @PositiveOrZero(message = "Tồn kho không được âm")
    private Integer stockQuantity;

    @Positive(message = "Khối lượng phải lớn hơn 0")
    private Integer weightGram;

    private Integer boxCapacity;

    private String status;
}
