package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.BulkOrderGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface BulkOrderGroupRepository extends JpaRepository<BulkOrderGroup, UUID> {
    Optional<BulkOrderGroup> findByRequestId(UUID requestId);
}
