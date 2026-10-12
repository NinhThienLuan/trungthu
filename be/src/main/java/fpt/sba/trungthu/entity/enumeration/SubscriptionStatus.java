package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái gói dịch vụ SaaS của Provider trên sàn.
 */
public enum SubscriptionStatus {
    // Đã đăng ký gói, chờ thanh toán phí dịch vụ cho Sàn
    PENDING_PAYMENT,

    // Gói đang có hiệu lực, gian hàng được hiển thị bán trên sàn
    ACTIVE,

    // Tạm khóa hiển thị do khiếu nại hoặc kiểm tra chất lượng
    SUSPENDED,

    // Hết thời hạn thuê gian hàng mùa vụ
    EXPIRED;

    public boolean canTransitionTo(SubscriptionStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case PENDING_PAYMENT -> target == ACTIVE || target == EXPIRED;
            case ACTIVE -> target == SUSPENDED || target == EXPIRED;
            case SUSPENDED -> target == ACTIVE || target == EXPIRED;
            case EXPIRED -> target == PENDING_PAYMENT; // Đăng ký gia hạn mới
        };
    }

    public void validateTransition(SubscriptionStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid subscription status transition: Cannot change from %s to %s", this, target));
        }
    }
}
