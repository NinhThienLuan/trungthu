package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiscontinueVariantRequest {

    @NotBlank(message = "Lý do là bắt buộc")
    @Size(max = 500, message = "Lý do tối đa 500 ký tự")
    private String reason;
}
