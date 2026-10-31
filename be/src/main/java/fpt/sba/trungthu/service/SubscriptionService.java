package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.ActivateSubscriptionRequest;
import fpt.sba.trungthu.dto.request.CreateSubscriptionRequest;
import fpt.sba.trungthu.dto.response.SubscriptionResponse;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;

import java.util.List;
import java.util.UUID;

/**
 * Service quản lý SaaS Subscription của Provider
 * Pattern: Service nhận email từ Controller, internally convert to UUID for repository queries
 */
public interface SubscriptionService {
    
    // Provider creates subscription
    SubscriptionResponse createSubscription(String providerEmail, CreateSubscriptionRequest request);
    
    // Admin activates subscription
    SubscriptionResponse activateSubscription(UUID subscriptionId, ActivateSubscriptionRequest request);
    
    // Admin expires subscription
    SubscriptionResponse expireSubscription(UUID subscriptionId);
    
    // Admin or Provider cancels subscription
    /** ownerEmail: seller chỉ huỷ được gói của mình; null = admin huỷ bất kỳ gói nào */
    SubscriptionResponse cancelSubscription(UUID subscriptionId, String ownerEmail);

    List<SubscriptionResponse> mySubscriptions(String providerEmail);
    
    // Provider gets their active subscription
    SubscriptionResponse getActiveSubscription(String providerEmail);
    
    // Check if provider has active subscription
    boolean hasActiveSubscription(String providerEmail);
    
    // Admin gets all subscriptions by status
    List<SubscriptionResponse> getAllSubscriptionsByStatus(SubscriptionStatus status);
}
