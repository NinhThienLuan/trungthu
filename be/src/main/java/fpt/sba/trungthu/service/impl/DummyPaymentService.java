package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.CreateOrdersCommand;
import fpt.sba.trungthu.dto.request.ReleaseStockCommand;
import fpt.sba.trungthu.dto.request.ReserveStockCommand;
import fpt.sba.trungthu.dto.response.DummyOrderResponse;
import fpt.sba.trungthu.dto.response.ReservedLineResponse;
import fpt.sba.trungthu.entity.CartItem;
import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.PaymentTransaction;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.OrderPaymentStatus;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import fpt.sba.trungthu.entity.enumeration.TransactionStatus;
import fpt.sba.trungthu.repository.CartItemRepository;
import fpt.sba.trungthu.repository.DailyCapacityRepository;
import fpt.sba.trungthu.repository.OrderItemRepository;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.PaymentTransactionRepository;
import fpt.sba.trungthu.service.InventoryService;
import fpt.sba.trungthu.service.OrderService;
import fpt.sba.trungthu.service.event.StockChangedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Demo-only stand-in for BE3 Checkout and VietQR confirmation. Uses the real reserve/release and order persistence.
 */
@Service
@RequiredArgsConstructor
public class DummyPaymentService {

    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");

    private final SecurityContextService securityContextService;
    private final CartItemRepository cartItemRepository;
    private final DailyCapacityRepository capacityRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentTransactionRepository paymentRepository;
    private final InventoryService inventoryService;
    private final OrderService orderService;
    private final org.springframework.context.ApplicationEventPublisher events;

