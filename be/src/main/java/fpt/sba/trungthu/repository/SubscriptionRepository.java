package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.Subscription;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    /**
     * Tìm subscription ACTIVE của Provider
     */
    Optional<Subscription> findByProviderIdAndStatus(UUID providerId, SubscriptionStatus status);

    /**
     * Kiểm tra Provider có subscription ACTIVE không
     */
    boolean existsByProviderIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID providerId, SubscriptionStatus status, LocalDate startDate, LocalDate endDate);

    default boolean hasActiveSubscription(UUID providerId, LocalDate today) {
        return existsByProviderIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                providerId, SubscriptionStatus.ACTIVE, today, today);
    }

    /**
     * Tìm tất cả subscription theo trạng thái (cho Admin)
     */
    List<Subscription> findByStatusOrderByCreatedAtDesc(SubscriptionStatus status);

    @EntityGraph(attributePaths = "provider")
    Page<Subscription> findByStatusOrderByCreatedAtDescIdDesc(SubscriptionStatus status, Pageable pageable);

    List<Subscription> findByProviderIdOrderByCreatedAtDesc(UUID providerId);

    /**
     * Tìm subscription với pessimistic lock (để update trạng thái)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Subscription> findForUpdateById(UUID id);

    default Optional<Subscription> findByIdWithLock(UUID id) {
        return findForUpdateById(id);
    }

    /**
     * Tìm subscription hết hạn (cho cron job Phase 2)
     */
    List<Subscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDate today);

    default List<Subscription> findExpiredSubscriptions(LocalDate today) {
        return findByStatusAndEndDateBefore(SubscriptionStatus.ACTIVE, today);
    }

    /**
     * Đếm số subscription theo trạng thái
     */
    long countByStatus(SubscriptionStatus status);

    /**
     * Tổng doanh thu phí gói theo trạng thái (cho Admin Dashboard)
     */
    @Query("SELECT COALESCE(SUM(s.price), 0) FROM Subscription s WHERE s.status = :status")
    BigDecimal sumPriceByStatus(@Param("status") SubscriptionStatus status);
}
