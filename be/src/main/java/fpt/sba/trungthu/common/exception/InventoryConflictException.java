package fpt.sba.trungthu.common.exception;

import fpt.sba.trungthu.common.policy.CheckoutLeadTime;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/** 409 khi giữ hàng: thiếu tồn kho hoặc hết suất nướng. Có tên món / ngày nhận thì ghi rõ để khách biết sửa gì */
public class InventoryConflictException extends ResponseStatusException {
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public InventoryConflictException(String code, UUID providerId, UUID variantId, LocalDate bakeDate) {
        this(code, providerId, variantId, bakeDate, null);
    }

    /** itemName: tên sản phẩm + phân loại thiếu hàng (null nếu không xác định) */
    public InventoryConflictException(String code, UUID providerId, UUID variantId, LocalDate bakeDate, String itemName) {
        super(HttpStatus.CONFLICT, switch (code) {
            case "INSUFFICIENT_STOCK" -> (itemName == null ? "Xưởng không đủ hàng" : "Không đủ hàng: " + itemName)
                    + " cho số lượng đã chọn. Vui lòng giảm số lượng hoặc chọn bánh tươi với ngày nhận cách ít nhất "
                    + CheckoutLeadTime.EXTENDED_DAYS + " ngày.";
            // Bánh nướng hôm trước cho đơn nhận hôm sau: ngày nhận = ngày nướng + 1
            case "INSUFFICIENT_CAPACITY" -> "Xưởng không đủ suất nướng cho ngày nhận "
                    + (bakeDate == null ? "đã chọn" : bakeDate.plusDays(1).format(DAY))
                    + ". Vui lòng giảm số lượng hoặc chọn ngày khác.";
            default -> "Không thể giữ hàng cho đơn này. Vui lòng kiểm tra lại giỏ hàng.";
        });
    }
}
