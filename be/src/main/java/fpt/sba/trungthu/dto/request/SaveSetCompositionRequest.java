package fpt.sba.trungthu.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class SaveSetCompositionRequest {

    @NotNull
    @Valid
    private Line box;

    @NotEmpty
    private List<@NotNull @Valid Line> cakes;

    @Getter
    @Setter
    public static class Line {
        @NotNull
        private UUID variantId;

        @NotNull
        @Positive
        private Integer quantity;
    }
}
