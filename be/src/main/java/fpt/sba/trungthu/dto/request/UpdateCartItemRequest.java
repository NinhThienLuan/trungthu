package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCartItemRequest {

    @Positive
    private Integer quantity;

    private Boolean selected;
}
