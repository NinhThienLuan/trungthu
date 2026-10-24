package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.DailyCapacity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyCapacityRepository extends JpaRepository<DailyCapacity, UUID> {

    Optional<DailyCapacity> findByProviderIdAndCapacityDate(UUID providerId, LocalDate capacityDate);

    List<DailyCapacity> findByProviderIdAndCapacityDateBetweenOrderByCapacityDateAsc(UUID providerId,
            LocalDate from, LocalDate to);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<DailyCapacity> findForUpdateByProviderIdAndCapacityDate(UUID providerId, LocalDate capacityDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM DailyCapacity c WHERE c.provider.id = :providerId AND c.capacityDate = :capacityDate")
    Optional<DailyCapacity> lockByProviderAndDate(@Param("providerId") UUID providerId,
            @Param("capacityDate") LocalDate capacityDate);
}
