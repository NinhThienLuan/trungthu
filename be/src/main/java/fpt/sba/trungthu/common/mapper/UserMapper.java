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
        // Một nguồn duy nhất: thêm field ở UserResponse.fromUserEntity là đủ
        return user == null ? null : UserResponse.fromUserEntity(user);
    }
}
