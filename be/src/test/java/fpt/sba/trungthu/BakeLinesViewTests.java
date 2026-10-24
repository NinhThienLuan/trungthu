package fpt.sba.trungthu;

import fpt.sba.trungthu.entity.*;
import fpt.sba.trungthu.entity.enumeration.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EnumSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
@Transactional
class BakeLinesViewTests {
    @Autowired private EntityManager entityManager;
    @Autowired private JdbcTemplate jdbcTemplate;

    private User buyer;
    private User provider;
    private User otherProvider;
    private ProductVariant cake;
    private final LocalDate delivery = LocalDate.of(2026, 10, 20);

    @BeforeEach
    void setUp() {
        buyer = user(UserRole.CUSTOMER);
        provider = user(UserRole.PROVIDER);
        otherProvider = user(UserRole.PROVIDER);
        cake = variant(provider, ProductType.LOOSE_CAKE, "Mooncake", "150g", null);
    }

    @ParameterizedTest
    @EnumSource(OrderStatus.class)
    void includesOnlyAcceptedOrders(OrderStatus status) {
        OrderBatch batch = batch(provider, delivery, status);
        OrderItem item = item(batch, cake, 2, 2);
        Set<OrderStatus> included = Set.of(OrderStatus.CONFIRMED, OrderStatus.DEPOSITED,
                OrderStatus.BAKING_QUEUED, OrderStatus.DELIVERING, OrderStatus.COMPLETED);

        List<Map<String, Object>> lines = lines(provider, delivery.minusDays(1));
        assertThat(lines).hasSize(included.contains(status) ? 1 : 0);
        if (!lines.isEmpty()) {
            assertThat(lines.getFirst().get("order_item_id")).isEqualTo(item.getId());
            assertThat(lines.getFirst().get("order_status")).isEqualTo(status.name());
            assertThat(lines.getFirst().get("order_code")).isEqualTo(batch.getOrder().getOrderCode());
        }
    }

    @ParameterizedTest
    @CsvSource({"2027-01-01,2026-12-31", "2028-03-01,2028-02-29", "2026-11-01,2026-10-31"})
    void bakeDateIsPreviousCalendarDay(LocalDate deliveryDate, LocalDate bakeDate) {
        item(batch(provider, deliveryDate, OrderStatus.CONFIRMED), cake, 1, 1);
        Map<String, Object> line = lines(provider, bakeDate).getFirst();
        assertThat(((java.sql.Date) line.get("delivery_date")).toLocalDate()).isEqualTo(deliveryDate);
        assertThat(((java.sql.Date) line.get("bake_date")).toLocalDate()).isEqualTo(bakeDate);
    }

    @Test
    void preservesCakeAndSetSnapshotsAndExcludesCardsAndServices() {
        OrderBatch batch = batch(provider, delivery, OrderStatus.CONFIRMED);
        ProductVariant box = variant(provider, ProductType.BOX_SHELL, "Gift box", "Set 4", 4);
        ProductVariant card = variant(provider, ProductType.GREETING_CARD, "Card", "Card", null);
        ProductVariant service = variant(provider, ProductType.ADDON_SERVICE, "Wrapping", "Wrapping", null);
        item(batch, cake, 2, 2);
        item(batch, box, 3, 12);
        item(batch, card, 5, 0);
        item(batch, service, 1, 0);
        box.setBoxCapacity(8);
        box.setVariantName("New set name");
        box.getProduct().setName("New product name");
        cake.getProduct().setName("Renamed cake");
        cake.getProduct().setStatus(ProductStatus.ARCHIVED);
        cake.setStatus(VariantStatus.OUT_OF_STOCK);

        List<Map<String, Object>> lines = lines(provider, delivery.minusDays(1));
        assertThat(lines).hasSize(2);
        Map<String, Object> set = lines.stream().filter(line -> line.get("variant_id").equals(box.getId()))
                .findFirst().orElseThrow();
        assertThat(set.get("product_name")).isEqualTo("Gift box");
        assertThat(set.get("variant_name")).isEqualTo("Set 4");
        assertThat(set.get("quantity")).isEqualTo(3);
        assertThat(set.get("bake_quantity")).isEqualTo(12);
        assertThat(lines.stream().filter(line -> line.get("variant_id").equals(cake.getId()))
                .findFirst().orElseThrow().get("product_name")).isEqualTo("Mooncake");
    }

    @Test
    void keepsDistinctItemsForSameVariantWithoutPrematureAggregation() {
        OrderBatch batch = batch(provider, delivery, OrderStatus.CONFIRMED);
        OrderItem first = item(batch, cake, 2, 2);
        OrderItem second = item(batch, cake, 3, 3);
        List<Map<String, Object>> lines = lines(provider, delivery.minusDays(1));
        assertThat(lines).extracting(line -> line.get("order_item_id"))
                .containsExactlyInAnyOrder(first.getId(), second.getId());
        assertThat(lines.stream().mapToInt(line -> (Integer) line.get("bake_quantity")).sum()).isEqualTo(5);
    }

