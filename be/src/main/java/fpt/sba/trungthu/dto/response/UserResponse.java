package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private String storeName;
    private boolean complianceApproved;
    private boolean seasonActive;
    private boolean status;
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
                .complianceApproved(user.isComplianceApproved())
                .seasonActive(user.isSeasonActive())
                .status(user.isStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static UserResponse fromUserEntity(User user) {
        return fromEntity(user);
    }
}