    @Transactional(rollbackFor = Exception.class)
    public List<DummyOrderResponse> checkout() {
        User customer = securityContextService.getCurrentUser();
        List<CartItem> selected = cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .filter(item -> Boolean.TRUE.equals(item.getSelected()))
                .toList();
        if (selected.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa chọn sản phẩm nào để thanh toán");
        }
        LocalDate deliveryDate = LocalDate.now(VIETNAM).plusDays(4);
        List<ReserveStockCommand.ReserveLine> reserveLines = new ArrayList<>();
        for (CartItem item : selected) {
            User provider = item.getSetProduct() != null
                    ? item.getSetProduct().getProvider()
                    : item.getVariant().getProduct().getProvider();
            ensureCapacity(provider, deliveryDate.minusDays(1));
            reserveLines.add(item.getSetProduct() != null
                    ? new ReserveStockCommand.ReserveLine(null, item.getQuantity(), deliveryDate, item.getSetProduct().getId())
                    : new ReserveStockCommand.ReserveLine(item.getVariant().getId(), item.getQuantity(), deliveryDate));
        }
        List<ReservedLineResponse> reserved = inventoryService.reserve(new ReserveStockCommand(reserveLines));

        Map<UUID, List<ReservedLineResponse>> byProvider = new LinkedHashMap<>();
        for (ReservedLineResponse line : reserved) {
            byProvider.computeIfAbsent(line.providerId(), id -> new ArrayList<>()).add(line);
        }
        Instant orderedAt = Instant.now();
        List<CreateOrdersCommand.ProviderOrder> groups = new ArrayList<>();
        for (Map.Entry<UUID, List<ReservedLineResponse>> entry : byProvider.entrySet()) {
            List<CreateOrdersCommand.ItemSnapshot> items = entry.getValue().stream()
                    .map(line -> new CreateOrdersCommand.ItemSnapshot(line.variantId(), line.productName(),
                            line.variantName(), line.quantity(), line.unitPrice(), line.bakeQuantity(),
                            line.sourceSetId(), line.directUnits()))
                    .toList();
            BigDecimal subtotal = entry.getValue().stream()
                    .map(line -> line.unitPrice().multiply(BigDecimal.valueOf(line.quantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal list = entry.getValue().stream()
                    .map(line -> line.listUnitPrice().multiply(BigDecimal.valueOf(line.quantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal discount = list.subtract(subtotal).max(BigDecimal.ZERO);
            UUID capacityId = entry.getValue().stream()
                    .map(ReservedLineResponse::capacityId)
                    .filter(java.util.Objects::nonNull)
                    .findFirst()
                    .orElse(null);
            groups.add(new CreateOrdersCommand.ProviderOrder(entry.getKey(), deliveryDate, capacityId,
                    BigDecimal.ZERO, subtotal, PaymentMethod.VIETQR, orderedAt.plusSeconds(900), list, discount, items));
        }
        List<Order> orders = orderService.createOrders(new CreateOrdersCommand(UUID.randomUUID(), customer.getId(),
                orderedAt, customer.getFullName(),
                customer.getPhone() == null ? "0900000000" : customer.getPhone(),
                customer.getAddress() == null ? "Địa chỉ demo" : customer.getAddress(),
                null, groups));
        cartItemRepository.deleteAll(selected);
        return orders.stream().map(this::toResponse).toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public DummyOrderResponse pay(UUID orderId) {
        Order order = customerOrder(orderId);
        if (order.getOrderStatus() != OrderStatus.PENDING_DEPOSIT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Đơn không còn chờ thanh toán");
        }
        if (order.getHoldExpiresAt() != null && !Instant.now().isBefore(order.getHoldExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Đơn đã quá hạn giữ hàng");
        }
        Instant paidAt = Instant.now();
        for (PaymentTransaction payment : paymentRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())) {
            if (payment.getPaymentStatus() == TransactionStatus.PENDING) {
                payment.transitionPaymentStatus(TransactionStatus.SUCCESS);
                payment.setPaidAt(paidAt);
            }
        }
        order.transitionOrderStatus(OrderStatus.DEPOSITED);
        order.setHoldExpiresAt(null);
        order.transitionPaymentStatus(order.getDepositAmount().compareTo(order.getTotalAmount()) >= 0
                ? OrderPaymentStatus.PAID_FULL
                : OrderPaymentStatus.DEPOSITED);
        inventoryService.recordSale(order.getId());
        return toResponse(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public DummyOrderResponse cancel(UUID orderId) {
        Order order = customerOrder(orderId);
        if (order.getOrderStatus() != OrderStatus.PENDING_DEPOSIT && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ hủy được đơn chưa cọc hoặc COD chưa sản xuất");
        }
        List<ReleaseStockCommand.ReleaseLine> lines = orderItemRepository.findAllForOrders(List.of(order.getId()))
                .stream()
                .map(this::releaseLine)
                .toList();
        if (!lines.isEmpty()) {
            inventoryService.release(new ReleaseStockCommand(lines));
        }
        for (PaymentTransaction payment : paymentRepository.findByOrderIdOrderByCreatedAtAsc(order.getId())) {
            if (payment.getPaymentStatus() == TransactionStatus.PENDING) {
                payment.transitionPaymentStatus(TransactionStatus.CANCELLED);
            }
        }
        order.transitionOrderStatus(OrderStatus.CANCELLED);
        order.setHoldExpiresAt(null);
        return toResponse(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public DummyOrderResponse advance(UUID orderId) {
        User provider = securityContextService.getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .filter(found -> found.getProvider().getId().equals(provider.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        OrderStatus next = switch (order.getOrderStatus()) {
            case CONFIRMED, DEPOSITED -> OrderStatus.BAKING_QUEUED;
            case BAKING_QUEUED -> OrderStatus.DELIVERING;
            case DELIVERING -> OrderStatus.COMPLETED;
            default -> throw new ResponseStatusException(HttpStatus.CONFLICT, "Đơn không chuyển tiếp được");
        };
        OrderStatus previous = order.getOrderStatus();
        order.transitionOrderStatus(next);
        if (previous == OrderStatus.CONFIRMED) {
            inventoryService.recordSale(order.getId());
        }
        if (next == OrderStatus.COMPLETED && order.getPaymentStatus() != OrderPaymentStatus.PAID_FULL) {
            order.transitionPaymentStatus(OrderPaymentStatus.PAID_FULL);
        }
        orderItemRepository.findByOrderBatchOrderId(order.getId())
                .forEach(item -> events.publishEvent(new StockChangedEvent(item.getVariant().getId())));
        return toResponse(order);
    }

    private ReleaseStockCommand.ReleaseLine releaseLine(OrderItem item) {
        boolean ovenHeld = item.getBakeQuantity() > 0 && item.getOrderBatch().getCapacity() != null;
        return new ReleaseStockCommand.ReleaseLine(item.getVariant().getId(), item.getQuantity(),
                ovenHeld ? item.getOrderBatch().getCapacity().getId() : null,
                ovenHeld ? item.getBakeQuantity() : 0,
                item.getSourceSet() == null ? null : item.getSourceSet().getId(),
                item.getDirectFromSet() == null ? 0 : item.getDirectFromSet());
    }

    private void ensureCapacity(User provider, LocalDate bakeDate) {
        if (capacityRepository.lockByProviderAndDate(provider.getId(), bakeDate).isEmpty()) {
            capacityRepository.saveAndFlush(DailyCapacity.builder()
                    .provider(provider)
                    .capacityDate(bakeDate)
                    .maxQuantity(1000)
                    .reservedQuantity(0)
                    .build());
        }
    }

    private Order customerOrder(UUID orderId) {
        User customer = securityContextService.getCurrentUser();
        return orderRepository.findById(orderId)
                .filter(order -> order.getCustomer().getId().equals(customer.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private DummyOrderResponse toResponse(Order order) {
        return new DummyOrderResponse(order.getId(), order.getOrderCode(), order.getOrderStatus(),
                order.getPaymentStatus(), order.getTotalAmount());
    }
}
