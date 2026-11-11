package fpt.sba.trungthu.common.config;

import fpt.sba.trungthu.entity.enumeration.BulkOrderStatus;
import fpt.sba.trungthu.repository.BulkOrderRepository;
import fpt.sba.trungthu.service.impl.BulkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
@RequiredArgsConstructor
@Slf4j
public class BulkOrderExpirationJob {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private final BulkOrderRepository orders;
    private final BulkOrderService service;

    @Scheduled(fixedDelay = 60_000)
    public void expireDeposits() {
        var ids = orders.findByStatusAndDepositDeadlineBefore(
                BulkOrderStatus.WAITING_DEPOSIT, LocalDateTime.now(VIETNAM))
                .stream().map(order -> order.getId()).toList();
        for (var id : ids) {
            try {
                service.expire(id);
            } catch (RuntimeException e) {
                log.error("Cannot expire bulk order {}; retry on next run", id, e);
            }
        }
    }
}
