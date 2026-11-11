package fpt.sba.trungthu;

import fpt.sba.trungthu.dto.request.ActivateSubscriptionRequest;
import fpt.sba.trungthu.dto.request.CreateSubscriptionRequest;
import fpt.sba.trungthu.dto.response.SubscriptionResponse;
import fpt.sba.trungthu.entity.Subscription;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.SubscriptionPlan;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.TransactionStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.PaymentTransactionRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.SubscriptionService;
import fpt.sba.trungthu.service.impl.PayosSubscriptionGateway;
import fpt.sba.trungthu.service.EmailService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;
import vn.payos.exception.ConnectionException;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;
import vn.payos.model.v2.paymentRequests.Transaction;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
        "app.subscription-payment.payos.client-id=test",
        "app.subscription-payment.payos.api-key=test",
        "app.subscription-payment.payos.checksum-key=test-key",
        "app.subscription-payment.return-url=https://example.com/seller/subscription"
})
class SubscriptionFlowTests {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final String LINK_ID = "124c33293c934a85be5b7f8761a27a07";

    @Autowired private SubscriptionService subscriptions;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private PaymentTransactionRepository payments;
    @Autowired private UserRepository users;
    @Autowired private MockMvc mvc;
    @MockitoSpyBean private PayosSubscriptionGateway gateway;
    @MockitoBean private EmailService emailService;

