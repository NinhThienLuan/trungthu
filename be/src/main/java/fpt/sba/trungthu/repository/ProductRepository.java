package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    Page<Product> findByProviderId(UUID providerId, Pageable pageable);
    List<Product> findByProviderId(UUID providerId);
    Optional<Product> findByIdAndProviderId(UUID id, UUID providerId);
    boolean existsByNameAndProviderId(String name, UUID providerId);
}
