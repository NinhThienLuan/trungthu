package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AddCartItemRequest {

    private UUID variantId;

    private UUID setProductId;

    @NotNull
    @Positive
    private Integer quantity;
}
