package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AddSetComponentRequest {

    @NotNull
    @Pattern(regexp = "STOCK|DIRECT", message = "Source must be STOCK or DIRECT")
    private String source;

    @NotNull
    private UUID variantId;

    @NotNull
    @Positive
    private Integer quantity;
}
