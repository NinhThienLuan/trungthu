package fpt.sba.trungthu;

import fpt.sba.trungthu.dto.request.ActivateSubscriptionRequest;
import fpt.sba.trungthu.dto.request.CreateSubscriptionRequest;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.SubscriptionPlan;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.SubscriptionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
class SubscriptionFlowTests {
    @Autowired private SubscriptionService subscriptions;
    @Autowired private UserRepository users;

    @Test
    void sellerPicksPlanAdminActivatesAndOnlyOnePlanRunsAtATime() {
        User seller = provider();
        User other = provider();

        var basic = subscriptions.createSubscription(seller.getEmail(), request(SubscriptionPlan.BASIC, "FT123"));
        assertThat(basic.getStatus()).isEqualTo(SubscriptionStatus.PENDING_PAYMENT);
        assertThat(basic.getPrice()).isEqualByComparingTo("990000");
        assertThat(basic.getMaxProductsAllowed()).isEqualTo(20);
        assertThat(basic.getPaymentNote()).isEqualTo("FT123");
        assertThat(subscriptions.hasActiveSubscription(seller.getEmail())).isFalse();

        // Một yêu cầu chờ duyệt mỗi lúc
        assertThatThrownBy(() -> subscriptions.createSubscription(seller.getEmail(), request(SubscriptionPlan.PREMIUM, null)))
                .isInstanceOf(IllegalArgumentException.class);
        // Seller khác không huỷ được gói không phải của mình
        assertThatThrownBy(() -> subscriptions.cancelSubscription(basic.getId(), other.getEmail()))
                .isInstanceOf(IllegalArgumentException.class);

        LocalDate end = LocalDate.now().plusMonths(2);
        subscriptions.activateSubscription(basic.getId(), ActivateSubscriptionRequest.builder().endDate(end).build());
        assertThat(subscriptions.hasActiveSubscription(seller.getEmail())).isTrue();

        // Nâng gói: kích hoạt gói mới thì gói cũ hết hạn, chỉ còn một gói ACTIVE
        var premium = subscriptions.createSubscription(seller.getEmail(), request(SubscriptionPlan.PREMIUM, null));
        subscriptions.activateSubscription(premium.getId(), ActivateSubscriptionRequest.builder().endDate(end).build());
        assertThat(subscriptions.getActiveSubscription(seller.getEmail()).getMaxProductsAllowed()).isEqualTo(200);
        assertThat(subscriptions.mySubscriptions(seller.getEmail())).extracting("status")
                .containsExactlyInAnyOrder(SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED);
    }

    private static CreateSubscriptionRequest request(SubscriptionPlan plan, String note) {
        CreateSubscriptionRequest request = new CreateSubscriptionRequest();
        request.setPlan(plan);
        request.setPaymentProof(note);
        return request;
    }

    private User provider() {
        return users.save(User.builder().email(UUID.randomUUID() + "@example.com").password("hash")
                .fullName("Seller").storeName("Shop").role(UserRole.PROVIDER).status(UserStatus.ACTIVE)
                .isComplianceApproved(false).isSeasonActive(true).build());
    }
}
