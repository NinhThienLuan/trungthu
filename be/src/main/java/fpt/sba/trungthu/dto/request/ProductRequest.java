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

    @NotBlank(message = "Product name cannot be blank")
    @Size(max = 255, message = "Product name cannot exceed 255 characters")
    private String name;

    @Size(max = 100000, message = "Description is too long")
    private String description;

    @NotNull(message = "Product type is required (LOOSE_CAKE, BOX_SHELL, GREETING_CARD, ADDON_SERVICE)")
    private ProductType productType;

    @Pattern(regexp = "DRAFT|ACTIVE|ARCHIVED", message = "Status must be DRAFT, ACTIVE, or ARCHIVED")
    private String status;

    @DecimalMin(value = "0", message = "Discounted price cannot be negative")
    @Digits(integer = 16, fraction = 2)
    private BigDecimal salePrice;
}
