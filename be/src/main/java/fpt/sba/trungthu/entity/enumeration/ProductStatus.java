package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái hiển thị và kinh doanh của sản phẩm hoặc biến thể.
 */
public enum ProductStatus {
    // Đang mở bán công khai trên sàn
    ACTIVE,

    // Tạm ẩn khỏi danh mục (chỉ Provider mới thấy)
    HIDDEN,

    // Tạm thời hết hàng (vẫn hiển thị nhưng không cho đặt thêm)
    OUT_OF_STOCK;

    /**
     * Kiểm tra tính hợp lệ khi chuyển đổi trạng thái sản phẩm qua switch-case.
     */
    public boolean canTransitionTo(ProductStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case ACTIVE -> target == HIDDEN || target == OUT_OF_STOCK;
            case HIDDEN -> target == ACTIVE;
            case OUT_OF_STOCK -> target == ACTIVE || target == HIDDEN;
        };
    }

    public void validateTransition(ProductStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid product status transition: Cannot change from %s to %s", this, target));
        }
    }
}
