package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSetComponentRequest {

    @NotNull
    @PositiveOrZero
    private Integer quantity;
}