    @Test
    void checkoutAndSignedWebhookActivateExactlyOnceAndReplaceOldPlan() throws Exception {
        User seller = provider();
        User other = provider();
        var basic = legacyBasic(seller);
        subscriptions.activateSubscription(basic.getId(), ActivateSubscriptionRequest.builder()
                .endDate(LocalDate.now(VIETNAM).plusMonths(1)).build());

        var premium = reserve(seller, SubscriptionPlan.PREMIUM);
        long code = code(premium);
        assertThat(reserve(seller, SubscriptionPlan.PREMIUM).getId()).isEqualTo(premium.getId());
        assertThat(premium.getPaymentStatus()).isEqualTo(TransactionStatus.PENDING);
        assertThat(payments.findBySubscriptionIdOrderByCreatedAtAsc(premium.getId())).hasSize(1);
        assertThatThrownBy(() -> reserve(seller, SubscriptionPlan.STANDARD)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> subscriptions.openCheckout(premium.getId(), other.getEmail()))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> subscriptions.refreshPayment(premium.getId(), other.getEmail()))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> subscriptions.cancelSubscription(premium.getId(), other.getEmail()))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> subscriptions.activateSubscription(premium.getId(), ActivateSubscriptionRequest.builder().build()))
                .isInstanceOf(IllegalStateException.class);
        assertThat(subscriptions.getActiveSubscription(seller.getEmail()).getId()).isEqualTo(basic.getId());

        doReturn(CreatePaymentLinkResponse.builder().orderCode(code).amount(3_990_000L).currency("VND")
                .bin("970422").accountNumber("123").accountName("SAN").description("PHI GOI").paymentLinkId(LINK_ID)
                .status(PaymentLinkStatus.PENDING).checkoutUrl("https://pay.payos.vn/web/" + LINK_ID)
                .qrCode("vietqr-payload").build()).when(gateway).create(eq(code), eq(3_990_000L), any());
        assertThat(subscriptions.openCheckout(premium.getId(), seller.getEmail()).getQrPayload()).isEqualTo("vietqr-payload");
        subscriptions.openCheckout(premium.getId(), seller.getEmail());
        verify(gateway, times(1)).create(eq(code), eq(3_990_000L), any());

        doReturn(link(code, 3_990_000L, 3_990_000L, PaymentLinkStatus.PAID)).when(gateway).find(code);
        String timestamp = LocalDateTime.now(VIETNAM).withNano(0).toString().replace('T', ' ');
        String validSignature = sign("accountNumber=123&amount=3990000&code=00&currency=VND"
                + "&desc=success&description=PHI GOI&orderCode=" + code + "&paymentLinkId=" + LINK_ID
                + "&reference=FT123&transactionDateTime=" + timestamp);
        sendWebhook(code, timestamp, "0".repeat(64), 400);
        assertThat(subscriptions.getActiveSubscription(seller.getEmail()).getId()).isEqualTo(basic.getId());

        sendWebhook(code, timestamp, validSignature, 200);
        sendWebhook(code, timestamp, validSignature, 200);
        verify(gateway, times(1)).find(code);
        assertThat(subscriptions.getActiveSubscription(seller.getEmail()).getId()).isEqualTo(premium.getId());
        // Webhook lặp lại vẫn chỉ báo seller một lần
        verify(emailService, times(1)).sendSubscriptionActivatedEmail(eq(seller.getEmail()), eq(premium.getPlanName()), any());
        assertThat(subscriptions.mySubscriptions(seller.getEmail())).extracting(SubscriptionResponse::getStatus)
                .containsExactlyInAnyOrder(SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED);
        var recorded = payments.findBySubscriptionIdOrderByCreatedAtAsc(premium.getId());
        assertThat(recorded).singleElement().satisfies(payment -> {
            assertThat(payment.getPaymentStatus()).isEqualTo(TransactionStatus.SUCCESS);
            assertThat(payment.getPaidAt()).isNotNull();
        });
        assertThatThrownBy(() -> subscriptions.cancelSubscription(premium.getId(), seller.getEmail()))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> reserve(seller, SubscriptionPlan.PREMIUM)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> reserve(seller, SubscriptionPlan.BASIC)).isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void concurrentRequestsReserveOnePayment() throws Exception {
        User seller = provider();
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> {
                start.await();
                return reserve(seller, SubscriptionPlan.BASIC);
            });
            var second = executor.submit(() -> {
                start.await();
                return reserve(seller, SubscriptionPlan.BASIC);
            });
            start.countDown();
            var reserved = first.get(5, TimeUnit.SECONDS);
            assertThat(second.get(5, TimeUnit.SECONDS).getId()).isEqualTo(reserved.getId());
            assertThat(payments.findBySubscriptionIdOrderByCreatedAtAsc(reserved.getId())).hasSize(1);
        }
    }

    @Test
    void checkoutRecoversExistingPayosLinkAfterTimeout() {
        User seller = provider();
        var basic = reserve(seller, SubscriptionPlan.BASIC);
        long code = code(basic);
        doThrow(new ConnectionException("create timed out")).when(gateway).create(eq(code), eq(990_000L), any());
        doReturn(link(code, 990_000L, 0, PaymentLinkStatus.PENDING)).when(gateway).find(code);

        assertThat(subscriptions.openCheckout(basic.getId(), seller.getEmail()).getCheckoutUrl())
                .isEqualTo("https://pay.payos.vn/web/" + LINK_ID);
        assertThat(reserve(seller, SubscriptionPlan.BASIC).getId()).isEqualTo(basic.getId());
        assertThat(payments.findBySubscriptionIdOrderByCreatedAtAsc(basic.getId())).hasSize(1);
    }

    @Test
    void mismatchedAmountRequiresReviewAndCannotBeCancelledAsUnpaid() {
        User seller = provider();
        var basic = reserve(seller, SubscriptionPlan.BASIC);
        long code = code(basic);
        doReturn(link(code, 990_000L, 900_000L, PaymentLinkStatus.UNDERPAID)).when(gateway).find(code);

        var review = subscriptions.refreshPayment(basic.getId(), seller.getEmail());
        assertThat(review.getPaymentNote()).contains("cần đối soát");
        assertThat(review.getStatus()).isEqualTo(SubscriptionStatus.PENDING_PAYMENT);
        assertThat(review.getQrPayload()).isNull();
        assertThat(subscriptions.cancelSubscription(basic.getId(), seller.getEmail()).getPaymentStatus())
                .isEqualTo(TransactionStatus.PENDING);
        assertThat(subscriptions.hasActiveSubscription(seller.getEmail())).isFalse();
    }

    @Test
    void expiredAndCancelledLinksCanBeReplacedWithoutActivation() {
        User seller = provider();
        var expired = reserve(seller, SubscriptionPlan.BASIC);
        long expiredCode = code(expired);
        doReturn(link(expiredCode, 990_000L, 0, PaymentLinkStatus.EXPIRED)).when(gateway).find(expiredCode);
        var refreshed = subscriptions.refreshPayment(expired.getId(), seller.getEmail());
        assertThat(refreshed.getStatus()).isEqualTo(SubscriptionStatus.EXPIRED);
        assertThat(refreshed.getPaymentStatus()).isEqualTo(TransactionStatus.CANCELLED);

        var next = reserve(seller, SubscriptionPlan.BASIC);
        assertThat(next.getId()).isNotEqualTo(expired.getId());
        long nextCode = code(next);
        doReturn(link(nextCode, 990_000L, 0, PaymentLinkStatus.PENDING)).when(gateway).find(nextCode);
        doReturn(link(nextCode, 990_000L, 0, PaymentLinkStatus.CANCELLED)).when(gateway).cancel(nextCode);
        assertThat(subscriptions.cancelSubscription(next.getId(), seller.getEmail()).getStatus())
                .isEqualTo(SubscriptionStatus.CANCELLED);
        assertThat(subscriptions.hasActiveSubscription(seller.getEmail())).isFalse();
    }

    @Test
    void cancellationThatRacesWithPaymentReconcilesAsPaid() {
        User seller = provider();
        var basic = reserve(seller, SubscriptionPlan.BASIC);
        long code = code(basic);
        doReturn(link(code, 990_000L, 0, PaymentLinkStatus.PENDING), link(code, 990_000L, 990_000L, PaymentLinkStatus.PAID))
                .when(gateway).find(code);
        doThrow(new ConnectionException("cancel timed out")).when(gateway).cancel(code);

        assertThat(subscriptions.cancelSubscription(basic.getId(), seller.getEmail()).getStatus())
                .isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(subscriptions.hasActiveSubscription(seller.getEmail())).isTrue();
    }

    @Test
    void legacyPendingSubscriptionCanStillBeCancelled() {
        User seller = provider();
        var legacy = legacyBasic(seller);
        assertThat(subscriptions.cancelSubscription(legacy.getId(), seller.getEmail()).getStatus())
                .isEqualTo(SubscriptionStatus.CANCELLED);
        assertThat(reserve(seller, SubscriptionPlan.BASIC).getPaymentStatus()).isEqualTo(TransactionStatus.PENDING);
    }

    private void sendWebhook(long code, String timestamp, String signature, int expectedStatus) throws Exception {
        mvc.perform(post("/api/webhooks/payos/subscriptions").contentType("application/json").content("""
                {"code":"00","desc":"success","success":true,"data":{"orderCode":%d,"amount":3990000,"code":"00",
                "currency":"VND","paymentLinkId":"%s","transactionDateTime":"%s",
                "accountNumber":"123","desc":"success","description":"PHI GOI","reference":"FT123"},"signature":"%s"}
                """.formatted(code, LINK_ID, timestamp, signature))).andExpect(status().is(expectedStatus));
    }

    private static String sign(String canonical) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("test-key".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(canonical.getBytes(StandardCharsets.UTF_8)));
    }

    private static PaymentLink link(long code, long amount, long paid, PaymentLinkStatus status) {
        return PaymentLink.builder().id(LINK_ID).orderCode(code).amount(amount).amountPaid(paid)
                .amountRemaining(amount - paid).status(status).createdAt(LocalDateTime.now(VIETNAM).toString())
                .transactions(paid == 0 ? List.of() : List.of(Transaction.builder().amount(paid).reference("FT123")
                        .accountNumber("123").description("PHI GOI")
                        .transactionDateTime(LocalDateTime.now(VIETNAM).toString()).build())).build();
    }

    private static long code(SubscriptionResponse subscription) {
        return Long.parseLong(subscription.getPaymentCode().substring("PAYOS-".length()));
    }

    private SubscriptionResponse reserve(User seller, SubscriptionPlan plan) {
        var request = new CreateSubscriptionRequest();
        request.setPlan(plan);
        return subscriptions.createSubscription(seller.getEmail(), request);
    }

    private Subscription legacyBasic(User seller) {
        LocalDate today = LocalDate.now(VIETNAM);
        return subscriptionRepository.save(Subscription.builder().provider(seller).planName(SubscriptionPlan.BASIC.label())
                .price(SubscriptionPlan.BASIC.price()).maxProductsAllowed(20).paymentNote("FT123")
                .status(SubscriptionStatus.PENDING_PAYMENT).startDate(today).endDate(today.plusMonths(1)).build());
    }

    private User provider() {
        return users.save(User.builder().email(UUID.randomUUID() + "@example.com").password("hash")
                .fullName("Seller").storeName("Shop").role(UserRole.PROVIDER).status(UserStatus.ACTIVE)
                .isComplianceApproved(false).isSeasonActive(true).build());
    }
}
