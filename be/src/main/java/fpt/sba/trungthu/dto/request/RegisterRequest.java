package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

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

    @NotBlank(message = "Full name cannot be blank")
    @Size(max = 255, message = "Full name cannot exceed 255 characters")
    private String fullName;

    @Pattern(regexp = "(84|0[3|5|7|8|9])+([0-9]{8})\\b", message = "Phone number is not a valid Vietnamese format")
    private String phone;

    @NotNull(message = "User role is required (CUSTOMER, PROVIDER)")
    private UserRole role;

    private String storeName;
    
    private String address;

    // Bank info for Provider (required for VietQR)
    private String bankCode;
    
    private String bankAccountNumber;
    
    private String bankAccountName;

    public User toUserEntity(String encodedPassword) {
        return User.builder()
                .email(this.email != null ? this.email.trim().toLowerCase() : null)
                .password(encodedPassword)
                .fullName(this.fullName != null ? this.fullName.trim() : null)
                .phone(this.phone != null ? this.phone.trim() : null)
                .role(this.role)
                .storeName(this.role == UserRole.PROVIDER && this.storeName != null ? this.storeName.trim() : null)
                .address(this.address != null ? this.address.trim() : null)
                .bankCode(this.bankCode != null ? this.bankCode.trim().toUpperCase() : null)
                .bankAccountNumber(this.bankAccountNumber != null ? this.bankAccountNumber.trim() : null)
                .bankAccountName(this.bankAccountName != null ? this.bankAccountName.trim().toUpperCase() : null)
                .isComplianceApproved(false)
                .isSeasonActive(true)
                .status(UserStatus.ACTIVE)
                .build();
    }
}
