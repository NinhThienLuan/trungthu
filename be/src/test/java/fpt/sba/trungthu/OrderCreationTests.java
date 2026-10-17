package fpt.sba.trungthu;

import fpt.sba.trungthu.dto.request.CreateOrdersCommand;
import fpt.sba.trungthu.dto.request.CreateOrdersCommand.ItemSnapshot;
import fpt.sba.trungthu.dto.request.CreateOrdersCommand.ProviderOrder;
import fpt.sba.trungthu.entity.*;
import fpt.sba.trungthu.entity.enumeration.*;
import fpt.sba.trungthu.repository.*;
import fpt.sba.trungthu.service.OrderService;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.UnexpectedRollbackException;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
class OrderCreationTests {
    @Autowired private OrderService service;
    @Autowired private PlatformTransactionManager transactionManager;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository users;
    @Autowired private ProductRepository products;
    @Autowired private ProductVariantRepository variants;
    @Autowired private DailyCapacityRepository capacities;
    @Autowired private OrderRepository orders;
    @Autowired private OrderBatchRepository batches;
    @Autowired private OrderItemRepository items;
    @Autowired private PaymentTransactionRepository payments;

    private TransactionTemplate transaction;
    private UUID customerId;
    private UUID providerA;
    private UUID providerB;
    private UUID variantA;
    private UUID variantB;
    private UUID addon;
    private UUID capacityA;
    private UUID capacityB;
    private final Instant orderedAt = Instant.parse("2026-10-17T08:00:00Z");
    private final LocalDate deliveryDate = LocalDate.of(2026, 10, 25);

    @BeforeEach
    void setUp() {
        transaction = new TransactionTemplate(transactionManager);
        transaction.executeWithoutResult(status -> {
            customerId = user(UserRole.CUSTOMER).getId();
            User first = user(UserRole.PROVIDER);
            User second = user(UserRole.PROVIDER);
            providerA = first.getId();
            providerB = second.getId();
            variantA = variant(first, ProductType.LOOSE_CAKE).getId();
            variantB = variant(second, ProductType.LOOSE_CAKE).getId();
            addon = variant(first, ProductType.ADDON_SERVICE).getId();
            capacityA = capacity(first).getId();
            capacityB = capacity(second).getId();
        });
    }

    @AfterEach
    void cleanUpTestData() {
        if (customerId == null) {
            return;
        }
        transaction.executeWithoutResult(status -> {
            jdbcTemplate.update("DELETE FROM PAYMENT_TRANSACTION WHERE order_id IN "
                    + "(SELECT id FROM \"ORDER\" WHERE customer_id = ?)", customerId);
            jdbcTemplate.update("DELETE FROM ORDER_ITEM WHERE order_batch_id IN "
                    + "(SELECT b.id FROM ORDER_BATCH b JOIN \"ORDER\" o ON b.order_id = o.id WHERE o.customer_id = ?)", customerId);
            jdbcTemplate.update("DELETE FROM ORDER_BATCH WHERE order_id IN "
                    + "(SELECT id FROM \"ORDER\" WHERE customer_id = ?)", customerId);
            jdbcTemplate.update("DELETE FROM \"ORDER\" WHERE customer_id = ?", customerId);
            jdbcTemplate.update("DELETE FROM DAILY_CAPACITY WHERE provider_id IN (?, ?)", providerA, providerB);
            jdbcTemplate.update("DELETE FROM PRODUCT_VARIANT WHERE product_id IN "
                    + "(SELECT id FROM PRODUCT WHERE provider_id IN (?, ?))", providerA, providerB);
            jdbcTemplate.update("DELETE FROM PRODUCT WHERE provider_id IN (?, ?)", providerA, providerB);
            jdbcTemplate.update("DELETE FROM \"USER\" WHERE id IN (?, ?, ?)", customerId, providerA, providerB);
        });
    }

