package fpt.sba.trungthu.common.config;

import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.service.OrderLifecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderExpirationJob {
    private final OrderRepository orders;
    private final OrderLifecycleService lifecycle;

    @Scheduled(fixedDelay = 60_000)
    public void expirePendingDeposits() {
        var ids = orders.findExpiredPendingDeposits(Instant.now(), PageRequest.of(0, 100))
                .stream().map(order -> order.getId()).toList();
        for (var id : ids) {
            try {
                lifecycle.expire(id);
            } catch (RuntimeException ex) {
                log.error("Cannot expire order {}; retry on next run", id, ex);
            }
        }
    }
}
