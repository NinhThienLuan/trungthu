package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Reset token cannot be blank")
    private String token;

    @NotBlank(message = "New password cannot be blank")
    @Size(min = 6, max = 50, message = "Password must be between 6 and 50 characters")
    private String newPassword;
}
