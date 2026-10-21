package fpt.sba.trungthu.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProviderPolicyResponse {
    private Boolean canPublishProducts;
    private Boolean hasActiveSubscription;
    private Boolean isComplianceApproved;
    private Boolean isSeasonActive;
    private Boolean isProviderActive;
    private Integer currentProductCount;
    private Integer maxProductsAllowed;
    private Boolean canAddMoreProducts;
    private String reason; // why cannot publish/add products
}
