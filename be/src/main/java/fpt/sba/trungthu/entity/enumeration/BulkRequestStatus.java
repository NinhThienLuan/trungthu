package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Trạng thái yêu cầu báo giá sỉ doanh nghiệp (B2B Bulk Request / RFQ).
 */
public enum BulkRequestStatus {
    // Khách hàng doanh nghiệp vừa gửi yêu cầu báo giá
    NEW,

    // Sàn đã chuyển tiếp yêu cầu đến các xưởng sản xuất phù hợp
    DISTRIBUTED,

    // Đã có ít nhất một xưởng nộp báo giá cạnh tranh
    QUOTES_RECEIVED,

    // Doanh nghiệp đã chốt hợp đồng với một xưởng (Thành công)
    WON,

    // Doanh nghiệp hủy yêu cầu hoặc không chọn xưởng nào (Thất bại)
    LOST;

    public boolean canTransitionTo(BulkRequestStatus target) {
        if (target == null) {
            return false;
        }
        if (this == target) {
            return true;
        }
        return switch (this) {
            case NEW -> target == DISTRIBUTED || target == LOST;
            case DISTRIBUTED -> target == QUOTES_RECEIVED || target == LOST;
            case QUOTES_RECEIVED -> target == WON || target == LOST;
            case WON, LOST -> false;
        };
    }

    public void validateTransition(BulkRequestStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Invalid bulk request transition: Cannot change from %s to %s", this, target));
        }
    }
}
