package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    boolean existsBySku(String sku);

    Optional<ProductVariant> findByIdAndProductId(UUID id, UUID productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ProductVariant> findForUpdateById(UUID id);

    List<ProductVariant> findByProductId(UUID productId);

    long countByProductId(UUID productId);

    @Query("SELECT DISTINCT v.product.id FROM ProductVariant v WHERE v.id IN :ids")
    List<UUID> findProductIdsByIdIn(@Param("ids") Collection<UUID> ids);

    @Query(value = "SELECT COUNT(*) FROM PRODUCT_VARIANT WHERE product_id = :productId AND stock_quantity > 0",
            nativeQuery = true)
    long countPositiveStock(@Param("productId") UUID productId);
}
