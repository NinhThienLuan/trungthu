package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Vòng đời hiển thị của dòng sản phẩm. Khác với trạng thái bán của từng variant.
 */
public enum ProductStatus {
    DRAFT,
    ACTIVE,
    SOLD_OUT,
    ARCHIVED;

    public boolean canTransitionTo(ProductStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case DRAFT -> target == ACTIVE || target == ARCHIVED;
            case ACTIVE -> target == SOLD_OUT || target == ARCHIVED;
            case SOLD_OUT -> target == ACTIVE || target == ARCHIVED;
            case ARCHIVED -> false;
        };
    }

    public void validateTransition(ProductStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid product status transition: Cannot change from %s to %s", this, target));
        }
    }
}
