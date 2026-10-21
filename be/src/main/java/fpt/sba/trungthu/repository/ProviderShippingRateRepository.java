package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.ProviderShippingRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProviderShippingRateRepository extends JpaRepository<ProviderShippingRate, UUID> {
    Optional<ProviderShippingRate> findByProviderIdAndProvinceAndDistrict(UUID providerId, String province, String district);
}
