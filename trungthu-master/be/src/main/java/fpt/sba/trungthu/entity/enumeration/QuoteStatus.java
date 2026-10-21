package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái của báo giá từ Provider cho yêu cầu sỉ B2B (ProviderQuotation).
 */
public enum QuoteStatus {
    // Xưởng đã nộp báo giá, đang chờ khách hàng duyệt
    SUBMITTED,

    // Khách hàng đồng ý ký hợp đồng theo báo giá này
    ACCEPTED,

    // Khách hàng từ chối báo giá (chọn xưởng khác hoặc giá cao)
    REJECTED,

    // Báo giá đã quá thời hạn cam kết giá
    EXPIRED;

    public boolean canTransitionTo(QuoteStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case SUBMITTED -> target == ACCEPTED || target == REJECTED || target == EXPIRED;
            case ACCEPTED, REJECTED, EXPIRED -> false;
        };
    }

    public void validateTransition(QuoteStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid quote status transition: Cannot change from %s to %s", this, target));
        }
    }
}
