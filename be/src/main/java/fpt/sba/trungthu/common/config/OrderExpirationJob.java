package fpt.sba.trungthu.common.config;

import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.service.OrderLifecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderExpirationJob {
    private final OrderRepository orders;
    private final OrderLifecycleService lifecycle;

    @Scheduled(fixedDelay = 60_000)
    public void expirePendingDeposits() {
        Instant deadline = Instant.now();
        var ids = new ArrayList<UUID>();
        int page = 0;
        int batchSize = 100;
        int found;
        // Lấy danh sách trước khi hủy: xóa trạng thái trong lúc phân trang sẽ làm bỏ sót trang sau.
        do {
            var batch = orders.findExpiredPendingDeposits(deadline, PageRequest.of(page++, batchSize));
            found = batch.size();
            batch.forEach(order -> ids.add(order.getId()));
        } while (found == batchSize);
        int failed = 0;
        for (var id : ids) {
            try {
                lifecycle.expire(id);
            } catch (RuntimeException ex) {
                failed++;
                log.error("Cannot expire order {}; retry on next run", id, ex);
            }
        }
        if (!ids.isEmpty()) {
            log.info("Deposit expiration scan: queued={}, processed={}, failed={}", ids.size(), ids.size() - failed,
                    failed);
        }
    }
}
