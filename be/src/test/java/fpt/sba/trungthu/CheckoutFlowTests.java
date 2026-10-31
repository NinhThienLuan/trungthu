package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.controller.VietQrController;
import fpt.sba.trungthu.dto.request.CheckoutRequest;
import fpt.sba.trungthu.dto.response.CheckoutPreviewResponse;
import fpt.sba.trungthu.entity.*;
import fpt.sba.trungthu.entity.enumeration.*;
import fpt.sba.trungthu.repository.*;
import fpt.sba.trungthu.service.CheckoutService;
import fpt.sba.trungthu.service.OrderLifecycleService;
import fpt.sba.trungthu.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
class CheckoutFlowTests {
    @Autowired private CheckoutService checkout;
    @Autowired private OrderLifecycleService lifecycle;
    @Autowired private VietQrController vietQr;
    @Autowired private UserRepository users;
    @Autowired private ProductRepository products;
    @Autowired private ProductVariantRepository variants;
    @Autowired private DailyCapacityRepository capacities;
    @Autowired private SubscriptionRepository subscriptions;
    @Autowired private OrderRepository orders;
    @Autowired private OrderItemRepository orderItems;
    @Autowired private PaymentTransactionRepository payments;
    @Autowired private PromotionRepository promotions;
    @Autowired private PlatformTransactionManager transactionManager;
    @MockitoBean private SecurityContextService security;
    @MockitoSpyBean private OrderService orderService;

    private User customer;
    private ProductVariant cake;
    private ProductVariant box;
    /** Bánh lẻ của xưởng hộp: hộp chỉ bán kèm bánh, bánh tính tiền riêng */
    private ProductVariant boxCake;
    private DailyCapacity cakeCapacity;
    private DailyCapacity boxCapacity;
    private LocalDate delivery;

