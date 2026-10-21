package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.DailyCapacity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyCapacityRepository extends JpaRepository<DailyCapacity, UUID> {
    Optional<DailyCapacity> findByProviderIdAndCapacityDate(UUID providerId, LocalDate capacityDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<DailyCapacity> findForUpdateByProviderIdAndCapacityDate(UUID providerId, LocalDate capacityDate);
}
