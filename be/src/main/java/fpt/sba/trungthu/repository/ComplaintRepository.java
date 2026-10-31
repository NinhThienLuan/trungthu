package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.Complaint;
import fpt.sba.trungthu.entity.enumeration.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
    List<Complaint> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    List<Complaint> findByProviderIdOrderByCreatedAtDesc(UUID providerId);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    boolean existsByOrderIdAndStatusIn(UUID orderId, Collection<ComplaintStatus> statuses);
}
