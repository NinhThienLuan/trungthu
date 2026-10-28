package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.ProviderQuotation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProviderQuotationRepository extends JpaRepository<ProviderQuotation, UUID> {
    List<ProviderQuotation> findByRequestIdOrderByQuotedPriceAsc(UUID requestId);
    List<ProviderQuotation> findTop100ByProviderIdOrderByCreatedAtDesc(UUID providerId);
    Optional<ProviderQuotation> findByRequestIdAndProviderId(UUID requestId, UUID providerId);
    boolean existsByRequestIdAndProviderId(UUID requestId, UUID providerId);
}
