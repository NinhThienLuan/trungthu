package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.BulkOrder;
import fpt.sba.trungthu.entity.enumeration.BulkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BulkOrderRepository extends JpaRepository<BulkOrder, UUID> {
    Optional<BulkOrder> findByQuoteId(UUID quoteId);
    /** Các đơn sỉ con của một đơn tổng (RFQ) */
    List<BulkOrder> findByQuoteRequestId(UUID requestId);
    List<BulkOrder> findTop100ByQuoteRequestCustomerIdOrderByCreatedAtDesc(UUID customerId);
    List<BulkOrder> findTop100ByQuoteProviderIdOrderByCreatedAtDesc(UUID providerId);
    List<BulkOrder> findByStatusAndDepositDeadlineBefore(BulkOrderStatus status, LocalDateTime deadline);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<BulkOrder> findForUpdateById(UUID id);
}
