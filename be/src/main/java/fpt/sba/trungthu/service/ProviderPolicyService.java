package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.response.ProviderPolicyResponse;

/**
 * Service kiểm tra policy của Provider (KYC + Subscription + Season + Status)
 * Pattern: Service nhận email (String) thay vì UUID
 */
public interface ProviderPolicyService {
    
    /**
     * Kiểm tra Provider có thể publish products không
     * Conditions: is_compliance_approved AND hasActiveSubscription AND status=ACTIVE AND is_season_active
     */
    ProviderPolicyResponse canPublishProducts(String providerEmail);
    
    /**
     * Kiểm tra Provider có thể thêm product không (chưa đạt SKU limit)
     */
    boolean canAddMoreProducts(String providerEmail);
    
    /**
     * Lấy SKU limit của Provider từ active subscription
     */
    int getMaxProductsAllowed(String providerEmail);
    
    /**
     * Validate Provider có thể thực hiện checkout không (cho BE3 integration)
     */
    void validateProviderForCheckout(String providerEmail);
}
