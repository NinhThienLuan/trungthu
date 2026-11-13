package fpt.sba.trungthu.common.mapper;

import java.util.UUID;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.dto.response.OrderLineResponse;
import fpt.sba.trungthu.dto.response.OrderSummaryResponse;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class OrderMapper {

    public OrderSummaryResponse toSummary(Order order, LocalDate deliveryDate, BigDecimal paidAmount) {
        var builder = OrderSummaryResponse.builder();
        populateSummary(builder, order, deliveryDate, paidAmount);
        return builder.build();
    }

    public OrderDetailResponse toDetail(Order order, LocalDate deliveryDate, BigDecimal paidAmount,
            List<OrderItem> items) {
        var builder = OrderDetailResponse.builder();
        populateSummary(builder, order, deliveryDate, paidAmount);
        return builder.receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingAddress(order.getShippingAddress())
                .subtotalAmount(order.getSubtotalAmount())
                .shippingFee(order.getShippingFee())
                .depositAmount(order.getDepositAmount())
                .listAmount(order.getListAmount())
                .discountAmount(order.getDiscountAmount())
                .holdExpiresAt(order.getHoldExpiresAt())
                .lines(items.stream().map(this::toLine).toList())
                .build();
    }

    private void populateSummary(OrderSummaryResponse.OrderSummaryResponseBuilder<?, ?> builder,
            Order order, LocalDate deliveryDate, BigDecimal paidAmount) {
        builder.id(order.getId()).code(order.getOrderCode())
                .providerId(order.getProvider().getId()).storeName(order.getProvider().getStoreName())
                .deliveryDate(deliveryDate).status(order.getOrderStatus()).paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus()).totalAmount(order.getTotalAmount()).paidAmount(paidAmount)
                .remainingAmount(order.getTotalAmount().subtract(paidAmount))
                .createdAt(order.getOrderedAt());
    }

    private OrderLineResponse toLine(OrderItem item) {
        String variantName = item.getVariantName();
        String promoLabel = item.getPromotionLabel();
        String boxContents = item.getBoxContents();
        Integer freeQuantity = item.getFreeQuantity();

        if (promoLabel == null && variantName != null && variantName.contains(" · ")) {
            String[] parts = variantName.split(" · ");
            if (parts.length >= 2) {
                variantName = parts[0];
                for (int i = 1; i < parts.length; i++) {
                    String part = parts[i].trim();
                    if (part.startsWith("Mua ") || part.startsWith("Giảm ") || part.startsWith("Lấy ")
                            || part.startsWith("tặng ")) {
                        promoLabel = promoLabel == null ? part : promoLabel + " · " + part;
                    } else {
                        boxContents = boxContents == null ? part : boxContents + ", " + part;
                    }
                }
            }
        }

        UUID prodId = item.getSourceSet() != null ? item.getSourceSet().getId()
                : (item.getVariant() != null && item.getVariant().getProduct() != null ? item.getVariant().getProduct().getId() : null);

        return OrderLineResponse.builder()
                .productId(prodId)
                .variantId(item.getVariant().getId())
                .sourceSetId(item.getSourceSet() == null ? null : item.getSourceSet().getId())
                .sourceSetName(item.getSourceSet() == null ? null : item.getSourceSet().getName())
                .productName(item.getProductName()).variantName(variantName)
                .quantity(item.getQuantity()).unitPrice(item.getUnitPrice())
                .personalizationText(item.getPersonalizationText())
                .personalizationFee(item.getPersonalizationFee() == null ? BigDecimal.ZERO : item.getPersonalizationFee())
                .subtotal(item.getSubtotal())
                .promotionLabel(promoLabel)
                .boxContents(boxContents)
                .freeQuantity(freeQuantity)
                .purchasedQuantity(item.getPurchasedQuantity() == null ? item.getQuantity() : item.getPurchasedQuantity())
                .build();
    }
}
