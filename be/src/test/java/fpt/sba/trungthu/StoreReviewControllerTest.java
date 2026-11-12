package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.controller.StoreReviewController;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class StoreReviewControllerTest {
    @TempDir Path temp;

    @Test
    void completedOrderCanBeReviewedOnceAndIsListed() {
        UUID customerId = UUID.randomUUID();
        UUID providerId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        User customer = User.builder().id(customerId).fullName("Khách thử").build();
        User provider = User.builder().id(providerId).build();
        Order order = Order.builder().id(orderId).customer(customer).provider(provider)
                .orderStatus(OrderStatus.COMPLETED).build();
        SecurityContextService security = mock(SecurityContextService.class);
        OrderRepository orders = mock(OrderRepository.class);
        when(security.getCurrentUserId()).thenReturn(customerId);
        when(orders.findById(orderId)).thenReturn(Optional.of(order));
        StoreReviewController controller = new StoreReviewController(security, orders,
                mock(UserRepository.class), new ObjectMapper());
        ReflectionTestUtils.setField(controller, "storagePath", temp.toString());

        var request = new StoreReviewController.ReviewRequest(orderId, 5, "Bánh ngon");
        controller.create(providerId, request);
        var reviews = controller.list(providerId).getBody().getData();
        assertThat(reviews).hasSize(1);
        assertThat(reviews.getFirst().rating()).isEqualTo(5);
        assertThatThrownBy(() -> controller.create(providerId, request))
                .isInstanceOf(ResponseStatusException.class);
    }
}
