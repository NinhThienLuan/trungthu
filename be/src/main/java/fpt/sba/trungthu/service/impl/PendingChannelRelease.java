package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.dto.request.ReleaseStockCommand;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.OrderBatch;
import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.PaymentTransaction;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.TransactionStatus;
import fpt.sba.trungthu.entity.enumeration.TransactionType;
import fpt.sba.trungthu.repository.OrderItemRepository;
import fpt.sba.trungthu.repository.PaymentTransactionRepository;
import fpt.sba.trungthu.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Releases pending lines. Retail discontinue cancels the whole order. A set discontinue drops only its own lines.
 */
@Service
@RequiredArgsConstructor
class PendingChannelRelease {

    private final OrderItemRepository orderItemRepository;
    private final PaymentTransactionRepository paymentRepository;
    private final InventoryService inventoryService;

    void cancelOrders(List<OrderItem> triggeringLines) {
        if (triggeringLines == null || triggeringLines.isEmpty()) {
            return;
        }
        List<UUID> orderIds = triggeringLines.stream()
                .map(item -> item.getOrderBatch().getOrder().getId())
                .distinct()
                .toList();
        List<OrderItem> lines = orderItemRepository.findAllForOrders(orderIds);
        if (!lines.isEmpty()) {
            inventoryService.release(new ReleaseStockCommand(lines.stream().map(this::toLine).toList()));
        }
        for (UUID orderId : orderIds) {
            Order order = triggeringLines.stream()
                    .map(item -> item.getOrderBatch().getOrder())
                    .filter(candidate -> candidate.getId().equals(orderId))
                    .findFirst()
                    .orElseThrow();
            cancel(order);
        }
    }

    void drop(List<OrderItem> lines) {
        if (lines == null || lines.isEmpty()) {
            return;
        }
        List<UUID> orderIds = lines.stream()
                .map(item -> item.getOrderBatch().getOrder().getId())
                .distinct()
                .toList();
        inventoryService.release(new ReleaseStockCommand(lines.stream().map(this::toLine).toList()));
        orderItemRepository.deleteAll(lines);
        orderItemRepository.flush();
        for (UUID orderId : orderIds) {
            Order order = lines.stream()
                    .map(item -> item.getOrderBatch().getOrder())
                    .filter(candidate -> candidate.getId().equals(orderId))
                    .findFirst()
                    .orElseThrow();
            List<OrderItem> remaining = orderItemRepository.findAllForOrders(List.of(orderId));
            if (remaining.isEmpty()) {
                cancel(order);
            } else {
                keep(order, remaining);
            }
        }
    }

    private void keep(Order order, List<OrderItem> remaining) {
        BigDecimal subtotal = remaining.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        OrderBatch batch = remaining.get(0).getOrderBatch();
        batch.setSubtotal(subtotal);
        BigDecimal shipping = order.getShippingFee() == null ? BigDecimal.ZERO : order.getShippingFee();
        BigDecimal total = subtotal.add(shipping);
        order.setSubtotalAmount(subtotal);
        order.setTotalAmount(total);
        if (order.getDepositAmount().compareTo(total) > 0) {
            order.setDepositAmount(total);
        }
        BigDecimal deposit = order.getDepositAmount();
        if (deposit.signum() <= 0) {
            return;
        }
        for (PaymentTransaction payment : paymentRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())) {
            if (payment.getPaymentStatus() == TransactionStatus.PENDING
                    && payment.getTransactionType() == TransactionType.ORDER_DEPOSIT) {
                payment.setAmount(deposit);
            }
        }
    }

    private void cancel(Order order) {
        for (PaymentTransaction payment : paymentRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())) {
            if (payment.getPaymentStatus() == TransactionStatus.PENDING) {
                payment.transitionPaymentStatus(TransactionStatus.CANCELLED);
            }
        }
        order.transitionOrderStatus(OrderStatus.CANCELLED);
        order.setHoldExpiresAt(null);
    }

    private ReleaseStockCommand.ReleaseLine toLine(OrderItem item) {
        boolean baked = item.getBakeQuantity() > 0 && item.getOrderBatch().getCapacity() != null;
        return new ReleaseStockCommand.ReleaseLine(
                item.getVariant().getId(),
                item.getQuantity(),
                baked ? item.getOrderBatch().getCapacity().getId() : null,
                baked ? item.getBakeQuantity() : 0,
                item.getSourceSet() == null ? null : item.getSourceSet().getId(),
                item.getDirectFromSet() == null ? 0 : item.getDirectFromSet());
    }
}
