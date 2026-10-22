package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ProviderDashboardResponse;
import fpt.sba.trungthu.dto.response.VariantOrderStatsResponse;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.repository.InventoryAuditRepository;
import fpt.sba.trungthu.repository.OrderItemRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class OrderStatsService {

    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final Set<OrderStatus> SOLD = EnumSet.of(
            OrderStatus.DEPOSITED, OrderStatus.BAKING_QUEUED, OrderStatus.DELIVERING, OrderStatus.COMPLETED);
    private static final int TOP = 5;

    private final SecurityContextService securityContextService;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final OrderItemRepository orderItemRepository;
    private final InventoryAuditRepository auditRepository;

    public enum Granularity { DAY, MONTH, YEAR }

    @Transactional(readOnly = true)
    public VariantOrderStatsResponse variantStats(String providerEmail, UUID productId, UUID variantId,
            Granularity granularity) {
        var product = productRepository.findByIdAndProviderEmail(productId, providerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        variantRepository.findByIdAndProductId(variantId, product.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));

        Map<UUID, Order> orders = new LinkedHashMap<>();
        for (OrderItem item : orderItemRepository.findWithOrderByVariantId(variantId)) {
            Order order = item.getOrderBatch().getOrder();
            orders.putIfAbsent(order.getId(), order);
        }
        LocalDate today = LocalDate.now(VIETNAM);
        Map<OrderStatus, Long> todayByStatus = emptyCounts();
        long cancelledToday = 0;
        for (Order order : orders.values()) {
            if (orderedOn(order).equals(today)) {
                todayByStatus.merge(order.getOrderStatus(), 1L, Long::sum);
            }
            if (order.getOrderStatus() == OrderStatus.CANCELLED && order.getUpdatedAt() != null
                    && order.getUpdatedAt().toLocalDate().equals(today)) {
                cancelledToday++;
            }
        }
        long placedToday = todayByStatus.values().stream().mapToLong(Long::longValue).sum();
        LocalDateTime start = today.atStartOfDay();
        long soldToday = auditRepository.findOrderIdsByTypeBetween(variantId, InventoryAuditType.ORDER_SALE,
                start, start.plusDays(1)).stream().filter(java.util.Objects::nonNull).count();
        return new VariantOrderStatsResponse(placedToday, soldToday, cancelledToday, todayByStatus,
                series(orders.values(), granularity, today));
    }

    @Transactional(readOnly = true)
    public VariantOrderStatsResponse setStats(String providerEmail, UUID productId, Granularity granularity) {
        Product product = productRepository.findByIdAndProviderEmail(productId, providerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (product.getProductType() != ProductType.GIFT_SET) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order stats of this kind belong to a gift set");
        }
        Map<UUID, Order> orders = new LinkedHashMap<>();
        for (OrderItem item : orderItemRepository.findForSet(productId)) {
            orders.putIfAbsent(item.getOrderBatch().getOrder().getId(), item.getOrderBatch().getOrder());
        }
        LocalDate today = LocalDate.now(VIETNAM);
        Map<OrderStatus, Long> todayByStatus = emptyCounts();
        long cancelledToday = 0;
        for (Order order : orders.values()) {
            if (orderedOn(order).equals(today)) {
                todayByStatus.merge(order.getOrderStatus(), 1L, Long::sum);
            }
            if (order.getOrderStatus() == OrderStatus.CANCELLED && order.getUpdatedAt() != null
                    && order.getUpdatedAt().toLocalDate().equals(today)) {
                cancelledToday++;
            }
        }
        long placedToday = todayByStatus.values().stream().mapToLong(Long::longValue).sum();
        long soldToday = orders.values().stream()
                .filter(order -> SOLD.contains(order.getOrderStatus()) && orderedOn(order).equals(today))
                .count();
        return new VariantOrderStatsResponse(placedToday, soldToday, cancelledToday, todayByStatus,
                series(orders.values(), granularity, today));
    }

    @Transactional(readOnly = true)
    public ProviderDashboardResponse dashboard() {
        User provider = securityContextService.getCurrentUser();
        List<OrderItem> items = orderItemRepository.findWithOrderByProviderId(provider.getId());

        Set<UUID> all = new HashSet<>();
        Set<UUID> sold = new HashSet<>();
        Set<UUID> cancelled = new HashSet<>();
        Set<UUID> pending = new HashSet<>();
        Map<UUID, VariantTally> variants = new LinkedHashMap<>();
        Map<UUID, CustomerTally> buyers = new HashMap<>();
        Map<UUID, CustomerTally> cancellers = new HashMap<>();

        for (OrderItem item : items) {
            Order order = item.getOrderBatch().getOrder();
            OrderStatus status = order.getOrderStatus();
            all.add(order.getId());
            VariantTally variant = variants.computeIfAbsent(item.getVariant().getId(),
                    id -> new VariantTally(item.getVariant().getProduct().getName(), item.getVariant().getVariantName()));
            User customer = order.getCustomer();
            if (SOLD.contains(status)) {
                sold.add(order.getId());
                variant.soldQuantity += item.getQuantity();
                variant.soldOrders.add(order.getId());
                buyers.computeIfAbsent(customer.getId(), id -> new CustomerTally(customer)).add(order, item);
            } else if (status == OrderStatus.CANCELLED) {
                cancelled.add(order.getId());
                variant.cancelledQuantity += item.getQuantity();
                variant.cancelledOrders.add(order.getId());
                cancellers.computeIfAbsent(customer.getId(), id -> new CustomerTally(customer)).add(order, item);
            } else {
                pending.add(order.getId());
            }
        }

        List<ProviderDashboardResponse.VariantRank> variantRanks = variants.entrySet().stream()
                .map(entry -> new ProviderDashboardResponse.VariantRank(entry.getKey(),
                        entry.getValue().productName, entry.getValue().variantName,
                        entry.getValue().soldQuantity, entry.getValue().cancelledQuantity,
                        entry.getValue().soldOrders.size(), entry.getValue().cancelledOrders.size()))
                .sorted(Comparator.comparingLong(ProviderDashboardResponse.VariantRank::soldQuantity).reversed())
                .toList();
        java.math.BigDecimal listRevenue = java.math.BigDecimal.ZERO;
        java.math.BigDecimal discountTotal = java.math.BigDecimal.ZERO;
        java.util.Set<UUID> counted = new java.util.HashSet<>();
        for (OrderItem item : items) {
            Order order = item.getOrderBatch().getOrder();
            if (SOLD.contains(order.getOrderStatus()) && counted.add(order.getId())) {
                java.math.BigDecimal list = order.getListAmount() == null ? order.getSubtotalAmount() : order.getListAmount();
                java.math.BigDecimal discount = order.getDiscountAmount() == null ? java.math.BigDecimal.ZERO : order.getDiscountAmount();
                listRevenue = listRevenue.add(list);
                discountTotal = discountTotal.add(discount);
            }
        }
        return new ProviderDashboardResponse(all.size(), sold.size(), cancelled.size(), pending.size(),
                listRevenue, discountTotal, listRevenue.subtract(discountTotal),
                variantRanks, rank(buyers), rank(cancellers));
    }

    private List<VariantOrderStatsResponse.Period> series(Iterable<Order> orders, Granularity granularity,
            LocalDate today) {
        Function<LocalDate, String> label = switch (granularity) {
            case DAY -> date -> date.toString();
            case MONTH -> date -> YearMonth.from(date).toString();
            case YEAR -> date -> String.valueOf(date.getYear());
        };
        Map<String, Map<OrderStatus, Long>> buckets = new LinkedHashMap<>();
        int periods = switch (granularity) {
            case DAY -> 14;
            case MONTH -> 12;
            case YEAR -> 5;
        };
        for (int index = periods - 1; index >= 0; index--) {
            LocalDate point = switch (granularity) {
                case DAY -> today.minusDays(index);
                case MONTH -> today.minusMonths(index);
                case YEAR -> today.minusYears(index);
            };
            buckets.put(label.apply(point), emptyCounts());
        }
        for (Order order : orders) {
            Map<OrderStatus, Long> bucket = buckets.get(label.apply(orderedOn(order)));
            if (bucket != null) {
                bucket.merge(order.getOrderStatus(), 1L, Long::sum);
            }
        }
        List<VariantOrderStatsResponse.Period> result = new ArrayList<>();
        buckets.forEach((key, counts) -> result.add(new VariantOrderStatsResponse.Period(key, counts)));
        return result;
    }

    private List<ProviderDashboardResponse.CustomerRank> rank(Map<UUID, CustomerTally> tallies) {
        return tallies.entrySet().stream()
                .map(entry -> new ProviderDashboardResponse.CustomerRank(entry.getKey(),
                        entry.getValue().fullName, entry.getValue().email,
                        entry.getValue().quantity, entry.getValue().orders.size()))
                .sorted(Comparator.comparingLong(ProviderDashboardResponse.CustomerRank::quantity).reversed()
                        .thenComparing(ProviderDashboardResponse.CustomerRank::email,
                                Comparator.nullsLast(Comparator.comparing(email -> email.toLowerCase(Locale.ROOT)))))
                .limit(TOP)
                .toList();
    }

    private LocalDate orderedOn(Order order) {
        return order.getOrderedAt().atZone(VIETNAM).toLocalDate();
    }

    private static Map<OrderStatus, Long> emptyCounts() {
        Map<OrderStatus, Long> counts = new EnumMap<>(OrderStatus.class);
        for (OrderStatus status : OrderStatus.values()) {
            counts.put(status, 0L);
        }
        return counts;
    }

    private static final class VariantTally {
        private final String productName;
        private final String variantName;
        private long soldQuantity;
        private long cancelledQuantity;
        private final Set<UUID> soldOrders = new HashSet<>();
        private final Set<UUID> cancelledOrders = new HashSet<>();

        private VariantTally(String productName, String variantName) {
            this.productName = productName;
            this.variantName = variantName;
        }
    }

    private static final class CustomerTally {
        private final String fullName;
        private final String email;
        private long quantity;
        private final Set<UUID> orders = new HashSet<>();

        private CustomerTally(User customer) {
            this.fullName = customer.getFullName();
            this.email = customer.getEmail();
        }

        private void add(Order order, OrderItem item) {
            quantity += item.getQuantity();
            orders.add(order.getId());
        }
    }
}
