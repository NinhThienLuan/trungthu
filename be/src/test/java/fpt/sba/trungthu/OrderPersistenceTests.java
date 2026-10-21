package fpt.sba.trungthu;

import fpt.sba.trungthu.entity.*;
import fpt.sba.trungthu.entity.enumeration.*;
import fpt.sba.trungthu.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
@Transactional
class OrderPersistenceTests {

    @Autowired private EntityManager entityManager;
    @Autowired private UserRepository users;
    @Autowired private ProductRepository products;
    @Autowired private ProductVariantRepository variants;
    @Autowired private OrderRepository orders;
    @Autowired private OrderBatchRepository batches;
    @Autowired private OrderItemRepository items;
    @Autowired private PaymentTransactionRepository payments;

    private User buyer;
    private User provider;
    private User otherProvider;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        buyer = user(UserRole.CUSTOMER);
        provider = user(UserRole.PROVIDER);
        otherProvider = user(UserRole.PROVIDER);
        Product product = products.save(Product.builder().provider(provider).name("Original product")
                .productType(ProductType.LOOSE_CAKE).status(ProductStatus.ACTIVE).build());
        variant = variants.save(ProductVariant.builder().product(product).variantName("Original variant")
                .sku(UUID.randomUUID().toString()).price(new BigDecimal("100000"))
                .weightGram(150).status(ProductStatus.ACTIVE).build());
    }

    @Test
    void savesOrderGraphAndPreservesItemHistoryAfterCatalogChanges() {
        Order order = order(provider, UUID.randomUUID(), PaymentMethod.COD, OrderStatus.CONFIRMED, null);
        OrderBatch batch = batch(order, LocalDate.of(2026, 10, 20));
        OrderItem item = items.saveAndFlush(OrderItem.builder().orderBatch(batch).variant(variant)
                .productName("Original product").variantName("Original variant").quantity(1)
                .unitPrice(new BigDecimal("100000")).subtotal(new BigDecimal("100000"))
                .bakeQuantity(1).build());
        variant.setVariantName("Renamed variant");
        variant.setPrice(new BigDecimal("200000"));
        variant.getProduct().setName("Renamed product");
        entityManager.flush();
        entityManager.clear();

        OrderItem loaded = items.findByOrderBatchOrderId(order.getId()).getFirst();
        assertThat(loaded.getId()).isEqualTo(item.getId());
        assertThat(loaded.getProductName()).isEqualTo("Original product");
        assertThat(loaded.getVariantName()).isEqualTo("Original variant");
        assertThat(loaded.getUnitPrice()).isEqualByComparingTo("100000");
        Order loadedOrder = orders.findById(order.getId()).orElseThrow();
        assertThat(loadedOrder.getPaymentStatus()).isEqualTo(OrderPaymentStatus.UNPAID);
        assertThat(loadedOrder.getHoldExtensionCount()).isZero();
        assertThat(loadedOrder.getOrderedAt()).isNotNull();
        assertThat(loadedOrder.getCreatedAt()).isNotNull();
        assertThat(batches.findByOrderId(order.getId())).isPresent();
    }

    @Test
    void supportsMultipleProvidersAndScopesBuyerAndSellerQueries() {
        UUID checkout = UUID.randomUUID();
        Order first = order(provider, checkout, PaymentMethod.COD, OrderStatus.CONFIRMED, null);
        Order second = order(otherProvider, checkout, PaymentMethod.COD, OrderStatus.CONFIRMED, null);
        LocalDate delivery = LocalDate.of(2026, 10, 20);
        batch(first, delivery);
        batch(second, delivery.plusDays(1));
        entityManager.flush();

        assertThat(orders.findByCheckoutIdOrderByOrderCodeAsc(checkout)).hasSize(2);
        assertThat(orders.findCustomerOrders(buyer.getId(), null, null, null, PageRequest.of(0, 10)))
                .extracting(Order::getId).containsExactlyInAnyOrder(first.getId(), second.getId());
        assertThat(orders.findProviderOrders(provider.getId(), OrderStatus.CONFIRMED,
                delivery, delivery, PageRequest.of(0, 10)))
                .extracting(Order::getId).containsExactly(first.getId());
        assertThat(orders.findCustomerOrders(otherProvider.getId(), null, null, null, PageRequest.of(0, 10)))
                .isEmpty();
        assertThat(orders.findOwnedOrder(first.getId(), buyer.getId())).isPresent();
        assertThat(orders.findOwnedOrder(first.getId(), provider.getId())).isPresent();
        assertThat(orders.findOwnedOrder(first.getId(), otherProvider.getId())).isEmpty();
        assertThat(orders.findForUpdateById(first.getId())).isPresent();
    }

    @Test
    void rejectsDuplicateProviderInSameCheckout() {
        UUID checkout = UUID.randomUUID();
        order(provider, checkout, PaymentMethod.COD, OrderStatus.CONFIRMED, null);
        assertThatThrownBy(() -> order(provider, checkout, PaymentMethod.COD, OrderStatus.CONFIRMED, null))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsSecondBatchInMvp() {
        Order order = order(provider, UUID.randomUUID(), PaymentMethod.COD, OrderStatus.CONFIRMED, null);
        batch(order, LocalDate.of(2026, 10, 20));
        assertThatThrownBy(() -> batch(order, LocalDate.of(2026, 10, 21)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsBatchOwnedByAnotherProvider() {
        Order order = order(provider, UUID.randomUUID(), PaymentMethod.COD, OrderStatus.CONFIRMED, null);
        assertThatThrownBy(() -> batches.saveAndFlush(OrderBatch.builder().order(order).provider(otherProvider)
                .deliveryDate(LocalDate.of(2026, 10, 20)).subtotal(order.getSubtotalAmount()).build()))
                .hasRootCauseMessage("Batch provider must match order provider");
    }

    @Test
    void expiryQueryIncludesDeadlineBoundaryButExcludesCodAndFutureHolds() {
        Instant now = Instant.parse("2026-10-16T07:00:00Z");
        Order expired = order(provider, UUID.randomUUID(), PaymentMethod.VIETQR,
                OrderStatus.PENDING_DEPOSIT, now);
        order(provider, UUID.randomUUID(), PaymentMethod.VIETQR, OrderStatus.PENDING_DEPOSIT, now.plusSeconds(60));
        order(provider, UUID.randomUUID(), PaymentMethod.COD, OrderStatus.CONFIRMED, null);

        assertThat(orders.findExpiredPendingDeposits(now, PageRequest.of(0, 10)))
                .extracting(Order::getId).containsExactly(expired.getId());
    }

    @Test
    void rejectsHoldOnCodOrder() {
        assertThatThrownBy(() -> order(provider, UUID.randomUUID(), PaymentMethod.COD,
                OrderStatus.CONFIRMED, Instant.now().plusSeconds(900)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void paymentTimeIsSeparateFromCreationAndOnlySuccessfulPaymentsCount() {
        Order order = order(provider, UUID.randomUUID(), PaymentMethod.COD, OrderStatus.CONFIRMED, null);
        PaymentTransaction payment = payments.saveAndFlush(payment(order, new BigDecimal("60000")));
        assertThat(payment.getCreatedAt()).isNotNull();
        assertThat(payment.getPaidAt()).isNull();
        assertThat(payments.sumSuccessfulAmountByOrderId(order.getId())).isEqualByComparingTo("0");

        Instant paidAt = Instant.parse("2026-10-16T08:00:00Z");
        payment.setPaidAt(paidAt);
        payment.transitionPaymentStatus(TransactionStatus.SUCCESS);
        payments.saveAndFlush(payment);
        payments.saveAndFlush(payment(order, new BigDecimal("40000")));
        entityManager.clear();
        assertThat(payments.sumSuccessfulAmountByOrderId(order.getId())).isEqualByComparingTo("60000");
        assertThat(payments.findById(payment.getId()).orElseThrow().getPaidAt()).isEqualTo(paidAt);
        assertThat(payments.findByOrderIdOrderByCreatedAtAsc(order.getId())).hasSize(2);
    }

    @Test
    void savesSubscriptionPaymentWithoutOrder() {
        Subscription subscription = Subscription.builder().provider(provider).planName("SELLING_ACCESS")
                .price(new BigDecimal("1000000")).startDate(LocalDate.of(2026, 10, 16))
                .endDate(LocalDate.of(2027, 1, 14)).status(SubscriptionStatus.PENDING_PAYMENT).build();
        entityManager.persist(subscription);
        PaymentTransaction payment = payments.saveAndFlush(PaymentTransaction.builder().subscription(subscription)
                .transactionCode(UUID.randomUUID().toString()).transactionType(TransactionType.SUBSCRIPTION_FEE)
                .paymentMethod(PaymentMethod.DIRECT_BANK).amount(subscription.getPrice()).build());
        assertThat(payment.getOrder()).isNull();
        assertThat(payments.findBySubscriptionIdOrderByCreatedAtAsc(subscription.getId())).hasSize(1);
    }

    @Test
    void rejectsPaymentWithoutOrderOrSubscription() {
        PaymentTransaction payment = payment(null, new BigDecimal("100000"));
        assertThatThrownBy(() -> payments.saveAndFlush(payment)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsSuccessfulPaymentWithoutPaidAt() {
        Order order = order(provider, UUID.randomUUID(), PaymentMethod.COD, OrderStatus.CONFIRMED, null);
        PaymentTransaction payment = payment(order, new BigDecimal("100000"));
        payment.setPaymentStatus(TransactionStatus.SUCCESS);
        assertThatThrownBy(() -> payments.saveAndFlush(payment)).isInstanceOf(DataIntegrityViolationException.class);
    }

    private User user(UserRole role) {
        return users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@test.local").password("test-hash")
                .fullName("Test user").role(role).status(UserStatus.ACTIVE).build());
    }

    private Order order(User seller, UUID checkout, PaymentMethod method, OrderStatus status, Instant hold) {
        return orders.saveAndFlush(Order.builder().customer(buyer).provider(seller).checkoutId(checkout)
                .orderCode(UUID.randomUUID().toString()).subtotalAmount(new BigDecimal("100000"))
                .totalAmount(new BigDecimal("100000")).paymentMethod(method).orderStatus(status)
                .receiverName("Buyer").receiverPhone("0900000000").shippingAddress("Test address")
                .holdExpiresAt(hold).build());
    }

    private OrderBatch batch(Order order, LocalDate delivery) {
        return batches.saveAndFlush(OrderBatch.builder().order(order).provider(order.getProvider())
                .deliveryDate(delivery).subtotal(order.getSubtotalAmount()).build());
    }

    private PaymentTransaction payment(Order order, BigDecimal amount) {
        return PaymentTransaction.builder().order(order).transactionCode(UUID.randomUUID().toString())
                .transactionType(TransactionType.ORDER_BALANCE).paymentMethod(PaymentMethod.COD).amount(amount).build();
    }
}
