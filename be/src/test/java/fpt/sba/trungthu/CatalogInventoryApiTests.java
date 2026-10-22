package fpt.sba.trungthu;

import fpt.sba.trungthu.common.exception.InventoryConflictException;
import fpt.sba.trungthu.common.security.JwtService;
import fpt.sba.trungthu.dto.request.ReleaseStockCommand;
import fpt.sba.trungthu.dto.request.ReserveStockCommand;
import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.OrderBatch;
import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import fpt.sba.trungthu.repository.DailyCapacityRepository;
import fpt.sba.trungthu.repository.OrderBatchRepository;
import fpt.sba.trungthu.repository.OrderItemRepository;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.InventoryService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
        "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc
class CatalogInventoryApiTests {

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository users;
    @Autowired private fpt.sba.trungthu.repository.SubscriptionRepository subscriptions;
    @Autowired private ProductRepository products;
    @Autowired private ProductVariantRepository variants;
    @Autowired private DailyCapacityRepository capacities;
    @Autowired private OrderRepository orders;
    @Autowired private OrderBatchRepository batches;
    @Autowired private OrderItemRepository items;
    @Autowired private InventoryService inventory;
    @Autowired private PlatformTransactionManager transactions;
    @Autowired private EntityManager entityManager;
    @MockitoBean private JavaMailSender mailSender;

    private User provider;
    private User customer;
    private final LocalDate delivery = LocalDate.of(2026, 10, 24);

