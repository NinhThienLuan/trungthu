package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CheckoutPreviewResponse(List<ProviderPrice> groups, BigDecimal grandTotal) {
    public record ProviderPrice(UUID providerId, String storeName, LocalDate deliveryDate,
            PaymentMethod paymentMethod, List<Line> lines, BigDecimal merchandiseAmount,
            BigDecimal personalizationFee, BigDecimal shippingFee, BigDecimal totalAmount,
            BigDecimal depositAmount, BigDecimal subtotalAmount, BigDecimal minDepositAmount,
            boolean codAllowed) {}

    public record Line(UUID variantId, String productName, String variantName, int quantity,
            BigDecimal unitPrice, BigDecimal personalizationFee, BigDecimal subtotal) {}
}
