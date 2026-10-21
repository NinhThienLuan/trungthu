package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.Subscription;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
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
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
           "FROM Subscription s " +
           "WHERE s.provider.id = :providerId " +
           "AND s.status = 'ACTIVE' " +
           "AND s.startDate <= :today " +
           "AND s.endDate >= :today")
    boolean hasActiveSubscription(@Param("providerId") UUID providerId, 
                                  @Param("today") LocalDate today);

    /**
     * Tìm tất cả subscription theo trạng thái (cho Admin)
     */
    List<Subscription> findByStatusOrderByCreatedAtDesc(SubscriptionStatus status);

    /**
     * Tìm subscription với pessimistic lock (để update trạng thái)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Subscription s WHERE s.id = :id")
    Optional<Subscription> findByIdWithLock(@Param("id") UUID id);

    /**
     * Tìm subscription hết hạn (cho cron job Phase 2)
     */
    @Query("SELECT s FROM Subscription s " +
           "WHERE s.status = 'ACTIVE' " +
           "AND s.endDate < :today")
    List<Subscription> findExpiredSubscriptions(@Param("today") LocalDate today);
}
