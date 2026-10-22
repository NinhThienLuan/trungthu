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

    @NotBlank(message = "Variant name cannot be blank")
    @Size(max = 255, message = "Variant name cannot exceed 255 characters")
    private String variantName;

    @NotBlank(message = "SKU cannot be blank")
    @Pattern(regexp = "[A-Za-z0-9_-]{1,50}", message = "SKU may only contain letters, digits, '-' or '_' (max 50)")
    private String sku;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0", message = "Price must not be negative")
    @Digits(integer = 16, fraction = 2, message = "Price has invalid format")
    private BigDecimal price;

    @PositiveOrZero(message = "Stock quantity must not be negative")
    private Integer stockQuantity;

    @Positive(message = "Weight must be positive")
    private Integer weightGram;

    private Integer boxCapacity;

    private String status;
}
