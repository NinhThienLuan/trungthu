package fpt.sba.trungthu.common.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Bộ kiểm tra chuyển đổi trạng thái đơn hàng (Order & OrderBatch).
 * Sử dụng switch-case nghiêm ngặt để ngăn chặn các bước nhảy trạng thái phi logic trong vòng đời đơn hàng.
 */
public final class OrderStatusTransitionValidator {

    private OrderStatusTransitionValidator() {}

    /**
     * Xác thực tính hợp lệ khi chuyển đổi trạng thái qua enum OrderStatus.
     */
    public static void validateTransition(fpt.sba.trungthu.entity.enumeration.OrderStatus current,
                                          fpt.sba.trungthu.entity.enumeration.OrderStatus target) {
        if (current == null || target == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order status cannot be null");
        }
        current.validateTransition(target);
    }

    /**
     * Xác thực tính hợp lệ khi chuyển đổi trạng thái đơn hàng (dạng String).
     *
     * @param currentStatus Trạng thái hiện tại
     * @param targetStatus  Trạng thái đích muốn cập nhật
     * @throws ResponseStatusException nếu bước chuyển trạng thái không hợp lệ (HTTP 400)
     */
    public static void validateTransition(String currentStatus, String targetStatus) {
        if (currentStatus == null || targetStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status values cannot be null");
        }

        if (currentStatus.equalsIgnoreCase(targetStatus)) {
            // Không có sự thay đổi trạng thái
            return;
        }

        String cur = currentStatus.toUpperCase();
        String target = targetStatus.toUpperCase();

        boolean isValid = switch (cur) {
            // PENDING: Đơn vừa khởi tạo, đang chờ người mua đặt cọc 50% hoặc người bán xác nhận
            case "PENDING" -> "CONFIRMED".equals(target) || "CANCELLED".equals(target);

            // CONFIRMED: Đã xác nhận đơn hàng / đã cọc, xưởng chuẩn bị xếp lịch nướng bánh
            case "CONFIRMED" -> "PROCESSING".equals(target) || "CANCELLED".equals(target);

            // PROCESSING: Bánh đang trong lò nướng hoặc đang đóng gói hộp quà custom
            case "PROCESSING" -> "SHIPPING".equals(target);

            // SHIPPING: Đơn hàng đang được shipper bàn giao đến tay người nhận
            case "SHIPPING" -> "DELIVERED".equals(target) || "FAILED_DELIVERY".equals(target);

            // FAILED_DELIVERY: Giao hàng thất bại, có thể xếp lịch giao lại hoặc hủy
            case "FAILED_DELIVERY" -> "SHIPPING".equals(target) || "CANCELLED".equals(target);

            // DELIVERED: Đã giao hàng thành công (Trạng thái kết thúc - Terminal State)
            case "DELIVERED" -> false;

            // CANCELLED: Đơn đã hủy (Trạng thái kết thúc - Terminal State)
            case "CANCELLED" -> false;

            default -> false;
        };

        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid status transition: Cannot change status from '%s' to '%s'", currentStatus, targetStatus));
        }
    }
}
