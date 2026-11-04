package fpt.sba.trungthu.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import fpt.sba.trungthu.common.policy.CheckoutLeadTime;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.UUID;

public class InventoryConflictException extends ResponseStatusException {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Details(String code, UUID providerId, UUID variantId, Integer availableStock,
            Integer requestedQuantity, LocalDate bakeDate, Integer remainingCapacity) {}

    private final Details details;

    public InventoryConflictException(String code, UUID providerId, UUID variantId, LocalDate bakeDate) {
        this(code, providerId, variantId, bakeDate, null, null, null, null);
    }

    private InventoryConflictException(String code, UUID providerId, UUID variantId, LocalDate bakeDate,
            String message, Integer availableStock, Integer requestedQuantity, Integer remainingCapacity) {
        super(HttpStatus.CONFLICT, message != null ? message : switch (code) {
            case "INSUFFICIENT_STOCK" -> "Xưởng không đủ hàng cho số lượng đã chọn. Vui lòng giảm số lượng hoặc chọn bánh tươi với ngày nhận cách ít nhất "
                    + CheckoutLeadTime.EXTENDED_DAYS + " ngày.";
            case "INSUFFICIENT_CAPACITY" -> "Xưởng không đủ suất nướng cho ngày nhận đã chọn. Vui lòng giảm số lượng hoặc chọn ngày khác.";
            default -> "Không thể giữ hàng cho đơn này. Vui lòng kiểm tra lại giỏ hàng.";
        });
        this.details = new Details(code, providerId, variantId, availableStock, requestedQuantity, bakeDate,
                remainingCapacity);
    }

    public static InventoryConflictException stock(UUID providerId, UUID variantId, String productName,
            int availableStock, int requestedQuantity, boolean canBakeLater) {
        String name = productName == null || productName.isBlank() ? "Sản phẩm" : "Sản phẩm " + productName;
        String message = name + " chỉ còn " + Math.max(0, availableStock)
                + " cái, không đủ số lượng yêu cầu. Vui lòng giảm số lượng."
                + (canBakeLater ? " Chọn ngày nhận cách ít nhất " + CheckoutLeadTime.EXTENDED_DAYS
                        + " ngày để xưởng nướng theo đơn." : "");
        return new InventoryConflictException("INSUFFICIENT_STOCK", providerId, variantId, null,
                message, Math.max(0, availableStock), requestedQuantity, null);
    }

    public static InventoryConflictException capacity(UUID providerId, LocalDate bakeDate,
            int remainingCapacity, int requestedQuantity) {
        String message = "Xưởng chỉ còn " + Math.max(0, remainingCapacity) + " suất nướng cho ngày " + bakeDate
                + ", không đủ " + requestedQuantity + " suất yêu cầu. Vui lòng giảm số lượng hoặc chọn ngày khác.";
        return new InventoryConflictException("INSUFFICIENT_CAPACITY", providerId, null, bakeDate,
                message, null, requestedQuantity, Math.max(0, remainingCapacity));
    }

    public Details details() {
        return details;
    }
}
