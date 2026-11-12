package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.controller.StoreReviewController;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.StoreReview;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.StoreReviewRepository;
import fpt.sba.trungthu.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StoreReviewControllerTest {
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
        UserRepository users = mock(UserRepository.class);
        StoreReviewRepository reviews = mock(StoreReviewRepository.class);

        when(security.getCurrentUserId()).thenReturn(customerId);
        when(security.getCurrentUser()).thenReturn(customer);
        when(orders.findById(orderId)).thenReturn(Optional.of(order));
        when(reviews.existsByOrderId(orderId)).thenReturn(false).thenReturn(true);
        StoreReview reviewEntity = StoreReview.builder().id(UUID.randomUUID()).order(order).provider(provider)
                .customer(customer).rating(5).comment("Bánh ngon").createdAt(LocalDateTime.now()).build();
        when(reviews.save(any(StoreReview.class))).thenReturn(reviewEntity);
        when(reviews.findByProviderIdOrderByCreatedAtDesc(providerId)).thenReturn(List.of(reviewEntity));

        StoreReviewController controller = new StoreReviewController(security, orders, users, reviews);

        var request = new StoreReviewController.ReviewRequest(orderId, 5, "Bánh ngon");
        controller.create(providerId, request);
        var list = controller.list(providerId).getBody().getData();
        assertThat(list).hasSize(1);
        assertThat(list.getFirst().rating()).isEqualTo(5);
        assertThatThrownBy(() -> controller.create(providerId, request))
                .isInstanceOf(ResponseStatusException.class);
    }
}
