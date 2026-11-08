package fpt.sba.trungthu;

import fpt.sba.trungthu.dto.request.ActivateSubscriptionRequest;
import fpt.sba.trungthu.dto.request.CreateSubscriptionRequest;
import fpt.sba.trungthu.dto.response.SubscriptionResponse;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.SubscriptionPlan;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.EmailService;
import fpt.sba.trungthu.service.SubscriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

/**
 * CRITICAL FIX #5: Integration tests cho Subscription flow
 * Verify: create → activate → auto-expire old → email notifications
 */
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
    "app.demo-seed=false" // Disable demo seeders để test isolation
})
@Transactional
class SubscriptionFlowIntegrationTests {

    @Autowired private SubscriptionService subscriptionService;
    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private UserRepository userRepository;
    @MockitoBean private EmailService emailService; // Mock để không gửi email thật

    private User provider;

    @BeforeEach
    void setUp() {
        provider = userRepository.save(User.builder()
                .email("provider-" + UUID.randomUUID() + "@test.com")
                .password("hash")
                .fullName("Test Provider")
                .storeName("Test Shop")
                .role(UserRole.PROVIDER)
                .status(UserStatus.ACTIVE)
                .isComplianceApproved(true)
                .isSeasonActive(true)
                .build());
    }

    @Test
    void providerCreatesSubscription_PendingStatus_EmailSent() {
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setPlan(SubscriptionPlan.BASIC);
        request.setPaymentProof("FT123456");

        SubscriptionResponse subscription = subscriptionService.createSubscription(provider.getEmail(), request);

        // Verify: Subscription created with PENDING_PAYMENT status
        assertThat(subscription.getStatus()).isEqualTo(SubscriptionStatus.PENDING_PAYMENT);
        assertThat(subscription.getPlanName()).isEqualTo("Cơ bản");
        assertThat(subscription.getPrice()).isEqualByComparingTo("990000");
        assertThat(subscription.getMaxProductsAllowed()).isEqualTo(20);
        assertThat(subscription.getPaymentNote()).isEqualTo("FT123456");

        // Verify: Email thông báo admin đã gửi
        verify(emailService).sendNewSubscriptionRequestToAdmin(anyString(), eq(provider.getEmail()), eq("Cơ bản"));

        // Verify: Provider chưa có active subscription
        assertThat(subscriptionService.hasActiveSubscription(provider.getEmail())).isFalse();
    }

