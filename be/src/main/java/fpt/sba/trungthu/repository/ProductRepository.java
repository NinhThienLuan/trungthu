package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    @EntityGraph(attributePaths = "variants")
    List<Product> findByProviderEmailOrderByCreatedAtDesc(String email);

    Optional<Product> findByIdAndProviderEmail(UUID id, String email);

    @EntityGraph(attributePaths = {"variants", "provider"})
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.provider.status = 'ACTIVE' " +
            "AND (:type IS NULL OR p.productType = :type) ORDER BY p.createdAt DESC")
    List<Product> findPublic(@Param("type") ProductType type);

    @EntityGraph(attributePaths = {"variants", "provider"})
    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.status = 'ACTIVE' AND p.provider.status = 'ACTIVE'")
    Optional<Product> findPublicById(@Param("id") UUID id);
}
