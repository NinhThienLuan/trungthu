package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Mã đăng nhập Google không được để trống")
    private String idToken;
}
