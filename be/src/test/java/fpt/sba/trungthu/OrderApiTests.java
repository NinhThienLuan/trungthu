package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.JwtService;
import fpt.sba.trungthu.entity.*;
import fpt.sba.trungthu.entity.enumeration.*;
import fpt.sba.trungthu.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
        "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc
@Transactional
class OrderApiTests {
    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;
    @Autowired private EntityManager entityManager;
    @Autowired private UserRepository users;
    @Autowired private ProductRepository products;
    @Autowired private ProductVariantRepository variants;
    @Autowired private OrderRepository orders;
    @Autowired private OrderBatchRepository batches;
    @Autowired private OrderItemRepository items;
    @Autowired private PaymentTransactionRepository payments;

    private User buyer;
    private User otherBuyer;
    private User seller;
    private User otherSeller;
    private User admin;
    private ProductVariant variant;
    private ProductVariant otherVariant;
    private Order deposited;
    private Order cod;
    private Order pending;

    @BeforeEach
    void setUp() {
        buyer = user(UserRole.CUSTOMER);
        otherBuyer = user(UserRole.CUSTOMER);
        seller = user(UserRole.PROVIDER);
        otherSeller = user(UserRole.PROVIDER);
        admin = user(UserRole.PLATFORM_ADMIN);
        variant = variant(seller);
        otherVariant = variant(otherSeller);
        UUID checkout = UUID.randomUUID();
        deposited = order(buyer, seller, checkout, OrderStatus.DEPOSITED, 20, 10);
        cod = order(buyer, otherSeller, checkout, OrderStatus.CONFIRMED, 21, 11);
        pending = order(otherBuyer, seller, UUID.randomUUID(), OrderStatus.PENDING_DEPOSIT, 22, 12);
        payment(deposited, "50000", TransactionStatus.SUCCESS);
        payment(deposited, "20000", TransactionStatus.PENDING);
        payment(deposited, "10000", TransactionStatus.CANCELLED);
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    void buyerListOnlyContainsOwnOrdersAndSuccessfulPaymentTotals() throws Exception {
        mvc.perform(get("/api/orders/me").header("Authorization", token(buyer))
                        .param("customerId", otherBuyer.getId().toString())
                        .param("providerId", seller.getId().toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[*].id",
                        containsInAnyOrder(deposited.getId().toString(), cod.getId().toString())))
                .andExpect(jsonPath("$.data.content[0].id").value(cod.getId().toString()))
                .andExpect(jsonPath("$.data.content[0].paidAmount").value(0))
                .andExpect(jsonPath("$.data.content[0].remainingAmount").value(100000))
                .andExpect(jsonPath("$.data.content[1].paidAmount").value(50000))
                .andExpect(jsonPath("$.data.content[1].remainingAmount").value(50000))
                .andExpect(jsonPath("$.data.content[0].lines").doesNotExist())
                .andExpect(jsonPath("$.data.content[0].receiverPhone").doesNotExist())
                .andExpect(jsonPath("$.data.content[0].checkoutId").doesNotExist());
    }

    @Test
    void sellerListOnlyContainsTheirStoreOrders() throws Exception {
        mvc.perform(get("/api/provider/orders").header("Authorization", token(seller))
                        .param("providerId", otherSeller.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[*].id",
                        containsInAnyOrder(deposited.getId().toString(), pending.getId().toString())))
                .andExpect(jsonPath("$.data.content[0].providerId").value(seller.getId().toString()))
                .andExpect(jsonPath("$.data.content[1].paidAmount").value(50000));
    }

    @Test
    void buyerAndOwningSellerCanReadDetailsWithoutEntitiesOrInternalFields() throws Exception {
        for (User owner : new User[]{buyer, seller}) {
            mvc.perform(get("/api/orders/{id}", deposited.getId()).header("Authorization", token(owner)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id").value(deposited.getId().toString()))
                    .andExpect(jsonPath("$.data.receiverName").value("Recipient"))
                    .andExpect(jsonPath("$.data.receiverPhone").value("0900000000"))
                    .andExpect(jsonPath("$.data.deliveryDate").value("2026-10-20"))
                    .andExpect(jsonPath("$.data.subtotalAmount").value(90000))
                    .andExpect(jsonPath("$.data.shippingFee").value(10000))
                    .andExpect(jsonPath("$.data.totalAmount").value(100000))
                    .andExpect(jsonPath("$.data.depositAmount").value(50000))
                    .andExpect(jsonPath("$.data.paidAmount").value(50000))
                    .andExpect(jsonPath("$.data.remainingAmount").value(50000))
                    .andExpect(jsonPath("$.data.lines[0].productName").value("Original cake"))
                    .andExpect(jsonPath("$.data.lines[0].quantity").value(2))
                    .andExpect(jsonPath("$.data.lines[0].unitPrice").value(45000))
                    .andExpect(jsonPath("$.data.customer").doesNotExist())
                    .andExpect(jsonPath("$.data.provider").doesNotExist())
                    .andExpect(jsonPath("$.data.password").doesNotExist())
                    .andExpect(jsonPath("$.data.vatTaxCode").doesNotExist())
                    .andExpect(jsonPath("$.data.lines[0].sku").doesNotExist())
                    .andExpect(jsonPath("$.data.lines[0].bakeQuantity").doesNotExist());
        }
    }

    @Test
    void otherBuyerAndOtherSellerCannotReadOrderEvenInSameCheckout() throws Exception {
        for (User outsider : new User[]{otherBuyer, otherSeller}) {
            mvc.perform(get("/api/orders/{id}", deposited.getId()).header("Authorization", token(outsider)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.message").value("Order not found"))
                    .andExpect(jsonPath("$.data").isEmpty());
        }
        mvc.perform(get("/api/orders/{id}", UUID.randomUUID()).header("Authorization", token(buyer)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order not found"));
    }

    @Test
    void rejectsWrongRolesOnBuyerAndSellerEndpoints() throws Exception {
        mvc.perform(get("/api/provider/orders").header("Authorization", token(buyer)))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/orders/me").header("Authorization", token(seller)))
                .andExpect(status().isForbidden());
        for (String path : new String[]{"/api/orders/me", "/api/provider/orders", "/api/orders/" + deposited.getId()}) {
            mvc.perform(get(path).header("Authorization", token(admin))).andExpect(status().isForbidden());
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/orders/me", "/api/provider/orders", "/api/orders/{id}"})
    void requiresAuthentication(String path) throws Exception {
        mvc.perform(get(path.replace("{id}", deposited.getId().toString())))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void rejectsMalformedAndRefreshTokens() throws Exception {
        for (String token : new String[]{"Bearer invalid", "Bearer " + jwtService.generateRefreshToken(buyer)}) {
            mvc.perform(get("/api/orders/me").header("Authorization", token))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    void revokedAccountAndChangedRoleAreCheckedAgainstDatabase() throws Exception {
        String buyerToken = token(buyer);
        User current = users.findById(buyer.getId()).orElseThrow();
        current.setRole(UserRole.PROVIDER);
        users.saveAndFlush(current);
        mvc.perform(get("/api/orders/me").header("Authorization", buyerToken))
                .andExpect(status().isForbidden());
        current.setStatus(UserStatus.SUSPENDED);
        users.saveAndFlush(current);
        mvc.perform(get("/api/provider/orders").header("Authorization", buyerToken))
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"buyer", "seller"})
    void paginatesWithoutDuplicatesAndKeepsTotalsForOutOfRangePage(String role) throws Exception {
        String path = listPath(role);
        String token = token(role.equals("buyer") ? buyer : seller);
        String newest = (role.equals("buyer") ? cod : pending).getId().toString();
        mvc.perform(get(path).header("Authorization", token).param("page", "0").param("size", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.data.content[0].id").value(newest))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.totalPages").value(2));
        mvc.perform(get(path).header("Authorization", token).param("page", "1").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].id").value(deposited.getId().toString()));
        mvc.perform(get(path).header("Authorization", token).param("page", "99").param("size", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.content.length()").value(0))
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @ParameterizedTest
    @ValueSource(strings = {"buyer", "seller"})
    void filtersStatusAndDeliveryDatesInclusively(String role) throws Exception {
        String path = listPath(role);
        String token = token(role.equals("buyer") ? buyer : seller);
        mvc.perform(get(path).header("Authorization", token).param("status", "DEPOSITED")
                        .param("from", "2026-10-20").param("to", "2026-10-20"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].id").value(deposited.getId().toString()));
        mvc.perform(get(path).header("Authorization", token).param("from", "2026-10-21"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(get(path).header("Authorization", token).param("to", "2026-10-20"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].id").value(deposited.getId().toString()));
        mvc.perform(get(path).header("Authorization", token).param("status", "CANCELLED"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @ParameterizedTest
    @CsvSource({"page,-1", "size,0", "size,101", "page,abc", "status,UNKNOWN", "from,not-a-date"})
    void rejectsInvalidFiltersOnBothLists(String parameter, String value) throws Exception {
        mvc.perform(get("/api/orders/me").header("Authorization", token(buyer)).param(parameter, value))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/provider/orders").header("Authorization", token(seller)).param(parameter, value))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsReversedDateRangeAndInvalidOrderId() throws Exception {
        mvc.perform(get("/api/orders/me").header("Authorization", token(buyer))
                        .param("from", "2026-10-22").param("to", "2026-10-20"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/provider/orders").header("Authorization", token(seller))
                        .param("from", "2026-10-22").param("to", "2026-10-20"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/orders/not-a-uuid").header("Authorization", token(buyer)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsEmptyPageForBuyerWithNoOrders() throws Exception {
        User emptyBuyer = user(UserRole.CUSTOMER);
        mvc.perform(get("/api/orders/me").header("Authorization", token(emptyBuyer)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(0))
                .andExpect(jsonPath("$.data.content.length()").value(0));
    }

    @Test
    void fullyPaidOrderHasNoRemainingAmount() throws Exception {
        payment(deposited, "50000", TransactionStatus.SUCCESS, TransactionType.ORDER_BALANCE);
        Order current = orders.findById(deposited.getId()).orElseThrow();
        current.setPaymentStatus(OrderPaymentStatus.PAID_FULL);
        orders.saveAndFlush(current);
        mvc.perform(get("/api/orders/{id}", deposited.getId()).header("Authorization", token(buyer)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.paidAmount").value(100000))
                .andExpect(jsonPath("$.data.remainingAmount").value(0));
    }

    @Test
    void detailUsesSnapshotsAfterCatalogChanges() throws Exception {
        ProductVariant current = variants.findById(variant.getId()).orElseThrow();
        current.setVariantName("Changed variant");
        current.setPrice(new BigDecimal("999999"));
        current.getProduct().setName("Changed product");
        entityManager.flush();
        entityManager.clear();
        mvc.perform(get("/api/orders/{id}", deposited.getId()).header("Authorization", token(buyer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lines[0].productName").value("Original cake"))
                .andExpect(jsonPath("$.data.lines[0].variantName").value("150g"))
                .andExpect(jsonPath("$.data.lines[0].unitPrice").value(45000));
    }

    @Test
    void readingExpiredHoldDoesNotChangeOrderState() throws Exception {
        mvc.perform(get("/api/orders/{id}", pending.getId()).header("Authorization", token(otherBuyer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING_DEPOSIT"))
                .andExpect(jsonPath("$.data.holdExpiresAt").isNotEmpty());
        assertThat(orders.findById(pending.getId()).orElseThrow().getOrderStatus())
                .isEqualTo(OrderStatus.PENDING_DEPOSIT);
    }

    private User user(UserRole role) {
        return users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@test.local").password("test-hash")
                .fullName("Test user").storeName(role == UserRole.PROVIDER ? "Test bakery" : null)
                .role(role).status(UserStatus.ACTIVE).build());
    }

    private Order order(User customer, User provider, UUID checkoutId, OrderStatus status, int deliveryDay, int hour) {
        boolean isCod = status == OrderStatus.CONFIRMED;
        Instant orderedAt = Instant.parse("2026-10-16T" + hour + ":00:00Z");
        Order order = orders.saveAndFlush(Order.builder().customer(customer).provider(provider).checkoutId(checkoutId)
                .orderCode(UUID.randomUUID().toString()).subtotalAmount(new BigDecimal("90000"))
                .shippingFee(new BigDecimal("10000")).totalAmount(new BigDecimal("100000"))
                .depositAmount(isCod ? BigDecimal.ZERO : new BigDecimal("50000"))
                .paymentMethod(isCod ? PaymentMethod.COD : PaymentMethod.VIETQR).orderStatus(status)
                .paymentStatus(status == OrderStatus.DEPOSITED ? OrderPaymentStatus.DEPOSITED : OrderPaymentStatus.UNPAID)
                .receiverName("Recipient").receiverPhone("0900000000").shippingAddress("Test address")
                .orderedAt(orderedAt).holdExpiresAt(status == OrderStatus.PENDING_DEPOSIT ? orderedAt.plusSeconds(900) : null)
                .build());
        OrderBatch batch = batches.saveAndFlush(OrderBatch.builder().order(order).provider(provider)
                .deliveryDate(LocalDate.of(2026, 10, deliveryDay)).subtotal(order.getSubtotalAmount()).build());
        ProductVariant lineVariant = provider.getId().equals(seller.getId()) ? variant : otherVariant;
        items.saveAndFlush(OrderItem.builder().orderBatch(batch).variant(lineVariant).productName("Original cake")
                .variantName("150g").quantity(2).unitPrice(new BigDecimal("45000"))
                .subtotal(new BigDecimal("90000")).bakeQuantity(2).build());
        return order;
    }

    private ProductVariant variant(User provider) {
        Product product = products.save(Product.builder().provider(provider).name("Original cake")
                .productType(ProductType.LOOSE_CAKE).status(ProductStatus.ACTIVE).build());
        return variants.save(ProductVariant.builder().product(product).variantName("150g")
                .sku(UUID.randomUUID().toString()).price(new BigDecimal("45000"))
                .weightGram(150).status(VariantStatus.IN_STOCK).build());
    }

    private void payment(Order order, String amount, TransactionStatus status) {
        payment(order, amount, status, TransactionType.ORDER_DEPOSIT);
    }

    private void payment(Order order, String amount, TransactionStatus status, TransactionType type) {
        payments.saveAndFlush(PaymentTransaction.builder().order(order).transactionCode(UUID.randomUUID().toString())
                .transactionType(type).paymentMethod(PaymentMethod.VIETQR)
                .amount(new BigDecimal(amount)).paymentStatus(status)
                .paidAt(status == TransactionStatus.SUCCESS ? Instant.parse("2026-10-16T10:10:00Z") : null).build());
    }

    private String token(User user) {
        return "Bearer " + jwtService.generateAccessToken(user);
    }

    private String listPath(String role) {
        return role.equals("buyer") ? "/api/orders/me" : "/api/provider/orders";
    }
}
