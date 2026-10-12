package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái tài khoản người dùng / gian hàng.
 */
public enum UserStatus {
    // Tài khoản hoạt động bình thường
    ACTIVE,

    // Tài khoản chưa kích hoạt / chưa xác minh
    INACTIVE,

    // Tài khoản bị tạm khóa do vi phạm chính sách hoặc nợ phí SaaS
    SUSPENDED;

    public boolean canTransitionTo(UserStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case INACTIVE -> target == ACTIVE;
            case ACTIVE -> target == SUSPENDED || target == INACTIVE;
            case SUSPENDED -> target == ACTIVE;
        };
    }

    public void validateTransition(UserStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid user status transition: Cannot change from %s to %s", this, target));
        }
    }
}
