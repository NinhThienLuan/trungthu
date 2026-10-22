package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    void deleteByVariantId(UUID variantId);

    Optional<CartItem> findByCustomerIdAndVariantId(UUID customerId, UUID variantId);

    Optional<CartItem> findByCustomerIdAndSetProductId(UUID customerId, UUID setProductId);

    @Modifying
    @Query("""
            UPDATE CartItem c SET c.selected = false
            WHERE c.variant.id = :variantId
              AND (c.selected = true)
              AND (:stock < c.quantity OR :inStock = false)
            """)
    int unselectUnavailable(@Param("variantId") UUID variantId, @Param("stock") int stock, @Param("inStock") boolean inStock);

    @Modifying
    @Query("""
            UPDATE CartItem c SET c.selected = false
            WHERE c.setProduct.id = :setId
              AND c.selected = true
              AND :assembled < c.quantity
            """)
    int unselectUnavailableSets(@Param("setId") UUID setId, @Param("assembled") int assembled);
}