    @Test
    void createsOneOrderAndBatchPerProviderWithSnapshotsAndPaymentModes() {
        UUID checkoutId = UUID.randomUUID();
        CreateOrdersCommand command = command(checkoutId, List.of(codGroup(), qrGroup()));
        List<Order> created = transaction.execute(status -> service.createOrders(command));
        assertThat(created).hasSize(2);
        assertThat(created).extracting(Order::getOrderCode).doesNotHaveDuplicates();
        assertThat(created).extracting(Order::getCheckoutId).containsOnly(checkoutId);
        assertThat(created).extracting(Order::getOrderedAt).containsOnly(orderedAt);
        assertCounts(checkoutId, 2, 2, 3, 1);

        transaction.executeWithoutResult(status -> {
            Map<UUID, Order> byProvider = orders.findByCheckoutIdOrderByOrderCodeAsc(checkoutId).stream()
                    .collect(Collectors.toMap(order -> order.getProvider().getId(), order -> order));
            Order cod = byProvider.get(providerA);
            Order qr = byProvider.get(providerB);
            assertThat(cod.getOrderStatus()).isEqualTo(OrderStatus.CONFIRMED);
            assertThat(cod.getPaymentStatus()).isEqualTo(OrderPaymentStatus.UNPAID);
            assertThat(cod.getSubtotalAmount()).isEqualByComparingTo("90000");
            assertThat(cod.getTotalAmount()).isEqualByComparingTo("100000");
            assertThat(cod.getHoldExpiresAt()).isNull();
            assertThat(cod.getDepositAmount()).isEqualByComparingTo("0");
            assertThat(payments.findByOrderIdOrderByCreatedAtAsc(cod.getId())).isEmpty();
            assertThat(qr.getOrderStatus()).isEqualTo(OrderStatus.PENDING_DEPOSIT);
            assertThat(qr.getPaymentStatus()).isEqualTo(OrderPaymentStatus.UNPAID);
            assertThat(qr.getTotalAmount()).isEqualByComparingTo("95000");
            assertThat(qr.getHoldExpiresAt()).isEqualTo(orderedAt.plusSeconds(900));
            assertThat(qr.getHoldExtensionCount()).isZero();
            var payment = payments.findByOrderIdOrderByCreatedAtAsc(qr.getId()).getFirst();
            assertThat(payment.getTransactionType()).isEqualTo(TransactionType.ORDER_DEPOSIT);
            assertThat(payment.getPaymentStatus()).isEqualTo(TransactionStatus.PENDING);
            assertThat(payment.getAmount()).isEqualByComparingTo("47500");
            assertThat(payment.getPaidAt()).isNull();
            assertThat(batches.findByOrderId(cod.getId()).orElseThrow().getCapacity().getId()).isEqualTo(capacityA);
            assertThat(batches.findByOrderId(qr.getId()).orElseThrow().getDeliveryDate()).isEqualTo(deliveryDate);
            assertThat(items.findByOrderBatchOrderId(cod.getId())).extracting(OrderItem::getUnitPrice)
                    .usingElementComparator(BigDecimal::compareTo)
                    .containsExactlyInAnyOrder(new BigDecimal("40000"), new BigDecimal("10000"));
            assertThat(cod.getVatCompanyName()).isEqualTo("Test company");
            assertThat(qr.getVatEmail()).isEqualTo("invoice@test.local");
        });
        assertResourcesUnchanged();
        assertThat(jdbcTemplate.queryForObject("SELECT SUM(bake_quantity) FROM v_bake_lines WHERE provider_id = ?",
                Integer.class, providerA)).isEqualTo(2);
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM v_bake_lines WHERE provider_id = ?",
                Integer.class, providerB)).isZero();
    }

    @Test
    void storedSnapshotsDoNotChangeWhenCatalogChanges() {
        UUID checkout = UUID.randomUUID();
        UUID orderId = transaction.execute(status -> service.createOrders(command(checkout, List.of(codGroup()))).getFirst().getId());
        transaction.executeWithoutResult(status -> {
            ProductVariant variant = variants.findById(variantA).orElseThrow();
            variant.setVariantName("New variant name");
            variant.setPrice(new BigDecimal("999999"));
            variant.getProduct().setName("New product name");
        });
        OrderItem saved = items.findByOrderBatchOrderId(orderId).stream()
                .filter(item -> item.getVariant().getId().equals(variantA)).findFirst().orElseThrow();
        assertThat(saved.getProductName()).isEqualTo("Snapshot cake");
        assertThat(saved.getVariantName()).isEqualTo("Snapshot 150g");
        assertThat(saved.getUnitPrice()).isEqualByComparingTo("40000");
        assertThat(saved.getSubtotal()).isEqualByComparingTo("80000");
    }

    @Test
    void refusesCallsWithoutExistingTransaction() {
        assertThatThrownBy(() -> service.createOrders(command(UUID.randomUUID(), List.of(codGroup()))))
                .isInstanceOf(IllegalTransactionStateException.class);
    }

    @Test
    void refusesReadOnlyCallerTransaction() {
        TransactionTemplate readOnly = new TransactionTemplate(transactionManager);
        readOnly.setReadOnly(true);
        assertThatThrownBy(() -> readOnly.execute(status -> service.createOrders(command(UUID.randomUUID(), List.of(codGroup())))))
                .isInstanceOf(IllegalTransactionStateException.class);
    }

    @Test
    void rejectsTwoGroupsForSameProvider() {
        UUID checkout = UUID.randomUUID();
        assertBadRequest(() -> transaction.execute(status -> service.createOrders(command(checkout, List.of(codGroup(), codGroup())))));
        assertCounts(checkout, 0, 0, 0, 0);
    }

    @ParameterizedTest
    @ValueSource(strings = {"foreign-variant", "unknown-variant", "foreign-capacity", "missing-capacity", "wrong-date"})
    void rejectsMismatchedReferencesAndRollsBackEarlierGroup(String scenario) {
        ProviderOrder qr = qrGroup();
        UUID variant = scenario.equals("foreign-variant") ? variantA
                : scenario.equals("unknown-variant") ? UUID.randomUUID() : variantB;
        UUID capacity = scenario.equals("foreign-capacity") ? capacityA
                : scenario.equals("missing-capacity") ? null : capacityB;
        LocalDate date = scenario.equals("wrong-date") ? deliveryDate.plusDays(1) : deliveryDate;
        ProviderOrder invalid = new ProviderOrder(providerB, date, capacity, qr.shippingFee(), qr.depositAmount(),
                qr.paymentMethod(), qr.holdExpiresAt(), List.of(snapshot(variant, 3, "30000", 3)));
        UUID checkout = UUID.randomUUID();
        assertBadRequest(() -> transaction.execute(status -> service.createOrders(command(checkout, List.of(codGroup(), invalid)))));
        assertCounts(checkout, 0, 0, 0, 0);
    }

    @Test
    void validatesNestedSnapshotsBeforeSaving() {
        ProviderOrder invalid = new ProviderOrder(providerA, deliveryDate, capacityA, BigDecimal.ZERO,
                BigDecimal.ZERO, PaymentMethod.COD, null, List.of(snapshot(variantA, 0, "40000", 0)));
        UUID checkout = UUID.randomUUID();
        assertThatThrownBy(() -> transaction.execute(status -> service.createOrders(command(checkout, List.of(invalid)))))
                .isInstanceOf(ConstraintViolationException.class);
        assertCounts(checkout, 0, 0, 0, 0);
    }

    @ParameterizedTest
    @ValueSource(strings = {"cod-deposit", "cod-hold", "qr-no-deposit", "qr-no-hold", "qr-old-hold", "overpayment", "gateway"})
    void rejectsInconsistentInitialPayments(String scenario) {
        boolean cod = scenario.startsWith("cod");
        PaymentMethod method = scenario.equals("gateway") ? PaymentMethod.MOMO : cod ? PaymentMethod.COD : PaymentMethod.VIETQR;
        BigDecimal deposit = scenario.equals("cod-deposit") ? new BigDecimal("1")
                : scenario.equals("qr-no-deposit") || cod ? BigDecimal.ZERO
                : scenario.equals("overpayment") ? new BigDecimal("999999") : new BigDecimal("47500");
        Instant hold = scenario.equals("qr-no-hold") || scenario.equals("cod-deposit") ? null
                : scenario.equals("qr-old-hold") ? orderedAt : orderedAt.plusSeconds(900);
        ProviderOrder invalid = new ProviderOrder(providerB, deliveryDate, capacityB, new BigDecimal("5000"),
                deposit, method, hold, qrGroup().items());
        UUID checkout = UUID.randomUUID();
        assertBadRequest(() -> transaction.execute(status -> service.createOrders(command(checkout, List.of(invalid)))));
        assertCounts(checkout, 0, 0, 0, 0);
    }

    @Test
    void nonBakingOrderDoesNotRequireCapacityOrCreateZeroDepositTransaction() {
        ProviderOrder group = new ProviderOrder(providerA, deliveryDate, null, BigDecimal.ZERO, BigDecimal.ZERO,
                PaymentMethod.COD, null, List.of(snapshot(addon, 1, "10000", 0)));
        UUID checkout = UUID.randomUUID();
        transaction.executeWithoutResult(status -> service.createOrders(command(checkout, List.of(group))));
        assertCounts(checkout, 1, 1, 1, 0);
    }

    @Test
    void laterCheckoutFailureRollsBackOrdersPaymentsAndCallerReservations() {
        UUID checkout = UUID.randomUUID();
        assertThatThrownBy(() -> transaction.executeWithoutResult(status -> {
            reserveForCaller();
            service.createOrders(command(checkout, List.of(codGroup(), qrGroup())));
            throw new IllegalStateException("Later checkout step failed");
        })).isInstanceOf(IllegalStateException.class).hasMessage("Later checkout step failed");
        assertCounts(checkout, 0, 0, 0, 0);
        assertResourcesUnchanged();
    }

    @Test
    void secondProviderDbFailureRollsBackFirstProviderAndCallerReservations() {
        UUID checkout = UUID.randomUUID();
        transaction.executeWithoutResult(status -> service.createOrders(command(checkout, List.of(qrGroup()))));
        assertThatThrownBy(() -> transaction.executeWithoutResult(status -> {
            reserveForCaller();
            service.createOrders(command(checkout, List.of(codGroup(), qrGroup())));
        })).isInstanceOf(DataIntegrityViolationException.class);
        assertCounts(checkout, 1, 1, 1, 1);
        assertResourcesUnchanged();
        assertThat(orders.findByCheckoutIdOrderByOrderCodeAsc(checkout)).extracting(order -> order.getProvider().getId())
                .containsExactly(providerB);
    }

    @Test
    void caughtCreationFailureStillMarksCallerTransactionForRollback() {
        UUID checkout = UUID.randomUUID();
        transaction.executeWithoutResult(status -> service.createOrders(command(checkout, List.of(qrGroup()))));
        assertThatThrownBy(() -> transaction.executeWithoutResult(status -> {
            reserveForCaller();
            try {
                service.createOrders(command(checkout, List.of(codGroup(), qrGroup())));
            } catch (DataIntegrityViolationException expected) {
                // A caller swallowing the error must still be unable to commit partial orders.
            }
        })).isInstanceOf(UnexpectedRollbackException.class);
        assertCounts(checkout, 1, 1, 1, 1);
        assertResourcesUnchanged();
    }

    private CreateOrdersCommand command(UUID checkout, List<ProviderOrder> groups) {
        return new CreateOrdersCommand(checkout, customerId, orderedAt, "Recipient", "0900000000", "Test address",
                new CreateOrdersCommand.VatInfo("Test company", "1234567890", "Company address", "invoice@test.local"), groups);
    }

    private ProviderOrder codGroup() {
        return new ProviderOrder(providerA, deliveryDate, capacityA, new BigDecimal("10000"), BigDecimal.ZERO,
                PaymentMethod.COD, null, List.of(snapshot(variantA, 2, "40000", 2), snapshot(addon, 1, "10000", 0)));
    }

    private ProviderOrder qrGroup() {
        return new ProviderOrder(providerB, deliveryDate, capacityB, new BigDecimal("5000"), new BigDecimal("47500"),
                PaymentMethod.VIETQR, orderedAt.plusSeconds(900), List.of(snapshot(variantB, 3, "30000", 3)));
    }

    private ItemSnapshot snapshot(UUID variant, int quantity, String price, int bakeQuantity) {
        return new ItemSnapshot(variant, "Snapshot cake", "Snapshot 150g", quantity, new BigDecimal(price), bakeQuantity);
    }

    private User user(UserRole role) {
        return users.save(User.builder().email(UUID.randomUUID() + "@test.local").password("test-hash")
                .fullName("Test user").role(role).status(UserStatus.ACTIVE).build());
    }

    private ProductVariant variant(User provider, ProductType type) {
        Product product = products.save(Product.builder().provider(provider).name("Live catalog product")
                .productType(type).status(ProductStatus.ACTIVE).build());
        return variants.save(ProductVariant.builder().product(product).variantName("Live catalog variant")
                .sku(UUID.randomUUID().toString()).price(new BigDecimal("50000")).stockQuantity(100)
                .status(ProductStatus.ACTIVE).build());
    }

    private DailyCapacity capacity(User provider) {
        return capacities.save(DailyCapacity.builder().provider(provider).capacityDate(deliveryDate.minusDays(1))
                .maxQuantity(1000).reservedQuantity(0).build());
    }

    private void reserveForCaller() {
        ProductVariant variant = variants.findById(variantA).orElseThrow();
        variant.setStockQuantity(variant.getStockQuantity() - 2);
        DailyCapacity capacity = capacities.findById(capacityA).orElseThrow();
        capacity.setReservedQuantity(capacity.getReservedQuantity() + 2);
    }

    private void assertResourcesUnchanged() {
        assertThat(variants.findById(variantA).orElseThrow().getStockQuantity()).isEqualTo(100);
        assertThat(capacities.findById(capacityA).orElseThrow().getReservedQuantity()).isZero();
    }

    private void assertCounts(UUID checkout, int orderCount, int batchCount, int itemCount, int paymentCount) {
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM \"ORDER\" WHERE checkout_id = ?", Integer.class, checkout))
                .isEqualTo(orderCount);
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ORDER_BATCH b JOIN \"ORDER\" o ON b.order_id = o.id "
                + "WHERE o.checkout_id = ?", Integer.class, checkout)).isEqualTo(batchCount);
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ORDER_ITEM i JOIN ORDER_BATCH b ON i.order_batch_id = b.id "
                + "JOIN \"ORDER\" o ON b.order_id = o.id WHERE o.checkout_id = ?", Integer.class, checkout)).isEqualTo(itemCount);
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM PAYMENT_TRANSACTION t JOIN \"ORDER\" o ON t.order_id = o.id "
                + "WHERE o.checkout_id = ?", Integer.class, checkout)).isEqualTo(paymentCount);
    }

    private void assertBadRequest(org.assertj.core.api.ThrowableAssert.ThrowingCallable action) {
        assertThatThrownBy(action).isInstanceOfSatisfying(ResponseStatusException.class,
                ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }
}
