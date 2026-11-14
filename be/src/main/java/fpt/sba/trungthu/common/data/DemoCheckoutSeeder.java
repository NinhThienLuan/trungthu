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
 * Ghi từ hôm nay đến 60 ngày sau. Bỏ qua ngày mà đơn mẫu vừa tạo khi checkout.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.demo-seed", havingValue = "true", matchIfMissing = true)
@Order(105)
@RequiredArgsConstructor
public class DemoCheckoutSeeder implements CommandLineRunner {
    private static final List<String> SELLERS = List.of(
            "seller@kinhdo.vn", "seller@dongkhanh.vn", "seller@givral.vn",
            "seller@anphu.vn", "seller@minhnguyet.vn");
    private static final int DAYS_AHEAD = 60;
    private static final int DAILY_CAPACITY = 500;
    private final UserRepository users;
    private final DailyCapacityRepository capacities;

    @Override
    @Transactional
    public void run(String... args) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        for (String email : SELLERS) {
            User seller = users.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("Seller " + email + " is missing"));
            Set<LocalDate> present = capacities.findByProviderIdAndCapacityDateBetweenOrderByCapacityDateAsc(
                    seller.getId(), today, today.plusDays(DAYS_AHEAD)).stream()
                    .map(DailyCapacity::getCapacityDate)
                    .collect(Collectors.toSet());
            List<DailyCapacity> days = new ArrayList<>();
            for (LocalDate date = today; !date.isAfter(today.plusDays(DAYS_AHEAD)); date = date.plusDays(1)) {
                if (present.contains(date)) {
                    continue;
                }
                days.add(DailyCapacity.builder().provider(seller).capacityDate(date)
                        .maxQuantity(DAILY_CAPACITY).reservedQuantity(0).build());
            }
            capacities.saveAll(days);
            log.info("Demo capacity seeded for {}: {} days", email, days.size());
        }
    }
}
