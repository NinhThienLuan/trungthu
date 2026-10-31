package fpt.sba.trungthu.common.exception;

import fpt.sba.trungthu.common.policy.CheckoutLeadTime;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.UUID;

public class InventoryConflictException extends ResponseStatusException {

    public InventoryConflictException(String code, UUID providerId, UUID variantId, LocalDate bakeDate) {
        super(HttpStatus.CONFLICT, switch (code) {
            case "INSUFFICIENT_STOCK" -> "Xưởng không đủ hàng cho số lượng đã chọn. Vui lòng giảm số lượng hoặc chọn bánh tươi với ngày nhận cách ít nhất "
                    + CheckoutLeadTime.EXTENDED_DAYS + " ngày.";
            case "INSUFFICIENT_CAPACITY" -> "Xưởng không đủ suất nướng cho ngày nhận đã chọn. Vui lòng giảm số lượng hoặc chọn ngày khác.";
            default -> "Không thể giữ hàng cho đơn này. Vui lòng kiểm tra lại giỏ hàng.";
        });
    }
}
