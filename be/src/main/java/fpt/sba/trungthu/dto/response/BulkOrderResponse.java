package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.BulkOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record BulkOrderResponse(UUID id, UUID requestId, UUID quoteId, String requestCode,
        String providerName, int quantity, int cakesPerBox, BigDecimal unitPrice,
        BigDecimal grossAmount, BigDecimal discountAmount, BigDecimal totalAmount,
        BigDecimal depositAmount, LocalDate deliveryDate, LocalDateTime depositDeadline,
        String recipientName, String recipientPhone, String deliveryAddress,
        BulkOrderStatus status, List<Day> productionDays) {
    public record Day(UUID id, LocalDate date, int cakes, boolean completed) {}
}
