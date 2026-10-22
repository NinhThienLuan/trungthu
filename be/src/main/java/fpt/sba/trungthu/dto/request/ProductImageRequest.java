package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageRequest {

    @NotBlank(message = "Ảnh không được để trống")
    @Size(max = 2_000_000, message = "Ảnh quá lớn")
    private String imageUrl;

    @NotNull(message = "Primary flag is required")
    private Boolean isPrimary;

    @NotNull(message = "Display order is required")
    @PositiveOrZero(message = "Display order must not be negative")
    private Integer displayOrder;
}
