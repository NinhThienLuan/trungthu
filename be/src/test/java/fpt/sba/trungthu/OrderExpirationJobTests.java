package fpt.sba.trungthu;

import fpt.sba.trungthu.common.config.OrderExpirationJob;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.service.OrderLifecycleService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class OrderExpirationJobTests {

    @Test
    void scansBeyondFirstHundredAndContinuesAfterOneFailure() {
        OrderRepository orders = mock(OrderRepository.class);
        OrderLifecycleService lifecycle = mock(OrderLifecycleService.class);
        List<Order> firstPage = new ArrayList<>();
        for (int i = 0; i < 100; i++) firstPage.add(order(UUID.randomUUID()));
        Order last = order(UUID.randomUUID());
        when(orders.findExpiredPendingDeposits(any(Instant.class), eq(PageRequest.of(0, 100))))
                .thenReturn(firstPage);
        when(orders.findExpiredPendingDeposits(any(Instant.class), eq(PageRequest.of(1, 100))))
                .thenReturn(List.of(last));
        UUID failingId = firstPage.getFirst().getId();
        doThrow(new IllegalStateException("temporary release failure")).when(lifecycle)
                .expire(failingId);

        new OrderExpirationJob(orders, lifecycle).expirePendingDeposits();

        verify(lifecycle, times(101)).expire(any(UUID.class));
        verify(lifecycle).expire(last.getId());
    }

    private static Order order(UUID id) {
        Order order = mock(Order.class);
        when(order.getId()).thenReturn(id);
        return order;
    }
}
