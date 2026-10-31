package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.mapper.OrderMapper;
import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.CreateOrdersCommand;
import fpt.sba.trungthu.dto.request.CreateOrdersCommand.ProviderOrder;
import fpt.sba.trungthu.dto.request.OrderQueryRequest;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.dto.response.OrderSummaryResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.OrderBatch;
import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.PaymentTransaction;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import fpt.sba.trungthu.entity.enumeration.TransactionType;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.DailyCapacityRepository;
import fpt.sba.trungthu.repository.OrderBatchRepository;
import fpt.sba.trungthu.repository.OrderItemRepository;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.PaymentTransactionRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.OrderService;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {
    private final SecurityContextService securityContextService;
    private final OrderRepository orderRepository;
    private final OrderBatchRepository batchRepository;
    private final OrderItemRepository itemRepository;
    private final PaymentTransactionRepository paymentRepository;
    private final OrderMapper orderMapper;
    private final UserRepository userRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final DailyCapacityRepository capacityRepository;
    private final Validator validator;

    @Override
    @Transactional(propagation = Propagation.MANDATORY, readOnly = false, rollbackFor = Exception.class)
    public List<Order> createOrders(CreateOrdersCommand command) {
        if (TransactionSynchronizationManager.isCurrentTransactionReadOnly()) {
            throw new IllegalTransactionStateException("Creating orders requires a writable transaction");
        }
        try {
            if (command == null) {
                throw invalidOrder("Order creation command is required");
            }
            var violations = validator.validate(command);
            if (!violations.isEmpty()) {
                throw new ConstraintViolationException(violations);
            }
            var providers = new HashSet<UUID>();
            for (ProviderOrder group : command.groups()) {
                if (!providers.add(group.providerId())) {
                    throw invalidOrder("Only one group and delivery date per provider is allowed");
                }
            }
            User customer = findUser(command.customerId(), UserRole.CUSTOMER);
            List<Order> created = new ArrayList<>();
            for (ProviderOrder group : command.groups()) {
                created.add(createProviderOrder(command, group, customer));
            }
            log.info("Created {} orders for checkout {}", created.size(), command.checkoutId());
            return List.copyOf(created);
        } catch (RuntimeException ex) {
            log.warn("Order creation failed; caller transaction must roll back", ex);
            throw ex;
        } finally {
            log.debug("Completed createOrders");
        }
    }

    private Order createProviderOrder(CreateOrdersCommand command, ProviderOrder group, User customer) {
        User provider = findUser(group.providerId(), UserRole.PROVIDER);
        Map<UUID, ProductVariant> variants = findGroupVariants(group);
        BigDecimal subtotal = group.items().stream()
                .map(item -> item.unitPrice().multiply(BigDecimal.valueOf(item.quantity()))
                        .add(item.personalizationFee()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = subtotal.add(group.shippingFee());
        validatePayment(command, group, total);
        DailyCapacity capacity = findCapacity(group);
        boolean cod = group.paymentMethod() == PaymentMethod.COD;
        Order order = Order.builder().checkoutId(command.checkoutId()).customer(customer).provider(provider)
                .orderCode("ORD-" + UUID.randomUUID().toString().replace("-", ""))
                .orderedAt(command.orderedAt()).receiverName(command.receiverName())
                .receiverPhone(command.receiverPhone()).shippingAddress(command.shippingAddress())
                .subtotalAmount(subtotal).shippingFee(group.shippingFee()).totalAmount(total)
                .listAmount(group.listAmount() == null ? subtotal : group.listAmount())
                .discountAmount(group.discountAmount() == null ? BigDecimal.ZERO : group.discountAmount())
                .depositAmount(group.depositAmount()).paymentMethod(group.paymentMethod())
                .orderStatus(cod ? OrderStatus.CONFIRMED : OrderStatus.PENDING_DEPOSIT)
                .holdExpiresAt(group.holdExpiresAt()).build();
        copyVatInfo(order, command.vat());
        orderRepository.save(order);
        OrderBatch batch = batchRepository.save(OrderBatch.builder().order(order).provider(provider)
                .capacity(capacity).deliveryDate(group.deliveryDate()).subtotal(subtotal).build());
        itemRepository.saveAll(group.items().stream().map(item -> OrderItem.builder().orderBatch(batch)
                .variant(variants.get(item.variantId())).sourceSet(sourceSet(group, item))
                .directFromSet(item.directUnits())
                .productName(item.productName()).variantName(item.variantName())
                .quantity(item.quantity()).stockReservedQuantity(item.stockReservedQuantity())
                .unitPrice(item.unitPrice()).bakeQuantity(item.bakeQuantity())
                .personalizationText(item.personalizationText()).personalizationFee(item.personalizationFee())
                .subtotal(item.unitPrice().multiply(BigDecimal.valueOf(item.quantity()))
                        .add(item.personalizationFee())).build()).toList());
        if (!cod) {
            paymentRepository.save(PaymentTransaction.builder().order(order)
                    .transactionCode("DEP-" + order.getOrderCode()).transactionType(TransactionType.ORDER_DEPOSIT)
                    .paymentMethod(group.paymentMethod()).amount(group.depositAmount()).build());
        }
        // Flush exposes DB errors inside this method; it does not commit the caller's transaction.
        orderRepository.flush();
        return order;
    }

    private User findUser(UUID id, UserRole role) {
        User user = userRepository.findById(id).orElseThrow(() -> invalidOrder("Unknown " + role));
        if (user.getRole() != role) {
            throw invalidOrder("Invalid role for " + role);
        }
        return user;
    }

    private fpt.sba.trungthu.entity.Product sourceSet(ProviderOrder group, CreateOrdersCommand.ItemSnapshot item) {
        if (item.sourceSetId() == null) {
            return null;
        }
        fpt.sba.trungthu.entity.Product set = productRepository.findById(item.sourceSetId())
                .orElseThrow(() -> invalidOrder("Unknown gift set"));
        if (!group.providerId().equals(set.getProvider().getId())
                || set.getProductType() != fpt.sba.trungthu.entity.enumeration.ProductType.GIFT_SET) {
            throw invalidOrder("Gift set source must belong to the group's provider");
        }
        return set;
    }

    private Map<UUID, ProductVariant> findGroupVariants(ProviderOrder group) {
        var ids = group.items().stream().map(CreateOrdersCommand.ItemSnapshot::variantId)
                .collect(Collectors.toSet());
        Map<UUID, ProductVariant> variants = variantRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(ProductVariant::getId, variant -> variant));
        if (variants.size() != ids.size() || variants.values().stream()
                .anyMatch(variant -> !group.providerId().equals(variant.getProduct().getProvider().getId()))) {
            throw invalidOrder("Every variant must exist and belong to the group's provider");
        }
        return variants;
    }

    private DailyCapacity findCapacity(ProviderOrder group) {
        if (group.capacityId() == null) {
            if (group.items().stream().anyMatch(item -> item.bakeQuantity() > 0)) {
                throw invalidOrder("Baking items require the capacity reserved by CheckoutService");
            }
            return null;
        }
        DailyCapacity capacity = capacityRepository.findById(group.capacityId())
                .orElseThrow(() -> invalidOrder("Unknown capacity"));
        if (!group.providerId().equals(capacity.getProvider().getId())
                || !group.deliveryDate().minusDays(1).equals(capacity.getCapacityDate())) {
            throw invalidOrder("Capacity must match provider and bake date");
        }
        return capacity;
    }

    private void validatePayment(CreateOrdersCommand command, ProviderOrder group, BigDecimal total) {
        if (group.depositAmount().compareTo(total) > 0) {
            throw invalidOrder("Deposit cannot exceed the order total");
        }
        if (group.paymentMethod() == PaymentMethod.COD) {
            if (group.depositAmount().signum() != 0 || group.holdExpiresAt() != null) {
                throw invalidOrder("COD must have zero deposit and no deposit hold");
            }
        } else if (group.paymentMethod() == PaymentMethod.VIETQR) {
            if (group.depositAmount().signum() <= 0 || group.holdExpiresAt() == null
                    || !group.holdExpiresAt().isAfter(command.orderedAt())) {
                throw invalidOrder("Online payment requires a positive amount and a hold after the order time");
            }
            if (group.holdExpiresAt().isAfter(command.orderedAt().plusSeconds(5 * 60 * 60))) {
                throw invalidOrder("VietQR payment deadline cannot exceed five hours");
            }
        } else {
            throw invalidOrder("Unsupported order payment method");
        }
    }

    private void copyVatInfo(Order order, CreateOrdersCommand.VatInfo vat) {
        if (vat != null) {
            order.setRequireVatInvoice(true);
            order.setVatCompanyName(vat.companyName());
            order.setVatTaxCode(vat.taxCode());
            order.setVatCompanyAddress(vat.companyAddress());
            order.setVatEmail(vat.invoiceEmail());
        }
    }

    private ResponseStatusException invalidOrder(String reason) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
    }

    @Override
    public PageResponse<OrderSummaryResponse> getMyOrders(OrderQueryRequest query) {
        try {
            User buyer = requireUser(UserRole.CUSTOMER);
            log.info("Fetching orders for customer {}", buyer.getId());
            return mapPage(orderRepository.findCustomerOrders(buyer.getId(), query.getStatus(), query.getFrom(),
                    query.getTo(), pageable(query)));
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Cannot fetch customer orders", ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot retrieve orders", ex);
        } finally {
            log.debug("Completed getMyOrders");
        }
    }

    @Override
    public PageResponse<OrderSummaryResponse> getProviderOrders(OrderQueryRequest query) {
        try {
            User provider = requireUser(UserRole.PROVIDER);
            log.info("Fetching orders for provider {}", provider.getId());
            return mapPage(orderRepository.findProviderOrders(provider.getId(), query.getStatus(), query.getFrom(),
                    query.getTo(), pageable(query)));
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Cannot fetch provider orders", ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot retrieve orders", ex);
        } finally {
            log.debug("Completed getProviderOrders");
        }
    }

    @Override
    public OrderDetailResponse getOrderDetail(UUID orderId) {
        try {
            User user = requireUser(UserRole.CUSTOMER, UserRole.PROVIDER);
            log.info("Fetching order {} for user {}", orderId, user.getId());
            Order order = orderRepository.findOwnedOrder(orderId, user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
            OrderBatch batch = batchRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new IllegalStateException("Order has no delivery batch"));
            return orderMapper.toDetail(order, batch.getDeliveryDate(),
                    paymentRepository.sumSuccessfulAmountByOrderId(orderId),
                    itemRepository.findByOrderBatchOrderId(orderId));
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Cannot fetch order {}", orderId, ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot retrieve order", ex);
        } finally {
            log.debug("Completed getOrderDetail for {}", orderId);
        }
    }

    private User requireUser(UserRole... allowedRoles) {
        User user = securityContextService.getCurrentUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not active");
        }
        if (Arrays.stream(allowedRoles).noneMatch(role -> role == user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access is denied");
        }
        return user;
    }

    private Pageable pageable(OrderQueryRequest query) {
        if (query.getPage() < 0 || query.getSize() < 1 || query.getSize() > 100 || !query.isDateRangeValid()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid pagination or delivery date range");
        }
        return PageRequest.of(query.getPage(), query.getSize(), Sort.by("orderedAt", "id").descending());
    }

    private PageResponse<OrderSummaryResponse> mapPage(Page<Order> page) {
        if (page.isEmpty()) {
            return PageResponse.from(page, order -> orderMapper.toSummary(order, null, BigDecimal.ZERO));
        }
        var ids = page.getContent().stream().map(Order::getId).toList();
        Map<UUID, LocalDate> dates = batchRepository.findByOrderIdIn(ids).stream()
                .collect(Collectors.toMap(batch -> batch.getOrder().getId(), OrderBatch::getDeliveryDate));
        Map<UUID, BigDecimal> amounts = paymentRepository.findByOrderIdInAndPaymentStatus(
                        ids, fpt.sba.trungthu.entity.enumeration.TransactionStatus.SUCCESS).stream()
                .collect(Collectors.toMap(tx -> tx.getOrder().getId(), PaymentTransaction::getAmount,
                        BigDecimal::add));
        return PageResponse.from(page, order -> orderMapper.toSummary(order, dates.get(order.getId()),
                amounts.getOrDefault(order.getId(), BigDecimal.ZERO)));
    }
}
