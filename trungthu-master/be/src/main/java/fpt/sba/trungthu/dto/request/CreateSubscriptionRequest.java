package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateSubscriptionRequest {
    
    @NotBlank(message = "Plan name is required")
    @Size(max = 255, message = "Plan name must not exceed 255 characters")
    private String planName;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    @NotNull(message = "Max products allowed is required")
    @Min(value = 1, message = "Max products allowed must be at least 1")
    private Integer maxProductsAllowed;
    
    private Boolean isFeatured; // optional, default false
    
    private String paymentProof; // optional - provider can upload payment proof or note
}
