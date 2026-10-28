package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    List<Promotion> findByProviderIdOrderByStartDateDesc(UUID providerId);

    /** Đang chạy: active và today trong [startDate, endDate] */
    List<Promotion> findByProviderIdAndActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID providerId, LocalDate start, LocalDate end);

    List<Promotion> findByActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate start, LocalDate end);
}
