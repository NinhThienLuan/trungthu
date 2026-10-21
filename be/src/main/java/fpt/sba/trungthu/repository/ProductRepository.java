package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    @EntityGraph(attributePaths = "variants")
    List<Product> findByProviderEmailOrderByCreatedAtDesc(String email);

    @EntityGraph(attributePaths = "variants")
    Page<Product> findByProviderEmailOrderByCreatedAtDesc(String email, Pageable pageable);

    Optional<Product> findByIdAndProviderEmail(UUID id, String email);

    @EntityGraph(attributePaths = {"variants", "provider"})
    List<Product> findByStatusAndProviderStatusOrderByCreatedAtDesc(ProductStatus status, UserStatus providerStatus);

    @EntityGraph(attributePaths = {"variants", "provider"})
    List<Product> findByStatusAndProviderStatusAndProductTypeOrderByCreatedAtDesc(ProductStatus status,
            UserStatus providerStatus, ProductType type);

    @EntityGraph(attributePaths = {"variants", "provider"})
    Page<Product> findByStatusAndProviderStatus(ProductStatus status, UserStatus providerStatus, Pageable pageable);

    @EntityGraph(attributePaths = {"variants", "provider"})
    Page<Product> findByStatusAndProviderStatusAndProductType(ProductStatus status, UserStatus providerStatus,
            ProductType type, Pageable pageable);

    @EntityGraph(attributePaths = {"variants", "provider"})
    Optional<Product> findByIdAndStatusAndProviderStatus(UUID id, ProductStatus status, UserStatus providerStatus);

    default List<Product> findPublic(ProductType type) {
        return type == null
                ? findByStatusAndProviderStatusOrderByCreatedAtDesc(ProductStatus.ACTIVE, UserStatus.ACTIVE)
                : findByStatusAndProviderStatusAndProductTypeOrderByCreatedAtDesc(
                        ProductStatus.ACTIVE, UserStatus.ACTIVE, type);
    }

    default Page<Product> findPublic(ProductType type, Pageable pageable) {
        return type == null
                ? findByStatusAndProviderStatus(ProductStatus.ACTIVE, UserStatus.ACTIVE, pageable)
                : findByStatusAndProviderStatusAndProductType(ProductStatus.ACTIVE, UserStatus.ACTIVE, type, pageable);
    }

    default Optional<Product> findPublicById(UUID id) {
        return findByIdAndStatusAndProviderStatus(id, ProductStatus.ACTIVE, UserStatus.ACTIVE);
    }
}
