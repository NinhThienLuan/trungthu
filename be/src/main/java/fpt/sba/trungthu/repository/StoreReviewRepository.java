package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.StoreReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StoreReviewRepository extends JpaRepository<StoreReview, UUID> {
    List<StoreReview> findByProviderIdOrderByCreatedAtDesc(UUID providerId);
    boolean existsByOrderId(UUID orderId);
}