    @BeforeEach
    void setUp() {
        provider = users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@shop.test").password("hash")
                .fullName("Baker").storeName("Oven").role(UserRole.PROVIDER).status(UserStatus.ACTIVE)
                .isComplianceApproved(true).isSeasonActive(true).build());
        subscriptions.saveAndFlush(fpt.sba.trungthu.entity.Subscription.builder().provider(provider).planName("MVP")
                .price(java.math.BigDecimal.ZERO).startDate(java.time.LocalDate.of(2026, 1, 1))
                .endDate(java.time.LocalDate.of(2027, 12, 31)).maxProductsAllowed(500)
                .status(fpt.sba.trungthu.entity.enumeration.SubscriptionStatus.ACTIVE).build());
        customer = users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@buyer.test").password("hash")
                .fullName("Buyer").role(UserRole.CUSTOMER).status(UserStatus.ACTIVE).build());
    }

    @Test
    void albumHasOnePrimaryAndActiveRequiresAVariant() throws Exception {
        String created = mvc.perform(post("/api/provider/products").header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Mooncake","productType":"LOOSE_CAKE","status":"ACTIVE"}
                                """))
                .andExpect(status().isBadRequest()).andReturn().getResponse().getContentAsString();
        assertThat(created).contains("DRAFT");

        String productId = mvc.perform(post("/api/provider/products").header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Mooncake","description":"Salted egg","productType":"LOOSE_CAKE"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andReturn().getResponse().getContentAsString();
        String id = productId.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");

        mvc.perform(put("/api/provider/products/{id}", id).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Mooncake","productType":"LOOSE_CAKE","status":"ACTIVE"}
                                """))
                .andExpect(status().isBadRequest());

        mvc.perform(put("/api/provider/products/{id}/images", id).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"images":[{"imageUrl":"https://cdn/a.jpg","isPrimary":true,"displayOrder":1},
                                           {"imageUrl":"https://cdn/b.jpg","isPrimary":true,"displayOrder":2}]}
                                """))
                .andExpect(status().isBadRequest());

        mvc.perform(post("/api/provider/products/{id}/variants", id).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantName":"200g","sku":"CAKE-200","price":50000,"stockQuantity":4,"weightGram":200}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("IN_STOCK"))
                .andExpect(jsonPath("$.data.stockQuantity").value(4));

        mvc.perform(put("/api/provider/products/{id}/images", id).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"images":[{"imageUrl":"https://cdn/side.jpg","isPrimary":false,"displayOrder":2},
                                           {"imageUrl":"https://cdn/front.jpg","isPrimary":true,"displayOrder":1}]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.primaryImageUrl").value("https://cdn/front.jpg"))
                .andExpect(jsonPath("$.data.images[0].isPrimary").value(true));

        mvc.perform(put("/api/provider/products/{id}", id).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Mooncake","productType":"LOOSE_CAKE","status":"ACTIVE"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        mvc.perform(get("/api/products/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.primaryImageUrl").value("https://cdn/front.jpg"))
                .andExpect(jsonPath("$.data.variants[0].purchasable").value(true))
                .andExpect(jsonPath("$.data.variants[0].stockQuantity").doesNotExist());
    }

    @Test
    void stockChangesGoThroughImportAdjustmentAndDiscontinue() throws Exception {
        Created created = createActiveCake("ADJUST-1", 3);
        String productId = created.productId();
        String variantId = created.variantId();

        mvc.perform(put("/api/provider/products/{productId}/variants/{variantId}", productId, variantId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantName":"200g","sku":"ADJUST-1","price":50000,"stockQuantity":9,"weightGram":200,"status":"IN_STOCK"}
                                """))
                .andExpect(status().isBadRequest());

        mvc.perform(post("/api/provider/products/{productId}/variants/{variantId}/adjustments", productId, variantId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"type":"ADJUSTMENT_BROKEN","quantity":9,"reason":"too many"}
                                """))
                .andExpect(status().isConflict());

        mvc.perform(post("/api/provider/products/{productId}/variants/{variantId}/adjustments", productId, variantId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"type":"ADJUSTMENT_EXPIRED","quantity":3,"reason":"stale"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("OUT_OF_STOCK"))
                .andExpect(jsonPath("$.data.stockQuantity").value(0));

        mvc.perform(get("/api/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SOLD_OUT"))
                .andExpect(jsonPath("$.data.variants[0].purchasable").value(false));

        mvc.perform(post("/api/provider/products/{productId}/variants/{variantId}/imports", productId, variantId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":2}"))
                .andExpect(status().isBadRequest());

        mvc.perform(post("/api/provider/products/{productId}/variants/{variantId}/imports", productId, variantId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":2,\"reason\":\"Mẻ mới\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_STOCK"));

        mvc.perform(get("/api/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.variants[0].purchasable").value(true));

        mvc.perform(get("/api/provider/products/{productId}/variants/{variantId}/audits", productId, variantId)
                        .header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(3))
                .andExpect(jsonPath("$.data.content[0].createdBy").value(provider.getEmail()));
    }

    @Test
    void dummyCheckoutAndPaymentRecordSaleAndLockVariantDeletion() throws Exception {
        Created created = createActiveCake("PAY-1", 5);
        mvc.perform(post("/api/cart").header("Authorization", token(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":\"" + created.variantId() + "\",\"quantity\":2}"))
                .andExpect(status().isCreated());
        mvc.perform(patch("/api/cart/{variantId}", created.variantId()).header("Authorization", token(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"selected\":true}"))
                .andExpect(status().isOk());
        String orders = mvc.perform(post("/api/dummy/checkout").header("Authorization", token(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].status").value("PENDING_DEPOSIT"))
                .andReturn().getResponse().getContentAsString();
        String orderId = orders.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
        assertThat(variants.findById(UUID.fromString(created.variantId())).orElseThrow().getStockQuantity()).isEqualTo(3);

        mvc.perform(post("/api/dummy/orders/{id}/pay", orderId).header("Authorization", token(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DEPOSITED"))
                .andExpect(jsonPath("$.data.paymentStatus").value("PAID_FULL"));
        mvc.perform(get("/api/provider/products/{productId}/variants/{variantId}/stats",
                        created.productId(), created.variantId()).header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.inbound").value(5))
                .andExpect(jsonPath("$.data.sold").value(2))
                .andExpect(jsonPath("$.data.onHand").value(3))
                .andExpect(jsonPath("$.data.awaitingPayment").value(0))
                .andExpect(jsonPath("$.data.discrepancy").value(0));

        mvc.perform(delete("/api/provider/products/{productId}/variants/{variantId}",
                        created.productId(), created.variantId()).header("Authorization", token(provider)))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/provider/products/{productId}/variants/{variantId}",
                        created.productId(), created.variantId()).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantName":"200g mới","sku":"PAY-2","price":60000,"weightGram":200}
                                """))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/provider/products/{productId}/variants/{variantId}",
                        created.productId(), created.variantId()).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantName":"200g mới","sku":"PAY-1","price":60000,"weightGram":200}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.variantName").value("200g mới"));
    }

    @Test
    void cancelledOrderMovesFromAwaitingPaymentToCancelled() throws Exception {
        Created created = createActiveCake("CANCEL-1", 5);
        mvc.perform(post("/api/cart").header("Authorization", token(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":\"" + created.variantId() + "\",\"quantity\":2}"))
                .andExpect(status().isCreated());
        mvc.perform(patch("/api/cart/{variantId}", created.variantId()).header("Authorization", token(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"selected\":true}"))
                .andExpect(status().isOk());
        String orders = mvc.perform(post("/api/dummy/checkout").header("Authorization", token(customer)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String orderId = orders.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
        String statsPath = "/api/provider/products/{productId}/variants/{variantId}/stats";

        mvc.perform(get(statsPath, created.productId(), created.variantId()).header("Authorization", token(provider)))
                .andExpect(jsonPath("$.data.awaitingPayment").value(2))
                .andExpect(jsonPath("$.data.cancelled").value(0))
                .andExpect(jsonPath("$.data.onHand").value(3))
                .andExpect(jsonPath("$.data.discrepancy").value(0));

        mvc.perform(post("/api/dummy/orders/{id}/cancel", orderId).header("Authorization", token(customer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        mvc.perform(get(statsPath, created.productId(), created.variantId()).header("Authorization", token(provider)))
                .andExpect(jsonPath("$.data.awaitingPayment").value(0))
                .andExpect(jsonPath("$.data.cancelled").value(2))
                .andExpect(jsonPath("$.data.onHand").value(5))
                .andExpect(jsonPath("$.data.discrepancy").value(0));

        mvc.perform(get("/api/provider/products/{productId}/variants/{variantId}/order-stats",
                        created.productId(), created.variantId()).header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.placedToday").value(1))
                .andExpect(jsonPath("$.data.cancelledToday").value(1))
                .andExpect(jsonPath("$.data.soldToday").value(0))
                .andExpect(jsonPath("$.data.todayByStatus.CANCELLED").value(1))
                .andExpect(jsonPath("$.data.series.length()").value(14));

        mvc.perform(get("/api/provider/dashboard").header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cancelledOrders").value(1))
                .andExpect(jsonPath("$.data.variants[0].cancelledQuantity").value(2))
                .andExpect(jsonPath("$.data.topCancellers[0].email").value(customer.getEmail()))
                .andExpect(jsonPath("$.data.topCancellers[0].quantity").value(2));
    }

    @Test
    void unorderedVariantIsHardDeleted() throws Exception {
        Created created = createActiveCake("DEL-1", 2);
        mvc.perform(delete("/api/provider/products/{productId}/variants/{variantId}",
                        created.productId(), created.variantId()).header("Authorization", token(provider)))
                .andExpect(status().isOk());
        assertThat(variants.findById(UUID.fromString(created.variantId()))).isEmpty();
    }

    @Test
    void reserveConflictsAndReleaseRestoresSellableStock() {
        ProductVariant variant = persistedCake(1);
        DailyCapacity capacity = capacities.saveAndFlush(DailyCapacity.builder().provider(provider)
                .capacityDate(delivery.minusDays(1)).maxQuantity(1).reservedQuantity(0).build());
        TransactionTemplate tx = new TransactionTemplate(transactions);
        ReserveStockCommand command = new ReserveStockCommand(List.of(
                new ReserveStockCommand.ReserveLine(variant.getId(), 1, delivery)));

        tx.executeWithoutResult(status -> inventory.reserve(command));
        entityManager.clear();
        ProductVariant soldOut = variants.findById(variant.getId()).orElseThrow();
        assertThat(soldOut.getStockQuantity()).isZero();
        assertThat(soldOut.getStatus()).isEqualTo(VariantStatus.OUT_OF_STOCK);
        assertThat(capacities.findById(capacity.getId()).orElseThrow().getReservedQuantity()).isEqualTo(1);

        org.junit.jupiter.api.Assertions.assertThrows(InventoryConflictException.class,
                () -> tx.executeWithoutResult(status -> inventory.reserve(command)));

        tx.executeWithoutResult(status -> inventory.release(new ReleaseStockCommand(List.of(
                new ReleaseStockCommand.ReleaseLine(variant.getId(), 1, capacity.getId(), 1)))));
        entityManager.clear();
        ProductVariant restored = variants.findById(variant.getId()).orElseThrow();
        assertThat(restored.getStockQuantity()).isEqualTo(1);
        assertThat(restored.getStatus()).isEqualTo(VariantStatus.IN_STOCK);
        assertThat(capacities.findById(capacity.getId()).orElseThrow().getReservedQuantity()).isZero();
    }

    @Test
    void onlyOneConcurrentReserveWinsTheLastUnit() throws Exception {
        ProductVariant variant = persistedCake(1);
        capacities.saveAndFlush(DailyCapacity.builder().provider(provider)
                .capacityDate(delivery.minusDays(1)).maxQuantity(5).reservedQuantity(0).build());
        TransactionTemplate tx = new TransactionTemplate(transactions);
        ReserveStockCommand command = new ReserveStockCommand(List.of(
                new ReserveStockCommand.ReserveLine(variant.getId(), 1, delivery)));
        ExecutorService pool = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger wins = new AtomicInteger();
        AtomicInteger conflicts = new AtomicInteger();
        for (int i = 0; i < 2; i++) {
            pool.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    tx.executeWithoutResult(status -> inventory.reserve(command));
                    wins.incrementAndGet();
                } catch (InventoryConflictException exception) {
                    conflicts.incrementAndGet();
                } catch (RuntimeException exception) {
                    if (exception.getCause() instanceof InventoryConflictException) {
                        conflicts.incrementAndGet();
                    } else {
                        throw exception;
                    }
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                }
            });
        }
        ready.await();
        start.countDown();
        pool.shutdown();
        assertThat(pool.awaitTermination(10, java.util.concurrent.TimeUnit.SECONDS)).isTrue();
        assertThat(wins.get()).isEqualTo(1);
        assertThat(conflicts.get()).isEqualTo(1);
    }

    @Test
    void discontinueMarksSoldOutAndArchiveWaitsForClosedOrders() throws Exception {
        String draft = mvc.perform(post("/api/provider/products").header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Draft cake\",\"productType\":\"LOOSE_CAKE\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String draftId = draft.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
        mvc.perform(post("/api/provider/products/{id}/archive", draftId).header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ARCHIVED"));
        mvc.perform(get("/api/products/{id}", draftId)).andExpect(status().isNotFound());

        Created created = createActiveCake("STOP-1", 4);
        mvc.perform(post("/api/provider/products/{id}/discontinue", created.productId())
                        .header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SOLD_OUT"));
        mvc.perform(get("/api/products/{id}", created.productId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SOLD_OUT"))
                .andExpect(jsonPath("$.data.variants[0].purchasable").value(false))
                .andExpect(jsonPath("$.data.variants[0].notifyAvailable").value(true));
        mvc.perform(post("/api/provider/products/{productId}/variants/{variantId}/imports",
                        created.productId(), created.variantId()).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":2,\"reason\":\"Nhập lại\"}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/products/{id}", created.productId()))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.variants[0].purchasable").value(true));

        Created busy = createActiveCake("OPEN-1", 3);
        Product product = products.findById(UUID.fromString(busy.productId())).orElseThrow();
        ProductVariant variant = variants.findById(UUID.fromString(busy.variantId())).orElseThrow();
        variant.setProduct(product);
        saveOrder(provider, variant, OrderStatus.DELIVERING, 1, 1);
        mvc.perform(post("/api/provider/products/{id}/archive", busy.productId())
                        .header("Authorization", token(provider)))
                .andExpect(status().isConflict());
        List<Order> openOrders = orders.findAll();
        openOrders.stream()
                .filter(order -> order.getOrderStatus() == OrderStatus.DELIVERING)
                .forEach(order -> order.setOrderStatus(OrderStatus.COMPLETED));
        orders.saveAllAndFlush(openOrders);
        mvc.perform(post("/api/provider/products/{id}/archive", busy.productId())
                        .header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ARCHIVED"));
        mvc.perform(post("/api/provider/products/{productId}/variants/{variantId}/imports",
                        busy.productId(), busy.variantId()).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":1,\"reason\":\"Sau lưu trữ\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void archiveRetailIgnoresAnOpenSetOrder() throws Exception {
        Created cake = createActiveCake("ARCH-RETAIL", 5);
        String setBody = mvc.perform(post("/api/provider/products").header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Set mở\",\"productType\":\"GIFT_SET\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String setId = setBody.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
        Product set = products.findById(UUID.fromString(setId)).orElseThrow();
        Product cakeProduct = products.findById(UUID.fromString(cake.productId())).orElseThrow();
        ProductVariant variant = variants.findById(UUID.fromString(cake.variantId())).orElseThrow();
        variant.setProduct(cakeProduct);
        saveOrder(provider, variant, OrderStatus.DELIVERING, 1, 1, set);

        mvc.perform(post("/api/provider/products/{id}/archive", cake.productId()).header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ARCHIVED"));
        assertThat(products.findById(set.getId()).orElseThrow().getStatus()).isEqualTo(ProductStatus.DRAFT);
        assertThat(variants.findById(variant.getId()).orElseThrow().getStockQuantity()).isEqualTo(5);
    }

    @Test
    void archiveSetWaitsForSetOrdersAndLeavesLooseStock() throws Exception {
        Created cake = createActiveCake("ARCH-SET-CAKE", 5);
        String boxBody = mvc.perform(post("/api/provider/products").header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Hộp\",\"productType\":\"BOX_SHELL\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String boxId = boxBody.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
        String boxVariantBody = mvc.perform(post("/api/provider/products/{id}/variants", boxId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantName":"Hộp 4","sku":"ARCH-BOX","price":20000,"stockQuantity":1,"boxCapacity":4}
                                """))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String boxVariantId = boxVariantBody.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
        mvc.perform(put("/api/provider/products/{id}/images", boxId).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"images":[{"imageUrl":"https://cdn/box.jpg","isPrimary":true,"displayOrder":0}]}
                                """))
                .andExpect(status().isOk());
        mvc.perform(put("/api/provider/products/{id}", boxId).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Hộp\",\"productType\":\"BOX_SHELL\",\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());
        String setBody = mvc.perform(post("/api/provider/products").header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Set lưu\",\"productType\":\"GIFT_SET\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String setId = setBody.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
        mvc.perform(post("/api/provider/products/{id}/composition", setId).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"box":{"variantId":"%s","quantity":1},"cakes":[{"variantId":"%s","quantity":4}]}
                                """.formatted(boxVariantId, cake.variantId())))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/provider/products/{id}/composition/stock", setId).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"setCount\":1,\"reason\":\"Nhập set\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/provider/products/{id}/images", setId).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"images":[{"imageUrl":"https://cdn/set.jpg","isPrimary":true,"displayOrder":0}]}
                                """))
                .andExpect(status().isOk());
        mvc.perform(put("/api/provider/products/{id}", setId).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Set lưu\",\"productType\":\"GIFT_SET\",\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());

        Product set = products.findById(UUID.fromString(setId)).orElseThrow();
        Product cakeProduct = products.findById(UUID.fromString(cake.productId())).orElseThrow();
        ProductVariant variant = variants.findById(UUID.fromString(cake.variantId())).orElseThrow();
        variant.setProduct(cakeProduct);
        Order order = saveOrder(provider, variant, OrderStatus.DELIVERING, 1, 1, set);
        mvc.perform(post("/api/provider/products/{id}/archive", setId).header("Authorization", token(provider)))
                .andExpect(status().isConflict());
        order.setOrderStatus(OrderStatus.COMPLETED);
        orders.saveAndFlush(order);
        mvc.perform(post("/api/provider/products/{id}/archive", setId).header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ARCHIVED"));
        assertThat(variants.findById(variant.getId()).orElseThrow().getStockQuantity()).isEqualTo(5);
        assertThat(products.findById(UUID.fromString(cake.productId())).orElseThrow().getStatus())
                .isEqualTo(ProductStatus.ACTIVE);
    }

    @Test
    void discontinueRetailCancelsPendingDepositOrders() throws Exception {
        Created cake = createActiveCake("PEND-CANCEL", 4);
        Product product = products.findById(UUID.fromString(cake.productId())).orElseThrow();
        ProductVariant variant = variants.findById(UUID.fromString(cake.variantId())).orElseThrow();
        variant.setProduct(product);
        Order order = saveOrder(provider, variant, OrderStatus.PENDING_DEPOSIT, 1, 0);

        mvc.perform(post("/api/provider/products/{id}/discontinue", cake.productId())
                        .header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SOLD_OUT"));

        assertThat(orders.findById(order.getId()).orElseThrow().getOrderStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(orders.findById(order.getId()).orElseThrow().getHoldExpiresAt()).isNull();
    }

    @Test
    void draftVariantOnlyEditsOpeningRetailStock() throws Exception {
        String productBody = mvc.perform(post("/api/provider/products").header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Nháp\",\"productType\":\"LOOSE_CAKE\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String productId = productBody.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
        String variantBody = mvc.perform(post("/api/provider/products/{id}/variants", productId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantName":"150g","sku":"DRAFT-STOCK","price":50000,"stockQuantity":5,"weightGram":150}
                                """))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String variantId = variantBody.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");

        mvc.perform(post("/api/provider/products/{productId}/variants/{variantId}/adjustments", productId, variantId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"ADJUSTMENT_BROKEN\",\"quantity\":1,\"reason\":\"mẻ\"}"))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/provider/products/{productId}/variants/{variantId}/terminate", productId, variantId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"hết\"}"))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/provider/products/{productId}/variants/{variantId}/imports", productId, variantId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":1,\"reason\":\"thêm\"}"))
                .andExpect(status().isConflict());

        mvc.perform(put("/api/provider/products/{productId}/variants/{variantId}", productId, variantId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantName":"150g","sku":"DRAFT-STOCK","price":50000,"stockQuantity":2,"weightGram":150}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stockQuantity").value(2));
        mvc.perform(get("/api/provider/products/{productId}/variants/{variantId}/stats", productId, variantId)
                        .header("Authorization", token(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.inbound").value(2))
                .andExpect(jsonPath("$.data.looseOnHand").value(2))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
        mvc.perform(post("/api/provider/products/{id}/variants", productId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantName":"200g","sku":"DRAFT-ZERO","price":50000,"stockQuantity":0,"weightGram":200}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", org.hamcrest.Matchers.containsString("lớn hơn 0")));
    }

    private Created createActiveCake(String sku, int stock) throws Exception {
        String body = mvc.perform(post("/api/provider/products").header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Mooncake\",\"productType\":\"LOOSE_CAKE\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String productId = body.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
        String variantBody = mvc.perform(post("/api/provider/products/{id}/variants", productId)
                        .header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantName":"200g","sku":"%s","price":50000,"stockQuantity":%d,"weightGram":200}
                                """.formatted(sku, stock)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String variantId = variantBody.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
        mvc.perform(put("/api/provider/products/{id}/images", productId).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"images":[{"imageUrl":"https://cdn/cake.jpg","isPrimary":true,"displayOrder":0}]}
                                """))
                .andExpect(status().isOk());
        mvc.perform(put("/api/provider/products/{id}", productId).header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Mooncake\",\"productType\":\"LOOSE_CAKE\",\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());
        return new Created(productId, variantId);
    }

    private record Created(String productId, String variantId) {
    }

    private ProductVariant persistedCake(int stock) {
        Product product = products.saveAndFlush(Product.builder().provider(provider).name("Live cake")
                .productType(ProductType.LOOSE_CAKE).status(ProductStatus.ACTIVE).build());
        return variants.saveAndFlush(ProductVariant.builder().product(product).variantName("150g")
                .sku(UUID.randomUUID().toString()).price(new BigDecimal("40000")).weightGram(150)
                .stockQuantity(stock)
                .status(stock > 0 ? VariantStatus.IN_STOCK : VariantStatus.OUT_OF_STOCK)
                .build());
    }

    private Order saveOrder(User seller, ProductVariant variant, OrderStatus status, int quantity, int bakeQuantity) {
        return saveOrder(seller, variant, status, quantity, bakeQuantity, null);
    }

    private Order saveOrder(User seller, ProductVariant variant, OrderStatus status, int quantity, int bakeQuantity,
            Product sourceSet) {
        boolean pending = status == OrderStatus.PENDING_DEPOSIT;
        Order order = orders.saveAndFlush(Order.builder().customer(customer).provider(seller).checkoutId(UUID.randomUUID())
                .orderCode(UUID.randomUUID().toString()).subtotalAmount(new BigDecimal("100000"))
                .totalAmount(new BigDecimal("100000"))
                .depositAmount(pending ? new BigDecimal("50000") : BigDecimal.ZERO)
                .paymentMethod(pending ? PaymentMethod.VIETQR : PaymentMethod.COD).orderStatus(status)
                .holdExpiresAt(pending ? java.time.Instant.now().plusSeconds(900) : null)
                .receiverName("Recipient").receiverPhone("0900000000").shippingAddress("Address").build());
        OrderBatch batch = batches.saveAndFlush(OrderBatch.builder().order(order).provider(seller)
                .deliveryDate(delivery).subtotal(order.getSubtotalAmount()).build());
        items.saveAndFlush(OrderItem.builder().orderBatch(batch).variant(variant).sourceSet(sourceSet)
                .productName(variant.getProduct().getName()).variantName(variant.getVariantName())
                .quantity(quantity).unitPrice(new BigDecimal("10000"))
                .subtotal(new BigDecimal("10000").multiply(BigDecimal.valueOf(quantity)))
                .bakeQuantity(bakeQuantity).build());
        return order;
    }

    private String token(User user) {
        return "Bearer " + jwtService.generateAccessToken(user);
    }
}
