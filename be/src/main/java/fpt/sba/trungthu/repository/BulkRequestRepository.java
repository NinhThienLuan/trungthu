package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.BulkRequest;
import fpt.sba.trungthu.entity.enumeration.BulkRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BulkRequestRepository extends JpaRepository<BulkRequest, UUID> {
    boolean existsByRequestCode(String requestCode);
    List<BulkRequest> findTop100ByCustomerIdOrderByCreatedAtDesc(UUID customerId);
    List<BulkRequest> findTop100ByStatusOrderByCreatedAtDesc(BulkRequestStatus status);
}
