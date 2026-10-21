package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái xử lý khiếu nại (Complaint).
 */
public enum ComplaintStatus {
    // Khiếu nại mới mở từ phía người mua
    OPEN,

    // Admin hoặc Provider đang kiểm tra video unboxing / đối soát
    IN_PROGRESS,

    // Đã giải quyết thỏa đáng (hoàn tiền, đổi bánh mới)
    RESOLVED,

    // Bị bác bỏ / từ chối (không có video mở hộp hoặc bánh hỏng do bảo quản sai)
    REJECTED;

    public boolean canTransitionTo(ComplaintStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case OPEN -> target == IN_PROGRESS || target == REJECTED;
            case IN_PROGRESS -> target == RESOLVED || target == REJECTED;
            case RESOLVED, REJECTED -> false;
        };
    }

    public void validateTransition(ComplaintStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid complaint status transition: Cannot change from %s to %s", this, target));
        }
    }
}
