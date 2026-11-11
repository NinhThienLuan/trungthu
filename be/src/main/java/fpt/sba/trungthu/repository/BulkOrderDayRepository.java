package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.BulkOrderDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BulkOrderDayRepository extends JpaRepository<BulkOrderDay, UUID> {
    List<BulkOrderDay> findByOrderIdOrderByProductionDateAsc(UUID orderId);
}
