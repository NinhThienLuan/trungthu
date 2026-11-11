package fpt.sba.trungthu.service;

import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.DailyCapacityRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RfqDeliveryEstimator {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int HORIZON_DAYS = 120;
    private final DailyCapacityRepository capacities;
    private final UserRepository users;
    private final SubscriptionRepository subscriptions;

    public record Estimate(LocalDate earliestDeliveryDate, UUID providerId, int cakeQuantity,
            int productionDays) {}

    @Transactional(readOnly = true)
    public Estimate estimate(int boxes, int cakesPerBox, UUID providerId) {
        if (boxes < 20 || cakesPerBox < 1 || cakesPerBox > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số hộp hoặc số bánh mỗi hộp không hợp lệ");
        }
        int cakes;
        try {
            cakes = Math.multiplyExact(boxes, cakesPerBox);
        } catch (ArithmeticException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số bánh vượt giới hạn");
        }
        LocalDate today = LocalDate.now(VIETNAM);
        List<User> candidates = providerId == null
                ? users.findByRoleAndStatusAndIsComplianceApprovedTrueAndIsSeasonActiveTrue(
                        UserRole.PROVIDER, UserStatus.ACTIVE)
                : users.findById(providerId).filter(user -> user.getRole() == UserRole.PROVIDER
                        && user.getStatus() == UserStatus.ACTIVE).stream().toList();
        return candidates.stream().filter(provider -> subscriptions
                        .existsByProviderIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                                provider.getId(), SubscriptionStatus.ACTIVE, today, today))
                .map(provider -> estimateForProvider(provider, cakes, today))
                .filter(estimate -> estimate != null)
                .min(Comparator.comparing(Estimate::earliestDeliveryDate))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        "Chưa có xưởng đủ suất nướng trong 120 ngày tới"));
    }

    private Estimate estimateForProvider(User provider, int cakes, LocalDate today) {
        int remaining = cakes;
        int days = 0;
        for (DailyCapacity day : capacities.findByProviderIdAndCapacityDateBetweenOrderByCapacityDateAsc(
                provider.getId(), today.plusDays(1), today.plusDays(HORIZON_DAYS - 1))) {
            int free = Math.max(0, day.getMaxQuantity() - day.getReservedQuantity());
            if (free == 0) continue;
            remaining -= Math.min(remaining, free);
            days++;
            if (remaining == 0) return new Estimate(day.getCapacityDate().plusDays(1),
                    provider.getId(), cakes, days);
        }
        return null;
    }
}
