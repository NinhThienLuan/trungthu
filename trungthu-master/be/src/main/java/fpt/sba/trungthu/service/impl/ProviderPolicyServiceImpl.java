package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.dto.response.ProviderPolicyResponse;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.ProviderPolicyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProviderPolicyServiceImpl implements ProviderPolicyService {
    
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ProductRepository productRepository;
    
    @Override
    @Transactional(readOnly = true)
    public ProviderPolicyResponse canPublishProducts(String providerEmail) {
        log.debug("Checking publish policy for provider: {}", providerEmail);
        
        // Lookup provider by email
        User provider = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));
        
        // Check all 4 conditions
        boolean isComplianceApproved = provider.getIsComplianceApproved() != null && provider.getIsComplianceApproved();
        boolean hasActiveSubscription = subscriptionRepository.hasActiveSubscription(provider.getId(), LocalDate.now());
        boolean isProviderActive = provider.getStatus() == UserStatus.ACTIVE;
        boolean isSeasonActive = provider.getIsSeasonActive() != null && provider.getIsSeasonActive();
        
        // Get current product count by querying provider's products
        int currentProductCount = productRepository.findByProviderEmailOrderByCreatedAtDesc(providerEmail).size();
        
        // Get max products allowed from active subscription
        Integer maxProductsAllowed = null;
        if (hasActiveSubscription) {
            try {
                maxProductsAllowed = subscriptionRepository.findByProviderIdAndStatus(
                    provider.getId(), 
                    SubscriptionStatus.ACTIVE
                ).map(sub -> sub.getMaxProductsAllowed()).orElse(0);
            } catch (Exception e) {
                log.warn("Failed to get max products allowed for {}", providerEmail, e);
                maxProductsAllowed = 0;
            }
        }
        
        boolean canAddMore = hasActiveSubscription && maxProductsAllowed != null && currentProductCount < maxProductsAllowed;
        
        // All 4 conditions must be true
        boolean canPublish = isComplianceApproved && hasActiveSubscription && isProviderActive && isSeasonActive;
        
        // Build human-readable reason
        List<String> reasons = new ArrayList<>();
        if (!isComplianceApproved) reasons.add("Compliance not approved");
        if (!hasActiveSubscription) reasons.add("No active subscription");
        if (!isProviderActive) reasons.add("Provider account not active");
        if (!isSeasonActive) reasons.add("Season not active");
        
        String reason = reasons.isEmpty() ? null : String.join(", ", reasons);
        
        log.debug("Provider {} policy check: canPublish={}, reason={}", providerEmail, canPublish, reason);
        
        return ProviderPolicyResponse.builder()
            .canPublishProducts(canPublish)
            .hasActiveSubscription(hasActiveSubscription)
            .isComplianceApproved(isComplianceApproved)
            .isSeasonActive(isSeasonActive)
            .isProviderActive(isProviderActive)
            .currentProductCount(currentProductCount)
            .maxProductsAllowed(maxProductsAllowed)
            .canAddMoreProducts(canAddMore)
            .reason(reason)
            .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean canAddMoreProducts(String providerEmail) {
        ProviderPolicyResponse policy = canPublishProducts(providerEmail);
        return policy.getCanAddMoreProducts() != null && policy.getCanAddMoreProducts();
    }
    
    @Override
    @Transactional(readOnly = true)
    public int getMaxProductsAllowed(String providerEmail) {
        User provider = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));
        
        if (!subscriptionRepository.hasActiveSubscription(provider.getId(), LocalDate.now())) {
            return 0;
        }
        
        return subscriptionRepository.findByProviderIdAndStatus(
            provider.getId(), 
            SubscriptionStatus.ACTIVE
        ).map(sub -> sub.getMaxProductsAllowed()).orElse(0);
    }
    
    @Override
    @Transactional(readOnly = true)
    public void validateProviderForCheckout(String providerEmail) {
        ProviderPolicyResponse policy = canPublishProducts(providerEmail);
        
        if (!policy.getCanPublishProducts()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Provider cannot process checkout: " + policy.getReason());
        }
    }
}
