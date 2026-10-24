package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.ReleaseStockCommand;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.entity.*;
import fpt.sba.trungthu.entity.enumeration.*;
import fpt.sba.trungthu.repository.*;
import fpt.sba.trungthu.service.InventoryService;
import fpt.sba.trungthu.service.OrderLifecycleService;
import fpt.sba.trungthu.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderLifecycleServiceImpl implements OrderLifecycleService {
    private final SecurityContextService security;
    private final OrderRepository orders;
    private final OrderBatchRepository batches;
    private final OrderItemRepository items;
    private final PaymentTransactionRepository payments;
    private final OrderService orderService;
    private final InventoryService inventory;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderDetailResponse confirmDeposit(UUID id, BigDecimal receivedAmount) {
        Order order = lockedOwned(id, true);
        Instant now = Instant.now();
        requireActiveHold(order, now);
        if (receivedAmount == null || receivedAmount.compareTo(order.getDepositAmount()) < 0
                || receivedAmount.compareTo(order.getTotalAmount()) > 0) {
            throw conflict("Received amount must be between deposit and order total");
        }
        PaymentTransaction pending = payments.findByOrderIdOrderByCreatedAtAsc(id).stream()
                .filter(tx -> tx.getTransactionType() == TransactionType.ORDER_DEPOSIT
                        && tx.getPaymentStatus() == TransactionStatus.PENDING)
                .findFirst().orElseThrow(() -> conflict("Pending deposit transaction not found"));
        pending.setAmount(receivedAmount);
        pending.setPaidAt(now);
        pending.transitionPaymentStatus(TransactionStatus.SUCCESS);
        order.transitionPaymentStatus(receivedAmount.compareTo(order.getTotalAmount()) == 0
                ? OrderPaymentStatus.PAID_FULL : OrderPaymentStatus.DEPOSITED);
        order.transitionOrderStatus(OrderStatus.DEPOSITED);
        order.setHoldExpiresAt(null);
        return orderService.getOrderDetail(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderDetailResponse cancel(UUID id) {
        Order order = lockedOwned(id, false);
        if (order.getOrderStatus() != OrderStatus.PENDING_DEPOSIT
                && !(order.getOrderStatus() == OrderStatus.CONFIRMED && order.getPaymentMethod() == PaymentMethod.COD)) {
            throw conflict("Order can no longer be cancelled through this API");
        }
        cancelAndRelease(order);
        return orderService.getOrderDetail(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderDetailResponse changeStatus(UUID id, OrderStatus target, BigDecimal collectedAmount) {
        Order order = lockedOwned(id, true);
        if (target != OrderStatus.BAKING_QUEUED && target != OrderStatus.DELIVERING
                && target != OrderStatus.COMPLETED) throw badRequest("Unsupported target order status");
        order.getOrderStatus().validateTransition(target);
        if (target == OrderStatus.COMPLETED) {
            BigDecimal paid = payments.sumSuccessfulAmountByOrderId(id);
            BigDecimal remaining = order.getTotalAmount().subtract(paid);
            if (remaining.signum() < 0) throw conflict("Recorded payments exceed order total");
            if (remaining.signum() == 0) {
                if (collectedAmount != null && collectedAmount.signum() != 0) throw conflict("Order is already paid in full");
            } else {
                if (collectedAmount == null || collectedAmount.compareTo(remaining) != 0) {
                    throw conflict("Full remaining amount must be collected to complete delivery");
                }
                payments.save(PaymentTransaction.builder().order(order)
                        .transactionCode("BAL-" + order.getOrderCode())
                        .transactionType(TransactionType.ORDER_BALANCE)
                        .paymentMethod(order.getPaymentMethod()).amount(remaining)
                        .paymentStatus(TransactionStatus.SUCCESS).paidAt(Instant.now()).build());
            }
            if (order.getPaymentStatus() != OrderPaymentStatus.PAID_FULL) {
                order.transitionPaymentStatus(OrderPaymentStatus.PAID_FULL);
            }
        } else if (collectedAmount != null) {
            throw badRequest("collectedAmount is only accepted when completing delivery");
        }
        order.transitionOrderStatus(target);
        return orderService.getOrderDetail(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void expire(UUID id) {
        Order order = orders.findForUpdateById(id).orElse(null);
        if (order != null && order.getOrderStatus() == OrderStatus.PENDING_DEPOSIT
                && order.getHoldExpiresAt() != null && !Instant.now().isBefore(order.getHoldExpiresAt())) {
            cancelAndRelease(order);
        }
    }

    private Order lockedOwned(UUID id, boolean sellerOnly) {
        User user = security.getCurrentUser();
        Order order = orders.findForUpdateById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!user.getId().equals(order.getProvider().getId())
                && (sellerOnly || !user.getId().equals(order.getCustomer().getId()))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }

    private void requireActiveHold(Order order, Instant now) {
        if (order.getOrderStatus() != OrderStatus.PENDING_DEPOSIT || order.getPaymentMethod() != PaymentMethod.VIETQR
                || order.getHoldExpiresAt() == null || !now.isBefore(order.getHoldExpiresAt())) {
            throw conflict("Deposit hold is no longer active");
        }
    }

    private void cancelAndRelease(Order order) {
        OrderBatch batch = batches.findByOrderId(order.getId())
                .orElseThrow(() -> new IllegalStateException("Order batch missing"));
        UUID capacityId = batch.getCapacity() == null ? null : batch.getCapacity().getId();
        List<ReleaseStockCommand.ReleaseLine> lines = items.findByOrderBatchOrderId(order.getId()).stream()
                .sorted(Comparator.comparing(item -> item.getVariant().getId()))
                .map(line -> new ReleaseStockCommand.ReleaseLine(line.getVariant().getId(), line.getQuantity(),
                        line.getBakeQuantity() > 0 ? capacityId : null, line.getBakeQuantity(),
                        line.getSourceSet() == null ? null : line.getSourceSet().getId(),
                        line.getDirectFromSet() == null ? 0 : line.getDirectFromSet()))
                .toList();
        if (!lines.isEmpty()) {
            inventory.release(new ReleaseStockCommand(lines));
        }
        for (PaymentTransaction tx : payments.findByOrderIdOrderByCreatedAtAsc(order.getId())) {
            if (tx.getPaymentStatus() == TransactionStatus.PENDING) {
                tx.transitionPaymentStatus(TransactionStatus.CANCELLED);
            }
        }
        order.transitionOrderStatus(OrderStatus.CANCELLED);
        order.setHoldExpiresAt(null);
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
