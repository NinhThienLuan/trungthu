package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.controller.ComplaintController;
import fpt.sba.trungthu.controller.ComplaintController.CreateComplaintRequest;
import fpt.sba.trungthu.controller.ComplaintController.UpdateComplaintRequest;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.*;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
class ComplaintFlowTests {
    @Autowired private ComplaintController complaints;
    @Autowired private UserRepository users;
    @Autowired private OrderRepository orders;
    @MockitoBean private SecurityContextService security;

    @Test
    // Vai trò cho @PreAuthorize; người gọi thật do SecurityContextService (mock) quyết định
    @WithMockUser(roles = {"CUSTOMER", "PROVIDER", "PLATFORM_ADMIN"})
    void customerComplainsAboutReceivedOrderAndOwningShopResolves() {
        User buyer = user(UserRole.CUSTOMER), shop = user(UserRole.PROVIDER), otherShop = user(UserRole.PROVIDER);
        Order completed = order(buyer, shop, OrderStatus.COMPLETED);
        Order unpaid = order(buyer, shop, OrderStatus.PENDING_DEPOSIT);

        when(security.getCurrentUser()).thenReturn(buyer);
        assertThatThrownBy(() -> complaints.create(new CreateComplaintRequest(unpaid.getId(), ComplaintType.DAMAGED, "Vỡ", null)))
                .hasMessageContaining("đang giao hoặc đã hoàn tất");
        var created = complaints.create(new CreateComplaintRequest(completed.getId(), ComplaintType.DAMAGED,
                "Bánh bị vỡ", "Hộp móp, 2 bánh vỡ")).getBody().getData();
        assertThat(created.status()).isEqualTo(ComplaintStatus.OPEN);
        assertThat(created.storeName()).isEqualTo(shop.getStoreName());
        assertThatThrownBy(() -> complaints.create(new CreateComplaintRequest(completed.getId(), ComplaintType.OTHER, "Lần 2", null)))
                .hasMessageContaining("đang được xử lý");

        // Xưởng khác không thấy / không xử lý được
        when(security.getCurrentUser()).thenReturn(otherShop);
        assertThat(complaints.forProvider().getBody().getData()).isEmpty();
        assertThatThrownBy(() -> complaints.providerUpdate(created.id(), new UpdateComplaintRequest(ComplaintStatus.IN_PROGRESS, null)))
                .isInstanceOf(ResponseStatusException.class);

        when(security.getCurrentUser()).thenReturn(shop);
        complaints.providerUpdate(created.id(), new UpdateComplaintRequest(ComplaintStatus.IN_PROGRESS, null));
        assertThatThrownBy(() -> complaints.providerUpdate(created.id(), new UpdateComplaintRequest(ComplaintStatus.RESOLVED, " ")))
                .hasMessageContaining("cách xử lý");
        var resolved = complaints.providerUpdate(created.id(),
                new UpdateComplaintRequest(ComplaintStatus.RESOLVED, "Đổi 2 bánh mới")).getBody().getData();
        assertThat(resolved.status()).isEqualTo(ComplaintStatus.RESOLVED);
        assertThat(resolved.resolvedAt()).isNotNull();

        when(security.getCurrentUser()).thenReturn(buyer);
        assertThat(complaints.mine().getBody().getData()).singleElement()
                .extracting("resolution").isEqualTo("Đổi 2 bánh mới");
    }

    private Order order(User buyer, User shop, OrderStatus status) {
        return orders.save(Order.builder().customer(buyer).provider(shop).checkoutId(UUID.randomUUID())
                .orderCode("ORD-" + UUID.randomUUID()).subtotalAmount(new BigDecimal("100000"))
                .totalAmount(new BigDecimal("100000")).paymentMethod(PaymentMethod.VIETQR).orderStatus(status)
                .receiverName("Buyer").receiverPhone("0901234567").shippingAddress("1 Lê Lợi").orderedAt(Instant.now())
                .holdExpiresAt(status == OrderStatus.PENDING_DEPOSIT ? Instant.now().plusSeconds(3600) : null).build());
    }

    private User user(UserRole role) {
        return users.save(User.builder().email(UUID.randomUUID() + "@example.com").password("hash")
                .fullName(role.name()).storeName(role == UserRole.PROVIDER ? "Shop " + UUID.randomUUID() : null)
                .role(role).status(UserStatus.ACTIVE).isComplianceApproved(true).isSeasonActive(true).build());
    }
}
