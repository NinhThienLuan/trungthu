package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;
}
