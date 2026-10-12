package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái thanh toán (cho Order và PaymentTransaction).
 */
public enum PaymentStatus {
    // Đang chờ giao dịch / chuyển khoản
    PENDING,

    // Giao dịch thành công, tiền đã chuyển
    SUCCESS,

    // Giao dịch thất bại (lỗi kết nối, thẻ lỗi)
    FAILED,

    // Đã hoàn tiền lại cho khách hàng
    REFUNDED,

    // Hết thời gian chờ thanh toán (hết 15 phút giữ chỗ)
    EXPIRED;

    /**
     * Kiểm tra chuyển đổi trạng thái thanh toán qua switch-case.
     */
    public boolean canTransitionTo(PaymentStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case PENDING -> target == SUCCESS || target == FAILED || target == EXPIRED;
            case SUCCESS -> target == REFUNDED;
            case FAILED -> target == PENDING; // Cho phép thử lại
            case REFUNDED, EXPIRED -> false;
        };
    }

    public void validateTransition(PaymentStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid payment transition: Cannot change from %s to %s", this, target));
        }
    }
}
