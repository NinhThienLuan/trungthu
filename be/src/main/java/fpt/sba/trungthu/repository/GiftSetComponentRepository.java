package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.GiftSetComponent;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GiftSetComponentRepository extends JpaRepository<GiftSetComponent, UUID> {

    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM GiftSetComponent c WHERE c.componentVariant.id = :variantId")
    long sumQuantityByComponentVariantId(@Param("variantId") UUID variantId);

    List<GiftSetComponent> findBySetProductId(UUID setProductId);

    List<GiftSetComponent> findByComponentVariantId(UUID componentVariantId);

    Optional<GiftSetComponent> findBySetProductIdAndComponentVariantId(UUID setProductId, UUID componentVariantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM GiftSetComponent c WHERE c.setProduct.id = :setProductId")
    List<GiftSetComponent> lockBySetProductId(@Param("setProductId") UUID setProductId);
}
