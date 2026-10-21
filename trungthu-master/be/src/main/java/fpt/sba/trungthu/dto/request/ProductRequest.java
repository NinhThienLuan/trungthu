package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.enumeration.ProductType;
import jakarta.validation.constraints.*;
import lombok.*;

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

    @Pattern(regexp = "ACTIVE|HIDDEN", message = "Status must be ACTIVE or HIDDEN")
    private String status;
}
