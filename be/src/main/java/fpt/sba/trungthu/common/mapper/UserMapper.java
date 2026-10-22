package fpt.sba.trungthu.common.mapper;

import fpt.sba.trungthu.dto.response.UserResponse;
import fpt.sba.trungthu.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    /**
     * Chuyển đổi từ User Entity sang UserResponse DTO
     */
    public UserResponse toResponse(User user) {
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
}
