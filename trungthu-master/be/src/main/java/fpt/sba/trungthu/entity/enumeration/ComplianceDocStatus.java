package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái xét duyệt tài liệu pháp lý tuân thủ của Provider.
 */
public enum ComplianceDocStatus {
    // Chờ Admin xem xét duyệt
    PENDING,

    // Đã được Admin phê duyệt hợp lệ
    APPROVED,

    // Bị từ chối do mờ, sai thông tin hoặc hết hạn
    REJECTED,

    // Tài liệu đã quá thời hạn hiệu lực (hết hạn giấy phép ATTP)
    EXPIRED;

    public boolean canTransitionTo(ComplianceDocStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case PENDING -> target == APPROVED || target == REJECTED;
            case REJECTED -> target == PENDING; // Nộp lại tài liệu mới
            case APPROVED -> target == EXPIRED;
            case EXPIRED -> target == PENDING; // Gia hạn tài liệu
        };
    }

    public void validateTransition(ComplianceDocStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid compliance document status transition: Cannot change from %s to %s", this, target));
        }
    }
}
