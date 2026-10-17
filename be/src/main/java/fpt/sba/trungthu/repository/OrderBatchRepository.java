package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.OrderBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderBatchRepository extends JpaRepository<OrderBatch, UUID> {
    Optional<OrderBatch> findByOrderId(UUID orderId);

    List<OrderBatch> findByOrderIdIn(Collection<UUID> orderIds);
}
