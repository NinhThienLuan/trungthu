package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private String storeName;
    private String address;
    private String bankCode;
    private String bankAccountNumber;
    private String bankAccountName;
    private fpt.sba.trungthu.entity.enumeration.UserStatus status;
    private Boolean isComplianceApproved;
    private Boolean isSeasonActive;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .storeName(user.getStoreName())
                .address(user.getAddress())
                .bankCode(user.getBankCode())
                .bankAccountNumber(user.getBankAccountNumber())
                .bankAccountName(user.getBankAccountName())
                .status(user.getStatus())
                .isComplianceApproved(user.getIsComplianceApproved())
                .isSeasonActive(user.getIsSeasonActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static UserResponse fromUserEntity(User user) {
        return fromEntity(user);
    }
}
