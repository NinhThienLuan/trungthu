package fpt.sba.trungthu.repository;

import fpt.sba.trungthu.entity.ProviderPayosAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProviderPayosAccountRepository extends JpaRepository<ProviderPayosAccount, UUID> {
    Optional<ProviderPayosAccount> findByProviderId(UUID providerId);

    boolean existsByProviderId(UUID providerId);
}
