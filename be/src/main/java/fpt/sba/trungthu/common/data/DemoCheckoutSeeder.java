package fpt.sba.trungthu.common.data;

import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.ProviderShippingRate;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.repository.DailyCapacityRepository;
import fpt.sba.trungthu.repository.ProviderShippingRateRepository;
import fpt.sba.trungthu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Seller demo cần năng lực nướng + phí giao thì checkout mới chạy (CAPACITY_MISSING / SHIPPING_RATE_MISSING).
 * Chạy mỗi lần khởi động: chỉ thêm ngày/khu vực còn thiếu, không ghi đè cấu hình seller đã sửa.
 */
@Slf4j
@Component
@Order(105)
@RequiredArgsConstructor
public class DemoCheckoutSeeder implements CommandLineRunner {
    private static final List<String> SELLERS = List.of("seller@kinhdo.vn", "seller@dongkhanh.vn", "seller@givral.vn");
    private static final int DAYS_AHEAD = 60;
    private static final int DAILY_CAPACITY = 500;
    /** Tỉnh/quận lưu dạng chữ thường như CheckoutService chuẩn hoá */
    private static final List<String[]> ZONES = List.of(
            new String[] {"hà nội", "hoàn kiếm", "30000"},
            new String[] {"hà nội", "cầu giấy", "35000"},
            new String[] {"hồ chí minh", "quận 1", "30000"});

    private final UserRepository users;
    private final DailyCapacityRepository capacities;
    private final ProviderShippingRateRepository shippingRates;

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
            for (String[] zone : ZONES) {
                if (shippingRates.findByProviderIdAndProvinceAndDistrict(seller.getId(), zone[0], zone[1]).isEmpty()) {
                    shippingRates.save(ProviderShippingRate.builder().provider(seller)
                            .province(zone[0]).district(zone[1]).fee(new BigDecimal(zone[2])).build());
                }
            }
            if (!missing.isEmpty()) log.info("Demo capacity seeded for {}: {} days", email, missing.size());
        }
    }
}
