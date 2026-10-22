package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.InventoryAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryAuditRepository extends JpaRepository<InventoryAudit, UUID> {

    Page<InventoryAudit> findByVariantId(UUID variantId, Pageable pageable);

    void deleteByVariantId(UUID variantId);

    @Query("""
            SELECT DISTINCT a.order.id FROM InventoryAudit a
            WHERE a.variant.id = :variantId AND a.auditType = :type
              AND a.createdAt >= :from AND a.createdAt < :to
            """)
    java.util.List<UUID> findOrderIdsByTypeBetween(@Param("variantId") UUID variantId,
            @Param("type") fpt.sba.trungthu.entity.enumeration.InventoryAuditType type,
            @Param("from") java.time.LocalDateTime from, @Param("to") java.time.LocalDateTime to);

    boolean existsByOrderIdAndAuditType(UUID orderId, fpt.sba.trungthu.entity.enumeration.InventoryAuditType auditType);

    @Query("""
            SELECT a.auditType, COALESCE(SUM(ABS(a.quantityDelta)), 0)
            FROM InventoryAudit a
            WHERE a.variant.id = :variantId
            GROUP BY a.auditType
            """)
    java.util.List<Object[]> sumAbsByType(@Param("variantId") UUID variantId);

    @Query("""
            SELECT COALESCE(SUM(a.quantityDelta), 0) FROM InventoryAudit a
            WHERE a.variant.id = :variantId AND a.auditType = :type
            """)
    long sumDelta(@Param("variantId") UUID variantId,
            @Param("type") fpt.sba.trungthu.entity.enumeration.InventoryAuditType type);
}
