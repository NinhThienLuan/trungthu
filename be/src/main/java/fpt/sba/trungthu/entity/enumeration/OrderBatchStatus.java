package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái của từng đợt giao bánh (OrderBatch).
 * Kiểm soát luồng sản xuất nướng bánh theo ngày của xưởng.
 */
public enum OrderBatchStatus {
    // Chờ xếp lịch vào hạn ngạch lò nướng theo ngày
    PENDING_BAKING,

    // Đã xếp vào danh sách lò nướng trong ngày
    BAKING_QUEUED,

    // Bánh đã ra lò và đang được vận chuyển đến điểm nhận
    DELIVERING,

    // Đợt bánh đã được giao thành công tới khách
    DELIVERED,

    // Đợt giao đã bị hủy
    CANCELLED;

    /**
     * Kiểm tra tính hợp lệ khi chuyển đổi trạng thái đợt bánh qua switch-case.
     */
    public boolean canTransitionTo(OrderBatchStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case PENDING_BAKING -> target == BAKING_QUEUED || target == CANCELLED;
            case BAKING_QUEUED -> target == DELIVERING || target == CANCELLED;
            case DELIVERING -> target == DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    /**
     * Xác thực chuyển đổi trạng thái đợt giao bánh.
     */
    public void validateTransition(OrderBatchStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid order batch transition: Cannot change from %s to %s", this, target));
        }
    }
}
