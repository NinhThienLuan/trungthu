package fpt.sba.trungthu;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
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
import fpt.sba.trungthu.service.PayosGateway;
import fpt.sba.trungthu.service.impl.PayosPaymentService;
import fpt.sba.trungthu.service.impl.ProviderPayosAccountService;
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
    @Autowired private PayosPaymentService payosPayments;
    @Autowired private ObjectMapper json;
    @Autowired private VietQrController vietQr;
    @Autowired private UserRepository users;
    @Autowired private ProductRepository products;
    @Autowired private ProductVariantRepository variants;
    @Autowired private DailyCapacityRepository capacities;
    @Autowired private ProviderShippingRateRepository rates;
    @Autowired private SubscriptionRepository subscriptions;
    @Autowired private OrderRepository orders;
    @Autowired private PaymentTransactionRepository payments;
    @Autowired private PlatformTransactionManager transactionManager;
    @MockitoBean private SecurityContextService security;
    @MockitoBean private PayosGateway payosGateway;
    @MockitoBean private ProviderPayosAccountService payosAccounts;
    @MockitoSpyBean private OrderService orderService;

    private User customer;
    private ProductVariant cake;
    private ProductVariant box;
    private DailyCapacity cakeCapacity;
    private DailyCapacity boxCapacity;
    private LocalDate delivery;

    @BeforeEach
    void setUp() {
        delivery = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(5);
        customer = user(UserRole.CUSTOMER, false);
        User cakeProvider = user(UserRole.PROVIDER, true);
        User boxProvider = user(UserRole.PROVIDER, true);
        cake = variant(cakeProvider, ProductType.LOOSE_CAKE, "100000", null);
        box = variant(boxProvider, ProductType.BOX_SHELL, "200000", 2);
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
        assertThat(preview.grandTotal()).isEqualByComparingTo("440000");
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
        assertThat(qr.getDepositAmount()).isEqualByComparingTo("115000");
        when(security.getCurrentUserId()).thenReturn(customer.getId());
        var instruction = vietQr.getVietQr(qr.getId()).getBody().getData();
        assertThat(instruction.amount()).isEqualByComparingTo("115000");
        assertThat(instruction.imageUrl()).contains("img.vietqr.io/image/VCB-123456789-compact2.svg")
                .contains("amount=115000");
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
    void sellerExtendsHoldOnceConfirmsDepositAndCollectsBalanceOnDelivery() {
        var created = checkout.checkout(request());
        Order qr = created.stream().map(detail -> orders.findById(detail.getId()).orElseThrow())
                .filter(order -> order.getPaymentMethod() == PaymentMethod.VIETQR).findFirst().orElseThrow();
        when(security.getCurrentUser()).thenReturn(users.findById(qr.getProvider().getId()).orElseThrow());
        var hold = lifecycle.extendHold(qr.getId(), "Buyer is completing transfer");
        assertThat(hold.extensionCount()).isEqualTo(1);
        assertThatThrownBy(() -> lifecycle.extendHold(qr.getId(), "Again"))
                .isInstanceOf(ResponseStatusException.class);
        lifecycle.confirmDeposit(qr.getId(), new BigDecimal("115000"));
        assertThat(orders.findById(qr.getId()).orElseThrow().getOrderStatus()).isEqualTo(OrderStatus.DEPOSITED);
        assertThat(orders.findById(qr.getId()).orElseThrow().getHoldExpiresAt()).isNull();
        lifecycle.expire(qr.getId());
        lifecycle.changeStatus(qr.getId(), OrderStatus.BAKING_QUEUED, null);
        lifecycle.changeStatus(qr.getId(), OrderStatus.DELIVERING, null);
        lifecycle.changeStatus(qr.getId(), OrderStatus.COMPLETED, new BigDecimal("115000"));
        assertThat(payments.sumSuccessfulAmountByOrderId(qr.getId())).isEqualByComparingTo("230000");
        assertThat(orders.findById(qr.getId()).orElseThrow().getPaymentStatus())
                .isEqualTo(OrderPaymentStatus.PAID_FULL);
        assertThat(capacities.findById(boxCapacity.getId()).orElseThrow().getReservedQuantity()).isEqualTo(2);
    }

    @Test
    void payosCreatesDistinctQrPerSellerAndWebhookConfirmsOnlyMatchingPayment() {
        CheckoutRequest request = new CheckoutRequest("Buyer", "0123456789", "Address", null, List.of(
                new CheckoutRequest.Group(delivery, "HCM", "District 1", PaymentMethod.PAYOS, true,
                        List.of(new CheckoutRequest.Item(cake.getId(), 2, null))),
                new CheckoutRequest.Group(delivery, "HCM", "District 1", PaymentMethod.PAYOS, true,
                        List.of(new CheckoutRequest.Item(box.getId(), 1, "Chuc mung")))));
        when(security.getCurrentUserId()).thenReturn(customer.getId());
        when(payosAccounts.forProvider(any())).thenAnswer(invocation ->
                new PayosGateway.Channel(invocation.getArgument(0).toString(), "api", "checksum"));
        when(payosAccounts.requireReady(any())).thenAnswer(invocation ->
                new PayosGateway.Channel(invocation.getArgument(0).toString(), "api", "checksum"));
        when(payosGateway.create(any(), anyLong(), anyLong(), anyString(), any(Instant.class))).thenAnswer(invocation -> {
            long code = invocation.getArgument(1);
            long amount = invocation.getArgument(2);
            return new PayosGateway.Link(code, amount, "link-" + code,
                    "https://pay.payos.vn/web/link-" + code, "qr-" + code);
        });
        var created = checkout.checkout(request);
        assertThat(created).hasSize(2);
        var first = payosPayments.getOrCreate(created.get(0).getId());
        var second = payosPayments.getOrCreate(created.get(1).getId());
        assertThat(first.payosOrderCode()).isNotEqualTo(second.payosOrderCode());
        assertThat(first.qrCode()).isNotEqualTo(second.qrCode());
        assertThat(first.expiresAt()).isAfter(Instant.now().plusSeconds(4 * 3600 + 59 * 60));
        assertThat(first.expiresAt()).isBeforeOrEqualTo(
                orders.findById(first.orderId()).orElseThrow().getOrderedAt().plusSeconds(5 * 3600));
        assertThat(payosPayments.getOrCreate(first.orderId()).qrCode()).isEqualTo(first.qrCode());
        var channels = org.mockito.ArgumentCaptor.forClass(PayosGateway.Channel.class);
        verify(payosGateway, times(2)).create(channels.capture(), anyLong(), anyLong(), anyString(), any(Instant.class));
        assertThat(channels.getAllValues()).extracting(PayosGateway.Channel::clientId)
                .containsExactlyInAnyOrder(
                        orders.findById(first.orderId()).orElseThrow().getProvider().getId().toString(),
                        orders.findById(second.orderId()).orElseThrow().getProvider().getId().toString());

        when(payosGateway.verifyWebhook(any(), any(), anyString())).thenReturn(true);
        ObjectNode payload = json.createObjectNode();
        payload.put("code", "00").put("success", true).put("signature", "valid");
        payload.putObject("data").put("code", "00").put("orderCode", first.payosOrderCode())
                .put("amount", first.amount().longValueExact()).put("currency", "VND")
                .put("paymentLinkId", first.paymentLinkId()).put("reference", "BANK-123");
        payosPayments.receiveWebhook(payload);
        payosPayments.receiveWebhook(payload);
        assertThat(orders.findById(first.orderId()).orElseThrow().getOrderStatus())
                .isEqualTo(OrderStatus.DEPOSITED);
        assertThat(orders.findById(second.orderId()).orElseThrow().getOrderStatus())
                .isEqualTo(OrderStatus.PENDING_DEPOSIT);
        assertThat(payments.sumSuccessfulAmountByOrderId(first.orderId())).isEqualByComparingTo(first.amount());
    }

    private CheckoutRequest request() {
        return new CheckoutRequest("Buyer", "0123456789", "Address", null, List.of(
                new CheckoutRequest.Group(delivery, "HCM", "District 1", PaymentMethod.COD, false,
                        List.of(new CheckoutRequest.Item(cake.getId(), 2, null))),
                new CheckoutRequest.Group(delivery, "HCM", "District 1", PaymentMethod.VIETQR, false,
                        List.of(new CheckoutRequest.Item(box.getId(), 1, "Chuc mung")))));
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
            rates.save(ProviderShippingRate.builder().provider(user).province("hcm")
                    .district("district 1").fee(new BigDecimal("10000")).build());
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
