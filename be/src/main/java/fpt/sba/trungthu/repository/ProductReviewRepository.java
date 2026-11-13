package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, UUID> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(UUID productId);
    boolean existsByOrderIdAndProductId(UUID orderId, UUID productId);
    List<ProductReview> findByOrderId(UUID orderId);
}
