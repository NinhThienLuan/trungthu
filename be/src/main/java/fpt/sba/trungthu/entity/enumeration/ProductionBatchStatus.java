package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái của lô sản xuất nướng bánh ra lò.
 */
public enum ProductionBatchStatus {
    // Đã lên kế hoạch nướng theo ngày
    SCHEDULED,

    // Bột và nhân đang trong dây chuyền đóng bánh / lò nướng
    IN_PRODUCTION,

    // Đã nướng xong thành phẩm, sẵn sàng phân phối theo đợt giao
    COMPLETED,

    // Hủy mẻ nướng (do điều chỉnh đơn hoặc sự cố kỹ thuật)
    CANCELLED;

    public boolean canTransitionTo(ProductionBatchStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case SCHEDULED -> target == IN_PRODUCTION || target == CANCELLED;
            case IN_PRODUCTION -> target == COMPLETED || target == CANCELLED;
            case COMPLETED, CANCELLED -> false;
        };
    }

    public void validateTransition(ProductionBatchStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid production batch transition: Cannot change from %s to %s", this, target));
        }
    }
}
