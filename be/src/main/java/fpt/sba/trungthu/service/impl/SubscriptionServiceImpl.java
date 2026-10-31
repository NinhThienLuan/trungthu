package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.dto.request.ActivateSubscriptionRequest;
import fpt.sba.trungthu.dto.request.CreateSubscriptionRequest;
import fpt.sba.trungthu.dto.response.SubscriptionResponse;
import fpt.sba.trungthu.entity.Subscription;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.SubscriptionPlan;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public SubscriptionResponse createSubscription(String providerEmail, CreateSubscriptionRequest request) {
        log.info("Creating subscription for provider: {}", providerEmail);
        
        try {
            // Find provider
            User provider = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
                    .orElseThrow(() -> new IllegalArgumentException("Provider not found or inactive: " + providerEmail));

            // Giá và giới hạn lấy từ bảng gói của sàn; mỗi lúc chỉ một yêu cầu chờ duyệt
            if (subscriptionRepository.findByProviderIdOrderByCreatedAtDesc(provider.getId()).stream()
                    .anyMatch(s -> s.getStatus() == SubscriptionStatus.PENDING_PAYMENT)) {
                throw new IllegalArgumentException("Bạn đã có một yêu cầu gói đang chờ admin xác nhận");
            }
            SubscriptionPlan plan = request.getPlan();


            // Create subscription with PENDING_PAYMENT status
            // Dates will be set by admin when activating
            Subscription subscription = Subscription.builder()
                    .provider(provider)
                    .planName(plan.label())
                    .price(plan.price())
                    .maxProductsAllowed(plan.maxProducts())
                    .isFeatured(plan == SubscriptionPlan.PREMIUM)
                    .paymentNote(request.getPaymentProof() == null || request.getPaymentProof().isBlank()
                            ? null : request.getPaymentProof().trim())
                    .status(SubscriptionStatus.PENDING_PAYMENT)
                    // Cột ngày NOT NULL: ghi ngày dự kiến (hôm nay -> hết năm); admin kích hoạt sẽ ghi ngày thật.
                    // Gói chờ không tính là đang chạy vì mọi kiểm tra đều đòi status ACTIVE.
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().withMonth(12).withDayOfMonth(31))
                    .build();

            Subscription savedSubscription = subscriptionRepository.save(subscription);
            log.info("Subscription created successfully with ID: {}", savedSubscription.getId());

            return mapToResponse(savedSubscription);
        } catch (Exception e) {
            log.error("Error creating subscription for provider: {}", providerEmail, e);
            throw e;
        } finally {
            log.debug("Finished createSubscription for provider: {}", providerEmail);
        }
    }

    @Override
    @Transactional
    public SubscriptionResponse activateSubscription(UUID subscriptionId, ActivateSubscriptionRequest request) {
        log.info("Activating subscription: {}", subscriptionId);
        
        try {
            // Find subscription with pessimistic lock
            Subscription subscription = subscriptionRepository.findByIdWithLock(subscriptionId)
                    .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));

            // Validate status transition
            if (subscription.getStatus() != SubscriptionStatus.PENDING_PAYMENT) {
                throw new IllegalStateException("Only PENDING_PAYMENT subscriptions can be activated. Current status: " + subscription.getStatus());
            }

            // Validate dates
            LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
            LocalDate endDate = request.getEndDate();

            if (endDate.isBefore(startDate)) {
                throw new IllegalArgumentException("End date cannot be before start date");
            }

            // Set activation dates
            subscription.setStartDate(startDate);
            subscription.setEndDate(endDate);
            // Một xưởng chỉ có một gói đang chạy: gói cũ hết hạn khi kích hoạt gói mới
            subscriptionRepository.findByProviderIdOrderByCreatedAtDesc(subscription.getProvider().getId()).stream()
                    .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE && !s.getId().equals(subscription.getId()))
                    .forEach(s -> s.transitionStatus(SubscriptionStatus.EXPIRED));
            subscription.transitionStatus(SubscriptionStatus.ACTIVE);

            Subscription updatedSubscription = subscriptionRepository.save(subscription);
            log.info("Subscription activated successfully: {}", subscriptionId);

            return mapToResponse(updatedSubscription);
        } catch (Exception e) {
            log.error("Error activating subscription: {}", subscriptionId, e);
            throw e;
        } finally {
            log.debug("Finished activateSubscription for ID: {}", subscriptionId);
        }
    }

    @Override
    @Transactional
    public SubscriptionResponse expireSubscription(UUID subscriptionId) {
        log.info("Expiring subscription: {}", subscriptionId);
        
        try {
            Subscription subscription = subscriptionRepository.findByIdWithLock(subscriptionId)
                    .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));

            if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
                throw new IllegalStateException("Only ACTIVE subscriptions can be expired. Current status: " + subscription.getStatus());
            }

            subscription.transitionStatus(SubscriptionStatus.EXPIRED);
            Subscription updatedSubscription = subscriptionRepository.save(subscription);
            log.info("Subscription expired successfully: {}", subscriptionId);

            return mapToResponse(updatedSubscription);
        } catch (Exception e) {
            log.error("Error expiring subscription: {}", subscriptionId, e);
            throw e;
        } finally {
            log.debug("Finished expireSubscription for ID: {}", subscriptionId);
        }
    }

    @Override
    @Transactional
    public SubscriptionResponse cancelSubscription(UUID subscriptionId, String ownerEmail) {
        log.info("Cancelling (suspending) subscription: {}", subscriptionId);
        
        try {
            Subscription subscription = subscriptionRepository.findByIdWithLock(subscriptionId)
                    .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));
            // Seller chỉ huỷ gói của chính mình (ownerEmail null = admin)
            if (ownerEmail != null && !subscription.getProvider().getEmail().equalsIgnoreCase(ownerEmail)) {
                throw new IllegalArgumentException("Subscription not found: " + subscriptionId);
            }

            // In SubscriptionStatus enum, SUSPENDED is used for cancellation
            if (subscription.getStatus() == SubscriptionStatus.SUSPENDED || subscription.getStatus() == SubscriptionStatus.EXPIRED) {
                throw new IllegalStateException("Subscription is already cancelled or expired");
            }

            subscription.transitionStatus(SubscriptionStatus.SUSPENDED);
            Subscription updatedSubscription = subscriptionRepository.save(subscription);
            log.info("Subscription cancelled (suspended) successfully: {}", subscriptionId);

            return mapToResponse(updatedSubscription);
        } catch (Exception e) {
            log.error("Error cancelling subscription: {}", subscriptionId, e);
            throw e;
        } finally {
            log.debug("Finished cancelSubscription for ID: {}", subscriptionId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionResponse getActiveSubscription(String providerEmail) {
        log.info("Getting active subscription for provider: {}", providerEmail);
        
        try {
            User provider = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
                    .orElseThrow(() -> new IllegalArgumentException("Provider not found or inactive: " + providerEmail));

            Subscription activeSubscription = subscriptionRepository
                    .findByProviderIdAndStatus(provider.getId(), SubscriptionStatus.ACTIVE)
                    .orElseThrow(() -> new IllegalArgumentException("No active subscription found for provider: " + providerEmail));

            log.info("Found active subscription: {} for provider: {}", activeSubscription.getId(), providerEmail);

            return mapToResponse(activeSubscription);
        } catch (Exception e) {
            log.error("Error getting active subscription for provider: {}", providerEmail, e);
            throw e;
        } finally {
            log.debug("Finished getActiveSubscription for provider: {}", providerEmail);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasActiveSubscription(String providerEmail) {
        log.info("Checking active subscription for provider: {}", providerEmail);
        
        try {
            User provider = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
                    .orElse(null);

            if (provider == null) {
                log.warn("Provider not found: {}", providerEmail);
                return false;
            }

            boolean hasActive = subscriptionRepository.hasActiveSubscription(provider.getId(), LocalDate.now());
            log.info("Provider {} has active subscription: {}", providerEmail, hasActive);
            
            return hasActive;
        } catch (Exception e) {
            log.error("Error checking active subscription for provider: {}", providerEmail, e);
            return false;
        } finally {
            log.debug("Finished hasActiveSubscription for provider: {}", providerEmail);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getAllSubscriptionsByStatus(SubscriptionStatus status) {
        log.info("Getting all subscriptions with status: {}", status);
        
        try {
            List<Subscription> subscriptions = subscriptionRepository
                    .findByStatusOrderByCreatedAtDesc(status);

            log.info("Found {} subscriptions with status: {}", subscriptions.size(), status);
            return subscriptions.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting subscriptions by status: {}", status, e);
            throw e;
        } finally {
            log.debug("Finished getAllSubscriptionsByStatus for status: {}", status);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionResponse> mySubscriptions(String providerEmail) {
        User provider = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Provider not found or inactive: " + providerEmail));
        return subscriptionRepository.findByProviderIdOrderByCreatedAtDesc(provider.getId()).stream()
                .map(this::mapToResponse).toList();
    }

    private SubscriptionResponse mapToResponse(Subscription subscription) {
        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .providerEmail(subscription.getProvider().getEmail())
                .providerName(subscription.getProvider().getFullName())
                .storeName(subscription.getProvider().getStoreName())
                .paymentNote(subscription.getPaymentNote())
                .planName(subscription.getPlanName())
                .price(subscription.getPrice())
                .maxProductsAllowed(subscription.getMaxProductsAllowed())
                .isFeatured(subscription.getIsFeatured())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .status(subscription.getStatus())
                .createdAt(subscription.getCreatedAt())
                .build();
    }
}
