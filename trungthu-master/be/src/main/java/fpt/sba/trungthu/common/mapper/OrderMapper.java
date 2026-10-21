package fpt.sba.trungthu.common.mapper;

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
        return OrderLineResponse.builder().variantId(item.getVariant().getId())
                .productName(item.getProductName()).variantName(item.getVariantName())
                .quantity(item.getQuantity()).unitPrice(item.getUnitPrice()).subtotal(item.getSubtotal())
                .build();
    }
}
