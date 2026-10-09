package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {
    List<ProductImage> findByVariantIdOrderByDisplayOrderAsc(UUID variantId);
    Optional<ProductImage> findByIdAndVariantProductProviderId(UUID id, UUID providerId);
    List<ProductImage> findByVariantId(UUID variantId);

    @Modifying
    void deleteByVariantId(UUID variantId);
}
