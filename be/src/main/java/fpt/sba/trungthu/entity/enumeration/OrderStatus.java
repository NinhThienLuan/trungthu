package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái của đơn hàng tổng thể (Order).
 * Sử dụng switch-case để kiểm soát luồng chuyển đổi trạng thái nghiêm ngặt.
 */
public enum OrderStatus {
    // Đơn vừa khởi tạo, chờ thanh toán cọc hoặc chờ nhà cung cấp xác nhận
    PENDING,

    // Đã xác nhận đơn hàng / đã nhận cọc, đưa vào kế hoạch nướng bánh
    CONFIRMED,

    // Bánh đang trong lò nướng hoặc đang đóng gói hộp quà custom
    PROCESSING,

    // Đơn hàng đang được shipper bàn giao đến tay người nhận
    SHIPPING,

    // Đã giao hàng thành công (Trạng thái kết thúc thành công)
    DELIVERED,

    // Đơn hàng đã hủy (Trạng thái kết thúc hủy)
    CANCELLED;

    /**
     * Kiểm tra tính hợp lệ khi chuyển đổi trạng thái đơn hàng qua switch-case.
     *
     * @param target Trạng thái đích muốn cập nhật
     * @return true nếu chuyển đổi hợp lệ
     */
    public boolean canTransitionTo(OrderStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case PENDING -> target == CONFIRMED || target == CANCELLED;
            case CONFIRMED -> target == PROCESSING || target == CANCELLED;
            case PROCESSING -> target == SHIPPING;
            case SHIPPING -> target == DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }

    /**
     * Xác thực chuyển đổi trạng thái và ném ngoại lệ nếu vi phạm.
     */
    public void validateTransition(OrderStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid order transition: Cannot change from %s to %s", this, target));
        }
    }
}