    @BeforeEach
    void setUp() {
        delivery = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(5);
        customer = user(UserRole.CUSTOMER, false);
        User cakeProvider = user(UserRole.PROVIDER, true);
        User boxProvider = user(UserRole.PROVIDER, true);
        cakeProvider.setBankAccountNumber("111222333");
        users.save(cakeProvider);
        cake = variant(cakeProvider, ProductType.LOOSE_CAKE, "100000", null);
        box = variant(boxProvider, ProductType.BOX_SHELL, "200000", 2);
        boxCake = variant(boxProvider, ProductType.LOOSE_CAKE, "50000", null);
        cakeCapacity = capacity(cakeProvider);
        boxCapacity = capacity(boxProvider);
        when(security.getCurrentUser()).thenReturn(customer);
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void previewDoesNotReserveAndCheckoutSplitsProvidersThenCancellationReleasesOnce() {
        CheckoutRequest request = request();
        CheckoutPreviewResponse preview = checkout.preview(request);
        assertThat(preview.groups()).hasSize(2);
        assertThat(preview.grandTotal()).isEqualByComparingTo("520000");
        assertThat(variants.findById(cake.getId()).orElseThrow().getStockQuantity()).isEqualTo(10);
        assertThat(capacities.findById(cakeCapacity.getId()).orElseThrow().getReservedQuantity()).isZero();

        var created = checkout.checkout(request);
        assertThat(created).hasSize(2);
        var persisted = created.stream().map(detail -> orders.findById(detail.getId()).orElseThrow()).toList();
        assertThat(persisted).extracting(Order::getCheckoutId).containsOnly(persisted.getFirst().getCheckoutId());
        Order cod = persisted.stream().filter(order -> order.getPaymentMethod() == PaymentMethod.COD).findFirst().orElseThrow();
        Order qr = persisted.stream().filter(order -> order.getPaymentMethod() == PaymentMethod.VIETQR).findFirst().orElseThrow();
        assertThat(cod.getOrderStatus()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(qr.getOrderStatus()).isEqualTo(OrderStatus.PENDING_DEPOSIT);
        assertThat(qr.getHoldExpiresAt()).isEqualTo(qr.getOrderedAt().plusSeconds(5 * 60 * 60));
        assertThat(qr.getDepositAmount()).isEqualByComparingTo("160000");
        when(security.getCurrentUserId()).thenReturn(customer.getId());
        var instruction = vietQr.getVietQr(qr.getId()).getBody().getData();
        assertThat(instruction.amount()).isEqualByComparingTo("160000");
        assertThat(instruction.imageUrl()).contains("img.vietqr.io/image/VCB-123456789-compact2.svg")
                .contains("amount=160000");
        assertThat(variants.findById(cake.getId()).orElseThrow().getStockQuantity()).isEqualTo(8);
        assertThat(capacities.findById(cakeCapacity.getId()).orElseThrow().getReservedQuantity()).isEqualTo(2);
        assertThat(capacities.findById(boxCapacity.getId()).orElseThrow().getReservedQuantity()).isEqualTo(2);

        lifecycle.cancel(qr.getId());
        assertThat(variants.findById(box.getId()).orElseThrow().getStockQuantity()).isEqualTo(10);
        assertThat(capacities.findById(boxCapacity.getId()).orElseThrow().getReservedQuantity()).isZero();
        assertThat(payments.findByOrderIdOrderByCreatedAtAsc(qr.getId()).getFirst().getPaymentStatus())
                .isEqualTo(TransactionStatus.CANCELLED);
        assertThatThrownBy(() -> lifecycle.cancel(qr.getId())).isInstanceOf(ResponseStatusException.class);
        assertThat(capacities.findById(boxCapacity.getId()).orElseThrow().getReservedQuantity()).isZero();
    }

    @Test
    void persistenceFailureRollsBackStockAndCapacityAcrossAllProviders() {
        new TransactionTemplate(transactionManager).executeWithoutResult(status ->
                doThrow(new IllegalStateException("persistence failed")).when(orderService).createOrders(any()));
        try {
            assertThatThrownBy(() -> checkout.checkout(request()))
                    .isInstanceOf(IllegalStateException.class).hasMessageContaining("persistence failed");
            assertThat(variants.findById(cake.getId()).orElseThrow().getStockQuantity()).isEqualTo(10);
            assertThat(variants.findById(box.getId()).orElseThrow().getStockQuantity()).isEqualTo(10);
            assertThat(capacities.findById(cakeCapacity.getId()).orElseThrow().getReservedQuantity()).isZero();
            assertThat(capacities.findById(boxCapacity.getId()).orElseThrow().getReservedQuantity()).isZero();
            assertThat(orders.findAll().stream().noneMatch(order -> order.getCustomer().getId().equals(customer.getId())))
                    .isTrue();
        } finally {
            reset(orderService);
        }
    }

    @Test
    void sellerConfirmsDepositAndCollectsBalanceOnDelivery() {
        var created = checkout.checkout(request());
        Order qr = created.stream().map(detail -> orders.findById(detail.getId()).orElseThrow())
                .filter(order -> order.getPaymentMethod() == PaymentMethod.VIETQR).findFirst().orElseThrow();
        when(security.getCurrentUser()).thenReturn(users.findById(qr.getProvider().getId()).orElseThrow());
        lifecycle.confirmDeposit(qr.getId(), new BigDecimal("160000"));
        assertThat(orders.findById(qr.getId()).orElseThrow().getOrderStatus()).isEqualTo(OrderStatus.DEPOSITED);
        assertThat(orders.findById(qr.getId()).orElseThrow().getHoldExpiresAt()).isNull();
        lifecycle.expire(qr.getId());
        lifecycle.changeStatus(qr.getId(), OrderStatus.BAKING_QUEUED, null);
        lifecycle.changeStatus(qr.getId(), OrderStatus.DELIVERING, null);
        lifecycle.changeStatus(qr.getId(), OrderStatus.COMPLETED, new BigDecimal("160000"));
        assertThat(payments.sumSuccessfulAmountByOrderId(qr.getId())).isEqualByComparingTo("320000");
        assertThat(orders.findById(qr.getId()).orElseThrow().getPaymentStatus())
                .isEqualTo(OrderPaymentStatus.PAID_FULL);
        assertThat(capacities.findById(boxCapacity.getId()).orElseThrow().getReservedQuantity()).isEqualTo(2);
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void vietQrCreatesDistinctInstructionsPerSellerAndOnlyOwnerConfirms() {
        CheckoutRequest request = new CheckoutRequest("Buyer", "0123456789", "Address", null, List.of(
                new CheckoutRequest.Group(delivery, "Hồ Chí Minh", "Quận 1", PaymentMethod.VIETQR, true,
                        List.of(new CheckoutRequest.Item(cake.getId(), null, 2, null, null))),
                new CheckoutRequest.Group(delivery, "Hồ Chí Minh", "Quận 1", PaymentMethod.VIETQR, true,
                        List.of(new CheckoutRequest.Item(box.getId(), null, 1, "Chuc mung", List.of(boxCake.getId(), boxCake.getId()))))));
        when(security.getCurrentUserId()).thenReturn(customer.getId());
        var created = checkout.checkout(request);
        assertThat(created).hasSize(2);
        var firstOrder = orders.findById(created.get(0).getId()).orElseThrow();
        var secondOrder = orders.findById(created.get(1).getId()).orElseThrow();
        var firstProvider = users.findById(firstOrder.getProvider().getId()).orElseThrow();
        var secondProvider = users.findById(secondOrder.getProvider().getId()).orElseThrow();
        var first = vietQr.getVietQr(firstOrder.getId()).getBody().getData();
        var second = vietQr.getVietQr(secondOrder.getId()).getBody().getData();
        assertThat(first.accountNumber()).isEqualTo(firstProvider.getBankAccountNumber());
        assertThat(second.accountNumber()).isEqualTo(secondProvider.getBankAccountNumber());
        assertThat(first.accountNumber()).isNotEqualTo(second.accountNumber());
        assertThat(first.transferContent()).isNotEqualTo(second.transferContent());
        assertThat(first.holdExpiresAt()).isEqualTo(firstOrder.getOrderedAt().plusSeconds(5 * 60 * 60));
        assertThat(second.holdExpiresAt()).isEqualTo(secondOrder.getOrderedAt().plusSeconds(5 * 60 * 60));

        when(security.getCurrentUser()).thenReturn(firstProvider);
        when(security.getCurrentUserId()).thenReturn(firstProvider.getId());
        assertThatThrownBy(() -> lifecycle.confirmDeposit(secondOrder.getId(), second.amount()))
                .isInstanceOf(ResponseStatusException.class);
        lifecycle.confirmDeposit(firstOrder.getId(), first.amount());
        assertThat(orders.findById(firstOrder.getId()).orElseThrow().getOrderStatus())
                .isEqualTo(OrderStatus.DEPOSITED);
        assertThat(orders.findById(secondOrder.getId()).orElseThrow().getOrderStatus())
                .isEqualTo(OrderStatus.PENDING_DEPOSIT);
        assertThat(payments.sumSuccessfulAmountByOrderId(firstOrder.getId())).isEqualByComparingTo(first.amount());
    }

    @Test
    void runningPromotionLowersUnitPriceAndOrderTotal() {
        User cakeProvider = users.findById(products.findById(cake.getProduct().getId()).orElseThrow()
                .getProvider().getId()).orElseThrow();
        promotions.save(Promotion.builder().provider(cakeProvider).name("Mua 1 tang 1")
                .type(PromotionType.BUY_X_GET_Y).buyQuantity(1).freeQuantity(1)
                .startDate(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"))).endDate(delivery).build());
        // promotion hết hạn của cùng xưởng không được áp
        promotions.save(Promotion.builder().provider(cakeProvider).name("Old").type(PromotionType.PERCENT_OFF)
                .minQuantity(1).percentOff(90).startDate(delivery.minusDays(30)).endDate(delivery.minusDays(20)).build());

        CheckoutPreviewResponse preview = checkout.preview(request());
        var cod = preview.groups().stream().filter(g -> g.paymentMethod() == PaymentMethod.COD).findFirst().orElseThrow();
        assertThat(cod.totalAmount()).isEqualByComparingTo("100000");
        assertThat(cod.discountAmount()).isEqualByComparingTo("100000");
        assertThat(cod.lines().getFirst().promotion()).isEqualTo("Mua 1 tặng 1");
        assertThat(cod.shippingFee()).isEqualByComparingTo("0");
        assertThat(preview.grandTotal()).isEqualByComparingTo("420000");

        Order order = checkout.checkout(request()).stream().map(d -> orders.findById(d.getId()).orElseThrow())
                .filter(o -> o.getPaymentMethod() == PaymentMethod.COD).findFirst().orElseThrow();
        assertThat(order.getTotalAmount()).isEqualByComparingTo("100000");
        assertThat(order.getListAmount()).isEqualByComparingTo("200000");
        assertThat(order.getDiscountAmount()).isEqualByComparingTo("100000");
    }

    @Test
    void bulkOrderNeedsSevenDaysWhenDeliveryDateIsSelected() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        CheckoutRequest tooSoon = cakeRequest(today.plusDays(6), 20);
        assertThatThrownBy(() -> checkout.preview(tooSoon))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("ít nhất 7 ngày");

        User provider = cake.getProduct().getProvider();
        capacities.save(DailyCapacity.builder().provider(provider).capacityDate(today.plusDays(6))
                .maxQuantity(30).reservedQuantity(0).build());
        CheckoutPreviewResponse preview = checkout.preview(cakeRequest(today.plusDays(7), 20));
        assertThat(preview.groups()).hasSize(1);
        assertThat(preview.grandTotal()).isEqualByComparingTo("2000000");
    }

    @Test
    void onlyCakeCanBeOrderedAheadWithoutStockAndCancellationDoesNotCreateStock() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDate futureDate = today.plusDays(7);
        DailyCapacity futureCapacity = capacities.save(DailyCapacity.builder()
                .provider(cake.getProduct().getProvider()).capacityDate(futureDate.minusDays(1))
                .maxQuantity(10).reservedQuantity(0).build());
        cake.setStockQuantity(0);
        cake.setStatus(VariantStatus.OUT_OF_STOCK);
        variants.saveAndFlush(cake);

        assertThatThrownBy(() -> checkout.preview(cakeRequest(today.plusDays(5), 2)))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Chọn ngày nhận cách ít nhất 7 ngày");

        Order order = orders.findById(checkout.checkout(cakeRequest(futureDate, 2))
                .getFirst().getId()).orElseThrow();
        assertThat(orderItems.findByOrderBatchOrderId(order.getId())).hasSize(1);
        assertThat(orderItems.findByOrderBatchOrderId(order.getId()).getFirst().getStockReservedQuantity()).isZero();
        assertThat(variants.findById(cake.getId()).orElseThrow().getStockQuantity()).isZero();
        assertThat(capacities.findById(futureCapacity.getId()).orElseThrow().getReservedQuantity()).isEqualTo(2);

        lifecycle.cancel(order.getId());
        assertThat(variants.findById(cake.getId()).orElseThrow().getStockQuantity()).isZero();
        assertThat(capacities.findById(futureCapacity.getId()).orElseThrow().getReservedQuantity()).isZero();

        box.setStockQuantity(0);
        box.setStatus(VariantStatus.OUT_OF_STOCK);
        variants.saveAndFlush(box);
        CheckoutRequest boxRequest = new CheckoutRequest("Buyer", "0123456789", "Address", null, List.of(
                new CheckoutRequest.Group(futureDate, "Hồ Chí Minh", "Quận 1", PaymentMethod.VIETQR, false,
                        List.of(new CheckoutRequest.Item(box.getId(), null, 1, null, null)))));
        assertThatThrownBy(() -> checkout.preview(boxRequest))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("không đủ số lượng");
    }

    private CheckoutRequest cakeRequest(LocalDate date, int quantity) {
        return new CheckoutRequest("Buyer", "0123456789", "Address", null, List.of(
                new CheckoutRequest.Group(date, "Hồ Chí Minh", "Quận 1", PaymentMethod.VIETQR, false,
                        List.of(new CheckoutRequest.Item(cake.getId(), null, quantity, null, null)))));
    }

    @Test
    void customBoxStoresChosenFlavoursOnTheOrderLine() {
        User boxProvider = users.findById(products.findById(box.getProduct().getId()).orElseThrow()
                .getProvider().getId()).orElseThrow();
        ProductVariant lotus = variant(boxProvider, ProductType.LOOSE_CAKE, "60000", null);
        ProductVariant mung = variant(boxProvider, ProductType.LOOSE_CAKE, "50000", null);
        java.util.function.Function<List<UUID>, CheckoutRequest> boxWith = slots -> new CheckoutRequest("Buyer", "0123456789",
                "Address", null, List.of(new CheckoutRequest.Group(delivery, "Hồ Chí Minh", "Quận 1", PaymentMethod.VIETQR, false,
                        List.of(new CheckoutRequest.Item(box.getId(), null, 1, null, slots)))));

        var group = checkout.preview(boxWith.apply(List.of(lotus.getId(), mung.getId()))).groups().getFirst();
        var shell = group.lines().stream().filter(l -> l.variantId().equals(box.getId())).findFirst().orElseThrow();
        assertThat(shell.variantName()).isEqualTo("Variant · LOOSE_CAKE Variant ×2"); // 2 bánh test trùng tên -> gộp
        assertThat(shell.subtotal()).isEqualByComparingTo("200000"); // vỏ hộp tính riêng
        assertThat(group.lines()).hasSize(3); // vỏ + từng loại bánh
        assertThat(group.totalAmount()).isEqualByComparingTo("310000"); // 200k + 60k + 50k

        assertThatThrownBy(() -> checkout.preview(boxWith.apply(List.of(lotus.getId()))))
                .hasMessageContaining("đủ 2 vị");
        assertThatThrownBy(() -> checkout.preview(boxWith.apply(List.of(lotus.getId(), cake.getId()))))
                .hasMessageContaining("cùng xưởng");

        Order order = orders.findById(checkout.checkout(boxWith.apply(List.of(lotus.getId(), lotus.getId())))
                .getFirst().getId()).orElseThrow();
        assertThat(order.getTotalAmount()).isEqualByComparingTo("320000"); // 200k + 2 x 60k
        assertThat(variants.findById(lotus.getId()).orElseThrow().getStockQuantity()).isEqualTo(8); // kho bánh bị trừ
        assertThat(variants.findById(box.getId()).orElseThrow().getStockQuantity()).isEqualTo(9);

        // Vỏ hộp lẻ (không bánh) không bán; bánh lẻ cùng loại mua thêm được cộng dồn với bánh trong hộp
        assertThatThrownBy(() -> checkout.preview(boxWith.apply(null))).hasMessageContaining("chỉ bán kèm bánh");
        var mixed = checkout.preview(new CheckoutRequest("Buyer", "0123456789", "Address", null, List.of(
                new CheckoutRequest.Group(delivery, "Hồ Chí Minh", "Quận 1", PaymentMethod.VIETQR, false, List.of(
                        new CheckoutRequest.Item(box.getId(), null, 1, null, List.of(mung.getId(), mung.getId())),
                        new CheckoutRequest.Item(mung.getId(), null, 3, null, null))))));
        assertThat(mixed.groups().getFirst().lines()).filteredOn(l -> l.variantId().equals(mung.getId()))
                .singleElement().extracting("quantity").isEqualTo(5);
    }

    @Test
    void severalRecipientsCheckoutInOneTransaction() {
        java.util.function.BiFunction<String, Integer, CheckoutRequest.Group> to = (who, qty) -> new CheckoutRequest.Group(
                null, delivery, null, null, null, PaymentMethod.VIETQR, false, "MIN_DEPOSIT",
                List.of(new CheckoutRequest.Item(cake.getId(), null, qty, null, null)), null,
                who, "0901234567", who + " street");
        int stock = variants.findById(cake.getId()).orElseThrow().getStockQuantity();

        // Cùng xưởng, cùng món, hai người nhận -> hai đơn, hai địa chỉ
        var created = checkout.checkout(new CheckoutRequest(null, null, null, null, List.of(to.apply("An", 2), to.apply("Binh", 3))));
        assertThat(created).hasSize(2);
        assertThat(created).extracting("shippingAddress").containsExactlyInAnyOrder("An street", "Binh street");
        assertThat(variants.findById(cake.getId()).orElseThrow().getStockQuantity()).isEqualTo(stock - 5);

        // Nhóm sau thiếu hàng -> không đơn nào được tạo, kho giữ nguyên
        long before = orders.count();
        int left = stock - 5;
        assertThatThrownBy(() -> checkout.checkout(new CheckoutRequest(null, null, null, null,
                List.of(to.apply("Chi", 1), to.apply("Dung", left)))))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(orders.count()).isEqualTo(before);
        assertThat(variants.findById(cake.getId()).orElseThrow().getStockQuantity()).isEqualTo(left);
    }

    private CheckoutRequest request() {
        return new CheckoutRequest("Buyer", "0123456789", "Address", null, List.of(
                new CheckoutRequest.Group(delivery, "Hồ Chí Minh", "Quận 1", PaymentMethod.COD, false,
                        List.of(new CheckoutRequest.Item(cake.getId(), null, 2, null, null))),
                new CheckoutRequest.Group(delivery, "Hồ Chí Minh", "Quận 1", PaymentMethod.VIETQR, false,
                        List.of(new CheckoutRequest.Item(box.getId(), null, 1, "Chuc mung",
                                List.of(boxCake.getId(), boxCake.getId()))))));
    }

    private User user(UserRole role, boolean provider) {
        User user = users.save(User.builder().email(UUID.randomUUID() + "@example.com").password("hash")
                .fullName(role.name()).role(role).status(UserStatus.ACTIVE).storeName(provider ? "Bakery" : null)
                .isComplianceApproved(provider).isSeasonActive(true)
                .bankCode(provider ? "VCB" : null).bankAccountNumber(provider ? "123456789" : null)
                .bankAccountName(provider ? "BAKERY" : null).build());
        if (provider) {
            subscriptions.save(Subscription.builder().provider(user).planName("MVP")
                    .price(BigDecimal.ZERO).startDate(delivery.minusDays(6)).endDate(delivery.plusDays(30))
                    .status(SubscriptionStatus.ACTIVE).build());
        }
        return user;
    }

    private ProductVariant variant(User provider, ProductType type, String price, Integer slots) {
        Product product = products.save(Product.builder().provider(provider).name(type.name())
                .productType(type).status(ProductStatus.ACTIVE).build());
        return variants.save(ProductVariant.builder().product(product).variantName("Variant")
                .sku(UUID.randomUUID().toString()).price(new BigDecimal(price)).stockQuantity(10)
                .boxCapacity(slots).status(VariantStatus.IN_STOCK).build());
    }

    private DailyCapacity capacity(User provider) {
        return capacities.save(DailyCapacity.builder().provider(provider).capacityDate(delivery.minusDays(1))
                .maxQuantity(10).reservedQuantity(0).build());
    }
}
