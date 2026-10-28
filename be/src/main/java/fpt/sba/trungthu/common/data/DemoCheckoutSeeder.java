package fpt.sba.trungthu.common.data;

import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.repository.DailyCapacityRepository;
import fpt.sba.trungthu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Seller demo cần năng lực nướng thì checkout mới chạy (CAPACITY_MISSING).
 * Chạy mỗi lần khởi động: chỉ thêm ngày còn thiếu, không ghi đè cấu hình seller đã sửa.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.demo-seed", havingValue = "true", matchIfMissing = true)
@Order(105)
@RequiredArgsConstructor
public class DemoCheckoutSeeder implements CommandLineRunner {
    private static final List<String> SELLERS = List.of("seller@kinhdo.vn", "seller@dongkhanh.vn", "seller@givral.vn");
    private static final int DAYS_AHEAD = 60;
    private static final int DAILY_CAPACITY = 500;
    private final UserRepository users;
    private final DailyCapacityRepository capacities;

    @Override
    @Transactional
    public void run(String... args) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        for (String email : SELLERS) {
            User seller = users.findByEmail(email).orElse(null);
            if (seller == null) continue;
            Set<LocalDate> have = capacities.findByProviderIdAndCapacityDateBetweenOrderByCapacityDateAsc(
                    seller.getId(), today, today.plusDays(DAYS_AHEAD)).stream()
                    .map(DailyCapacity::getCapacityDate).collect(Collectors.toSet());
            List<DailyCapacity> missing = new ArrayList<>();
            for (LocalDate d = today; !d.isAfter(today.plusDays(DAYS_AHEAD)); d = d.plusDays(1)) {
                if (!have.contains(d)) {
                    missing.add(DailyCapacity.builder().provider(seller).capacityDate(d)
                            .maxQuantity(DAILY_CAPACITY).reservedQuantity(0).build());
                }
            }
            capacities.saveAll(missing);
            if (!missing.isEmpty()) log.info("Demo capacity seeded for {}: {} days", email, missing.size());
        }
    }
}