    @Test
    void providerCannotCreateSecondPendingSubscription() {
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setPlan(SubscriptionPlan.BASIC);

        // Tạo subscription đầu tiên
        subscriptionService.createSubscription(provider.getEmail(), request);

        // Verify: Không thể tạo subscription thứ 2 khi còn PENDING
        assertThatThrownBy(() -> subscriptionService.createSubscription(provider.getEmail(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("đã có một yêu cầu gói đang chờ admin xác nhận");
    }

    @Test
    void adminActivatesSubscription_EmailSent() {
        // Tạo subscription PENDING
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setPlan(SubscriptionPlan.STANDARD);
        SubscriptionResponse pending = subscriptionService.createSubscription(provider.getEmail(), request);

        // Admin activate
        LocalDate endDate = LocalDate.now().plusMonths(3);
        ActivateSubscriptionRequest activateRequest = ActivateSubscriptionRequest.builder()
                .endDate(endDate)
                .build();

        SubscriptionResponse activated = subscriptionService.activateSubscription(pending.getId(), activateRequest);

        // Verify: Status changed to ACTIVE
        assertThat(activated.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(activated.getStartDate()).isNotNull();
        assertThat(activated.getEndDate()).isEqualTo(endDate.toString());

        // Verify: Provider now has active subscription
        assertThat(subscriptionService.hasActiveSubscription(provider.getEmail())).isTrue();

        // Verify: Email thông báo provider đã gửi
        verify(emailService).sendSubscriptionActivatedEmail(
                eq(provider.getEmail()),
                eq("Tiêu chuẩn"),
                anyString()
        );
    }

    @Test
    void activatingNewSubscription_AutoExpiresOldSubscription() {
        // Tạo và activate gói BASIC
        CreateSubscriptionRequest basicRequest = new CreateSubscriptionRequest();
        basicRequest.setPlan(SubscriptionPlan.BASIC);
        SubscriptionResponse basic = subscriptionService.createSubscription(provider.getEmail(), basicRequest);
        
        LocalDate endDate1 = LocalDate.now().plusMonths(3);
        subscriptionService.activateSubscription(basic.getId(), ActivateSubscriptionRequest.builder().endDate(endDate1).build());

        // Verify: Provider has BASIC active
        SubscriptionResponse activeBasic = subscriptionService.getActiveSubscription(provider.getEmail());
        assertThat(activeBasic.getPlanName()).isEqualTo("Cơ bản");
        assertThat(activeBasic.getMaxProductsAllowed()).isEqualTo(20);

        // Tạo và activate gói PREMIUM (nâng cấp)
        CreateSubscriptionRequest premiumRequest = new CreateSubscriptionRequest();
        premiumRequest.setPlan(SubscriptionPlan.PREMIUM);
        SubscriptionResponse premium = subscriptionService.createSubscription(provider.getEmail(), premiumRequest);
        
        LocalDate endDate2 = LocalDate.now().plusMonths(6);
        subscriptionService.activateSubscription(premium.getId(), ActivateSubscriptionRequest.builder().endDate(endDate2).build());

        // Verify: Provider now has PREMIUM active
        SubscriptionResponse activePremium = subscriptionService.getActiveSubscription(provider.getEmail());
        assertThat(activePremium.getPlanName()).isEqualTo("Cao cấp");
        assertThat(activePremium.getMaxProductsAllowed()).isEqualTo(200);

        // Verify: Old BASIC subscription is EXPIRED
        List<SubscriptionResponse> allSubscriptions = subscriptionService.mySubscriptions(provider.getEmail());
        assertThat(allSubscriptions).hasSize(2);
        assertThat(allSubscriptions).extracting("status")
                .containsExactlyInAnyOrder(SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED);
    }

    @Test
    void adminExpiresSubscription() {
        // Tạo và activate subscription
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setPlan(SubscriptionPlan.BASIC);
        SubscriptionResponse subscription = subscriptionService.createSubscription(provider.getEmail(), request);
        subscriptionService.activateSubscription(subscription.getId(), ActivateSubscriptionRequest.builder().endDate(LocalDate.now().plusMonths(3)).build());

        // Admin expire
        SubscriptionResponse expired = subscriptionService.expireSubscription(subscription.getId());

        // Verify: Status changed to EXPIRED
        assertThat(expired.getStatus()).isEqualTo(SubscriptionStatus.EXPIRED);

        // Verify: Provider no longer has active subscription
        assertThat(subscriptionService.hasActiveSubscription(provider.getEmail())).isFalse();
    }

    @Test
    void adminCanCancelPendingSubscription() {
        // Tạo subscription PENDING
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setPlan(SubscriptionPlan.BASIC);
        SubscriptionResponse pending = subscriptionService.createSubscription(provider.getEmail(), request);

        // Admin cancel PENDING subscription → should transition to EXPIRED (not SUSPENDED)
        // Per SubscriptionStatus enum: PENDING_PAYMENT can only go to ACTIVE or EXPIRED
        SubscriptionResponse cancelled = subscriptionService.cancelSubscription(pending.getId(), null);

        // Verify: Status changed to EXPIRED (cancel before activation = reject request)
        assertThat(cancelled.getStatus()).isEqualTo(SubscriptionStatus.EXPIRED);
    }

    @Test
    void providerCanOnlyCancelOwnSubscription() {
        // Tạo subscription
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setPlan(SubscriptionPlan.BASIC);
        SubscriptionResponse subscription = subscriptionService.createSubscription(provider.getEmail(), request);

        // Tạo provider khác
        User otherProvider = userRepository.save(User.builder()
                .email("other-" + UUID.randomUUID() + "@test.com")
                .password("hash")
                .fullName("Other Provider")
                .role(UserRole.PROVIDER)
                .status(UserStatus.ACTIVE)
                .build());

        // Verify: Provider khác không thể cancel subscription của provider này
        assertThatThrownBy(() -> subscriptionService.cancelSubscription(subscription.getId(), otherProvider.getEmail()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Subscription not found");
    }

    @Test
    void getAllSubscriptionsByStatus_ReturnsCorrectSubscriptions() {
        // Tạo và activate subscription đầu tiên
        CreateSubscriptionRequest request1 = new CreateSubscriptionRequest();
        request1.setPlan(SubscriptionPlan.BASIC);
        SubscriptionResponse pending1 = subscriptionService.createSubscription(provider.getEmail(), request1);
        subscriptionService.activateSubscription(pending1.getId(), ActivateSubscriptionRequest.builder().endDate(LocalDate.now().plusMonths(3)).build());

        // Tạo subscription thứ 2 (sau khi activate request1, có thể tạo request mới)
        CreateSubscriptionRequest request2 = new CreateSubscriptionRequest();
        request2.setPlan(SubscriptionPlan.STANDARD);
        subscriptionService.createSubscription(provider.getEmail(), request2);

        // Get pending subscriptions (chỉ có request2 PENDING)
        List<SubscriptionResponse> pendingList = subscriptionService.getAllSubscriptionsByStatus(SubscriptionStatus.PENDING_PAYMENT);
        assertThat(pendingList).hasSize(1);
        assertThat(pendingList.get(0).getPlanName()).isEqualTo("Tiêu chuẩn");

        // Get active subscriptions (chỉ có request1 ACTIVE)
        List<SubscriptionResponse> activeList = subscriptionService.getAllSubscriptionsByStatus(SubscriptionStatus.ACTIVE);
        assertThat(activeList).hasSize(1);
        assertThat(activeList.get(0).getPlanName()).isEqualTo("Cơ bản");
    }

    @Test
    void mySubscriptions_ReturnsAllSubscriptionsOrderedByCreatedAt() {
        // Tạo nhiều subscriptions
        CreateSubscriptionRequest request1 = new CreateSubscriptionRequest();
        request1.setPlan(SubscriptionPlan.BASIC);
        subscriptionService.createSubscription(provider.getEmail(), request1);

        CreateSubscriptionRequest request2 = new CreateSubscriptionRequest();
        request2.setPlan(SubscriptionPlan.STANDARD);
        
        // Activate rồi tạo gói mới
        List<SubscriptionResponse> subs1 = subscriptionService.mySubscriptions(provider.getEmail());
        subscriptionService.activateSubscription(subs1.get(0).getId(), ActivateSubscriptionRequest.builder().endDate(LocalDate.now().plusMonths(3)).build());

        subscriptionService.createSubscription(provider.getEmail(), request2);

        // Get all subscriptions
        List<SubscriptionResponse> allSubs = subscriptionService.mySubscriptions(provider.getEmail());
        
        // Verify: Có 2 subscriptions, mới nhất trước
        assertThat(allSubs).hasSize(2);
        assertThat(allSubs.get(0).getPlanName()).isEqualTo("Tiêu chuẩn"); // Mới nhất
        assertThat(allSubs.get(1).getPlanName()).isEqualTo("Cơ bản");
    }
}
