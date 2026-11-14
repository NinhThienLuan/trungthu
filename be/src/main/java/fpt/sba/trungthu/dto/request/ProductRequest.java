package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.enumeration.ProductType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255, message = "Tên sản phẩm tối đa 255 ký tự")
    private String name;

    @Size(max = 100000, message = "Mô tả quá dài")
    private String description;
    @Size(max = 100000, message = "Câu chuyện sản phẩm quá dài")
    private String story;
    @Size(max = 100000, message = "Nguyên liệu quá dài")
    private String ingredients;

    @NotNull(message = "Loại sản phẩm là bắt buộc")
    private ProductType productType;

    @Pattern(regexp = "DRAFT|ACTIVE|ARCHIVED", message = "Trạng thái phải là DRAFT, ACTIVE hoặc ARCHIVED")
    private String status;

    @DecimalMin(value = "0", message = "Giá chiết khấu không được âm")
    @Digits(integer = 16, fraction = 2)
    private BigDecimal salePrice;
}
