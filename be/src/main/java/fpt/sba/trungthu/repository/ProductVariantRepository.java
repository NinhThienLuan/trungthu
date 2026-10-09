package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {

    boolean existsBySku(String sku);

    Optional<ProductVariant> findByIdAndProductId(UUID id, UUID productId);
}
