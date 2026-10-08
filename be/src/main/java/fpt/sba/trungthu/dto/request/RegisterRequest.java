package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 6, max = 50, message = "Password must be between 6 and 50 characters")
    private String password;

    @NotBlank(message = "Full name cannot be blank")
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @NotBlank(message = "Phone number cannot be blank")
    @Pattern(regexp = "(84|0[3|5|7|8|9])+([0-9]{8})\\b", message = "Phone number is not a valid Vietnamese format")
    private String phone;

    @NotNull(message = "User role is required (BUYER, SELLER)")
    private UserRole role;

    private String storeName;

    public User toUserEntity(PasswordEncoder passwordEncoder) {
        return User.builder()
                .email(this.email != null ? this.email.trim().toLowerCase() : null)
                .password(passwordEncoder != null ? passwordEncoder.encode(this.password) : this.password)
                .fullName(this.fullName != null ? this.fullName.trim() : null)
                .phone(this.phone != null ? this.phone.trim() : null)
                .role(this.role)
                .storeName(this.role == UserRole.SELLER && this.storeName != null ? this.storeName.trim() : null)
                .isComplianceApproved(false)
                .isSeasonActive(true)
                .status(true)
                .build();
    }
}
