package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockSetRequest {

    @NotNull
    @Positive
    private Integer setCount;

    private String reason;
}