    @Test
    void providerAndBakeDateFiltersKeepProductionTotalsSeparate() {
        item(batch(provider, delivery, OrderStatus.CONFIRMED), cake, 2, 2);
        ProductVariant otherCake = variant(otherProvider, ProductType.LOOSE_CAKE, "Other cake", "200g", null);
        item(batch(otherProvider, delivery, OrderStatus.CONFIRMED), otherCake, 7, 7);
        item(batch(provider, delivery.plusDays(1), OrderStatus.CONFIRMED), cake, 10, 10);

        assertThat(lines(provider, delivery.minusDays(1))).hasSize(1)
                .first().satisfies(line -> assertThat(line.get("bake_quantity")).isEqualTo(2));
        assertThat(lines(otherProvider, delivery.minusDays(1))).hasSize(1)
                .first().satisfies(line -> assertThat(line.get("bake_quantity")).isEqualTo(7));
        assertThat(lines(provider, delivery)).hasSize(1)
                .first().satisfies(line -> assertThat(line.get("bake_quantity")).isEqualTo(10));
        assertThat(lines(provider, delivery.plusDays(2))).isEmpty();
    }

    @Test
    void multiplePaymentsDoNotDuplicateProductionLines() {
        OrderBatch batch = batch(provider, delivery, OrderStatus.DEPOSITED);
        item(batch, cake, 4, 4);
        for (TransactionStatus status : TransactionStatus.values()) {
            entityManager.persist(PaymentTransaction.builder().order(batch.getOrder())
                    .transactionCode(UUID.randomUUID().toString()).transactionType(TransactionType.ORDER_DEPOSIT)
                    .paymentMethod(PaymentMethod.VIETQR).paymentStatus(status).amount(new BigDecimal("20000"))
                    .paidAt(status == TransactionStatus.SUCCESS ? Instant.now() : null).build());
        }
        List<Map<String, Object>> lines = lines(provider, delivery.minusDays(1));
        assertThat(lines).hasSize(1);
        assertThat(lines.getFirst().get("bake_quantity")).isEqualTo(4);
    }

    @Test
    void cancellationIsVisibleWithoutRebuildingView() {
        OrderBatch batch = batch(provider, delivery, OrderStatus.CONFIRMED);
        item(batch, cake, 2, 2);
        assertThat(lines(provider, delivery.minusDays(1))).hasSize(1);
        batch.getOrder().transitionOrderStatus(OrderStatus.CANCELLED);
        assertThat(lines(provider, delivery.minusDays(1))).isEmpty();
    }

    @Test
    void confirmedDepositMakesPendingItemsVisible() {
        OrderBatch batch = batch(provider, delivery, OrderStatus.PENDING_DEPOSIT);
        item(batch, cake, 2, 2);
        assertThat(lines(provider, delivery.minusDays(1))).isEmpty();
        batch.getOrder().transitionOrderStatus(OrderStatus.DEPOSITED);
        batch.getOrder().setHoldExpiresAt(null);
        batch.getOrder().transitionPaymentStatus(OrderPaymentStatus.DEPOSITED);
        assertThat(lines(provider, delivery.minusDays(1))).hasSize(1);
    }

    private List<Map<String, Object>> lines(User seller, LocalDate bakeDate) {
        // JdbcTemplate does not trigger Hibernate's automatic flush.
        entityManager.flush();
        return jdbcTemplate.queryForList("SELECT * FROM v_bake_lines WHERE provider_id = ? AND bake_date = ?",
                seller.getId(), bakeDate);
    }

    private User user(UserRole role) {
        User user = User.builder().email(UUID.randomUUID() + "@test.local").password("test-hash")
                .fullName("Test user").role(role).status(UserStatus.ACTIVE).build();
        entityManager.persist(user);
        return user;
    }

    private ProductVariant variant(User seller, ProductType type, String name, String variantName, Integer capacity) {
        Product product = Product.builder().provider(seller).name(name).productType(type)
                .status(ProductStatus.ACTIVE).build();
        entityManager.persist(product);
        ProductVariant variant = ProductVariant.builder().product(product).variantName(variantName)
                .sku(UUID.randomUUID().toString()).price(new BigDecimal("10000"))
                .boxCapacity(capacity).status(VariantStatus.IN_STOCK).build();
        entityManager.persist(variant);
        return variant;
    }

    private OrderBatch batch(User seller, LocalDate date, OrderStatus status) {
        boolean cod = status == OrderStatus.CONFIRMED;
        Order order = Order.builder().customer(buyer).provider(seller).checkoutId(UUID.randomUUID())
                .orderCode(UUID.randomUUID().toString()).subtotalAmount(new BigDecimal("100000"))
                .totalAmount(new BigDecimal("100000")).depositAmount(cod ? BigDecimal.ZERO : new BigDecimal("50000"))
                .paymentMethod(cod ? PaymentMethod.COD : PaymentMethod.VIETQR).orderStatus(status)
                .receiverName("Recipient").receiverPhone("0900000000").shippingAddress("Test address")
                .holdExpiresAt(status == OrderStatus.PENDING_DEPOSIT ? Instant.now().plusSeconds(900) : null).build();
        entityManager.persist(order);
        OrderBatch batch = OrderBatch.builder().order(order).provider(seller).deliveryDate(date)
                .subtotal(order.getSubtotalAmount()).build();
        entityManager.persist(batch);
        return batch;
    }

    private OrderItem item(OrderBatch batch, ProductVariant variant, int quantity, int bakeQuantity) {
        OrderItem item = OrderItem.builder().orderBatch(batch).variant(variant)
                .productName(variant.getProduct().getName()).variantName(variant.getVariantName())
                .quantity(quantity).unitPrice(new BigDecimal("10000"))
                .subtotal(new BigDecimal("10000").multiply(BigDecimal.valueOf(quantity)))
                .bakeQuantity(bakeQuantity).build();
        entityManager.persist(item);
        return item;
    }
}
