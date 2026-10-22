package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity  .SetInventoryAudit;
import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SetInventoryAuditRepository extends JpaRepository<SetInventoryAudit, UUID> {

    Page<SetInventoryAudit> findBySetProductId(UUID setProductId, Pageable pageable);

    void deleteBySetProductId(UUID setProductId);

    @Query("""
            SELECT COALESCE(SUM(a.quantityDelta), 0) FROM SetInventoryAudit a
            WHERE a.setProduct.id = :setId AND a.auditType = :type
            """)
    long sumDelta(@Param("setId") UUID setId, @Param("type") InventoryAuditType type);
}
