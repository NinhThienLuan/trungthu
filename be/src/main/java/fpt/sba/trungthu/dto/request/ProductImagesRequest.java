package fpt.sba.trungthu.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImagesRequest {

    @NotNull(message = "Images are required")
    @Valid
    @Builder.Default
    private List<ProductImageRequest> images = new ArrayList<>();
}
