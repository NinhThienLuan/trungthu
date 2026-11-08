package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.dto.request.ActivateSubscriptionRequest;
import fpt.sba.trungthu.dto.request.CreateSubscriptionRequest;
import fpt.sba.trungthu.dto.response.SubscriptionResponse;
import fpt.sba.trungthu.entity.PaymentTransaction;
import fpt.sba.trungthu.entity.Subscription;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import fpt.sba.trungthu.entity.enumeration.SubscriptionPlan;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.TransactionStatus;
import fpt.sba.trungthu.entity.enumeration.TransactionType;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.PaymentTransactionRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import vn.payos.exception.PayOSException;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionServiceImpl implements SubscriptionService {

    private static final String PAYOS_PREFIX = "PAYOS-";
    static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final SecureRandom ORDER_CODES = new SecureRandom();

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final PaymentTransactionRepository payments;
    private final PayosSubscriptionGateway gateway;

    @Override
    @Transactional
    public SubscriptionResponse createSubscription(String providerEmail, CreateSubscriptionRequest request) {
        gateway.requireConfigured();
        User provider = userRepository.findForUpdateByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản seller không hoạt động."));
        SubscriptionPlan plan = request.getPlan();
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        List<Subscription> history = subscriptionRepository.findByProviderIdOrderByCreatedAtDesc(provider.getId());

        for (Subscription existing : history) {
            if (existing.getStatus() == SubscriptionStatus.PENDING_PAYMENT) {
                PaymentTransaction payment = onlinePayment(existing);
                if (payment != null && existing.getPlanName().equals(plan.label())) return mapToResponse(existing, payment);
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã có một yêu cầu gói đang chờ xử lý.");
            }
            boolean alreadyOnPlan = existing.getPlanName().equals(plan.label());
            boolean lowersLimit = existing.getMaxProductsAllowed() != null
                    && plan.maxProducts() < existing.getMaxProductsAllowed();
            if (existing.getStatus() == SubscriptionStatus.ACTIVE && !existing.getEndDate().isBefore(today)
                    && (alreadyOnPlan || lowersLimit)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ có thể nâng cấp khi gói hiện tại còn hiệu lực.");
            }
        }

        Subscription subscription = subscriptionRepository.save(Subscription.builder()
                .provider(provider).planName(plan.label()).price(plan.price()).maxProductsAllowed(plan.maxProducts())
                .isFeatured(plan == SubscriptionPlan.PREMIUM).status(SubscriptionStatus.PENDING_PAYMENT)
                .startDate(today).endDate(today.withMonth(12).withDayOfMonth(31)).build());
        // Persist the merchant order code before calling payOS so retries reuse the same link.
        PaymentTransaction payment = payments.save(PaymentTransaction.builder()
                .subscription(subscription).transactionType(TransactionType.SUBSCRIPTION_FEE)
                .paymentMethod(PaymentMethod.PAYOS).amount(plan.price())
                .transactionCode(PAYOS_PREFIX + ORDER_CODES.nextLong(1_000_000_000_000L, 1_000_000_000_000_000L)).build());
        return mapToResponse(subscription, payment);
    }

    @Override
    @Transactional
    public SubscriptionResponse openCheckout(UUID subscriptionId, String providerEmail) {
        Subscription subscription = lockOwnedSubscription(subscriptionId, providerEmail);
        PaymentTransaction payment = onlinePayment(subscription);
        if (!isAwaitingPayment(subscription, payment) || payment.getCheckoutUrl() != null) {
            return mapToResponse(subscription, payment);
        }

        Instant seasonEnd = subscription.getEndDate().plusDays(1).atStartOfDay(BUSINESS_ZONE).toInstant();
        Instant now = Instant.now();
        if (!now.isBefore(seasonEnd)) {
            PaymentLink link = findGatewayLink(payment);
            if (link == null) closeUnpaid(subscription, payment, SubscriptionStatus.EXPIRED);
            else reconcile(subscription, payment, link);
            return mapToResponse(subscription, payment);
        }
        long orderCode = orderCode(payment);
        try {
            Instant linkExpiry = now.plus(30, ChronoUnit.MINUTES);
            var link = gateway.create(orderCode, payment.getAmount().longValueExact(),
                    linkExpiry.isBefore(seasonEnd) ? linkExpiry : seasonEnd);
            if (!Objects.equals(link.getOrderCode(), orderCode)
                    || !Objects.equals(link.getAmount(), payment.getAmount().longValueExact())
                    || !"VND".equals(link.getCurrency()) || link.getStatus() != PaymentLinkStatus.PENDING) {
                throw gatewayUnavailable(null);
            }
            payment.setCheckoutUrl(PayosSubscriptionGateway.trustedCheckoutUrl(link.getCheckoutUrl()));
            payment.setQrPayload(link.getQrCode());
        } catch (PayOSException e) {
            PaymentLink existing = findGatewayLink(payment);
            if (existing == null) throw gatewayUnavailable(e);
            reconcile(subscription, payment, existing);
            if (isAwaitingPayment(subscription, payment) && existing.getStatus() == PaymentLinkStatus.PENDING
                    && existing.getId() != null && existing.getId().matches("[a-fA-F0-9]{32}")) {
                // Recovery after payOS created a link but the local checkout details did not commit.
                payment.setCheckoutUrl("https://pay.payos.vn/web/" + existing.getId());
            }
        }
        return mapToResponse(subscription, payment);
    }

    @Override
    @Transactional
    public SubscriptionResponse refreshPayment(UUID subscriptionId, String providerEmail) {
        Subscription subscription = lockOwnedSubscription(subscriptionId, providerEmail);
        PaymentTransaction payment = onlinePayment(subscription);
        if (isAwaitingPayment(subscription, payment)) {
            reconcile(subscription, payment, findGatewayLink(payment));
        }
        return mapToResponse(subscription, payment);
    }

    @Override
    @Transactional
    public void handlePaymentWebhook(Map<String, Object> payload) {
        var event = gateway.verify(payload);
        if (!"00".equals(event.code()) || !"VND".equals(event.currency())) return;
        // Unknown codes include the sample payOS sends when registering a webhook.
        payments.findSubscriptionIdByTransactionCode(PAYOS_PREFIX + event.orderCode()).ifPresent(id -> {
            Subscription subscription = lockOwnedSubscription(id, null);
            PaymentTransaction payment = onlinePayment(subscription);
            if (!isAwaitingPayment(subscription, payment)) return;
            PaymentLink link = findGatewayLink(payment);
            if (link == null || !Objects.equals(link.getId(), event.linkId())) {
                throw gatewayUnavailable(null);
            }
            reconcile(subscription, payment, link);
            if (isAwaitingPayment(subscription, payment) && link.getAmountPaid() == 0) {
                throw gatewayUnavailable(null);
            }
        });
    }

    private void reconcile(Subscription subscription, PaymentTransaction payment, PaymentLink link) {
        if (link == null) return;
        long expected = payment.getAmount().longValueExact();
        if (!Objects.equals(link.getOrderCode(), orderCode(payment)) || !Objects.equals(link.getAmount(), expected)
                || link.getAmountPaid() == null || link.getStatus() == null) {
            throw gatewayUnavailable(null);
        }
        long received = link.getAmountPaid();
        if (link.getStatus() == PaymentLinkStatus.PAID && received == expected
                && Objects.equals(link.getAmountRemaining(), 0L)) {
            Instant paidAt = paidAt(link);
            LocalDate start = paidAt.atZone(BUSINESS_ZONE).toLocalDate();
            if (start.isBefore(subscription.getStartDate()) || start.isAfter(subscription.getEndDate())) {
                subscription.setPaymentNote("Thời điểm nhận tiền nằm ngoài kỳ của gói. Cần đối soát.");
                return;
            }
            payment.setPaidAt(paidAt);
            payment.transitionPaymentStatus(TransactionStatus.SUCCESS);
            subscription.setPaymentNote(null);
            subscription.setStartDate(start);
            if (subscription.getEndDate().isBefore(LocalDate.now(BUSINESS_ZONE))) {
                subscription.transitionStatus(SubscriptionStatus.EXPIRED);
            } else {
                replaceActiveSubscription(subscription);
            }
        } else if (received != 0 || link.getStatus() == PaymentLinkStatus.PAID) {
            subscription.setPaymentNote("payOS ghi nhận " + received + " VND. Khoản thanh toán cần đối soát.");
        } else if (link.getStatus() == PaymentLinkStatus.EXPIRED || link.getStatus() == PaymentLinkStatus.CANCELLED
                || link.getStatus() == PaymentLinkStatus.FAILED) {
            closeUnpaid(subscription, payment, link.getStatus() == PaymentLinkStatus.EXPIRED
                    ? SubscriptionStatus.EXPIRED : SubscriptionStatus.CANCELLED);
        }
    }

    private Instant paidAt(PaymentLink link) {
        if (link.getTransactions() == null) throw gatewayUnavailable(null);
        try {
            return link.getTransactions().stream()
                    .map(t -> parsePaymentTime(t.getTransactionDateTime()))
                    .max(Instant::compareTo).orElseThrow(() -> gatewayUnavailable(null));
        } catch (DateTimeParseException e) {
            throw gatewayUnavailable(e);
        }
    }

    private Instant parsePaymentTime(String timestamp) {
        if (timestamp == null) throw gatewayUnavailable(null);
        var parsed = DateTimeFormatter.ISO_DATE_TIME.parseBest(timestamp.replace(' ', 'T'),
                OffsetDateTime::from, LocalDateTime::from);
        return parsed instanceof OffsetDateTime offset ? offset.toInstant()
                : ((LocalDateTime) parsed).atZone(BUSINESS_ZONE).toInstant();
    }

    private void closeUnpaid(Subscription subscription, PaymentTransaction payment, SubscriptionStatus status) {
        payment.transitionPaymentStatus(TransactionStatus.CANCELLED);
        subscription.transitionStatus(status);
    }

    private PaymentLink findGatewayLink(PaymentTransaction payment) {
        try {
            return gateway.find(orderCode(payment));
        } catch (PayOSException e) {
            throw gatewayUnavailable(e);
        }
    }

    private static long orderCode(PaymentTransaction payment) {
        return Long.parseLong(payment.getTransactionCode().substring(PAYOS_PREFIX.length()));
    }

    private static boolean isAwaitingPayment(Subscription subscription, PaymentTransaction payment) {
        return payment != null && payment.getPaymentStatus() == TransactionStatus.PENDING
                && subscription.getStatus() == SubscriptionStatus.PENDING_PAYMENT;
    }

    private PaymentTransaction onlinePayment(Subscription subscription) {
        return payments.findBySubscriptionIdAndPaymentMethod(subscription.getId(), PaymentMethod.PAYOS).orElse(null);
    }

    private Subscription lockOwnedSubscription(UUID id, String ownerEmail) {
        return subscriptionRepository.findByIdWithLock(id)
                .filter(s -> ownerEmail == null || s.getProvider().getEmail().equalsIgnoreCase(ownerEmail))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gói bán hàng."));
    }

    private ResponseStatusException gatewayUnavailable(Exception e) {
        if (e != null) log.warn("payOS subscription payment request failed: {}", e.getClass().getSimpleName());
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Chưa xác minh được giao dịch với payOS. Vui lòng thử lại.");
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
            if (onlinePayment(subscription) != null) {
                throw new IllegalStateException("Gói thanh toán qua payOS được kích hoạt khi giao dịch được xác minh.");
            }

            // Validate dates
            LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now(BUSINESS_ZONE);
            LocalDate endDate = request.getEndDate();

            if (endDate.isBefore(startDate)) {
                throw new IllegalArgumentException("End date cannot be before start date");
            }

            // Set activation dates
            subscription.setStartDate(startDate);
            subscription.setEndDate(endDate);
            replaceActiveSubscription(subscription);

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

    private void replaceActiveSubscription(Subscription subscription) {
        subscriptionRepository.findByProviderIdOrderByCreatedAtDesc(subscription.getProvider().getId()).stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE && !s.getId().equals(subscription.getId()))
                .forEach(s -> s.transitionStatus(SubscriptionStatus.EXPIRED));
        subscription.transitionStatus(SubscriptionStatus.ACTIVE);
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
        Subscription subscription = lockOwnedSubscription(subscriptionId, ownerEmail);
        PaymentTransaction payment = onlinePayment(subscription);
        if (subscription.getStatus() == SubscriptionStatus.PENDING_PAYMENT) {
            if (payment == null) {
                subscription.transitionStatus(SubscriptionStatus.CANCELLED);
            } else {
                PaymentLink link = findGatewayLink(payment);
                if (link == null && payment.getCheckoutUrl() == null) {
                    closeUnpaid(subscription, payment, SubscriptionStatus.CANCELLED);
                } else if (link == null) {
                    throw gatewayUnavailable(null);
                } else {
                    reconcile(subscription, payment, link);
                    if (isAwaitingPayment(subscription, payment) && subscription.getPaymentNote() == null
                            && link.getStatus() == PaymentLinkStatus.PENDING) {
                        try {
                            reconcile(subscription, payment, gateway.cancel(orderCode(payment)));
                        } catch (PayOSException e) {
                            // A transfer can settle while the request to cancel is in flight.
                            reconcile(subscription, payment, findGatewayLink(payment));
                            if (isAwaitingPayment(subscription, payment) && subscription.getPaymentNote() == null) {
                                throw gatewayUnavailable(e);
                            }
                        }
                    }
                }
            }
        } else if (ownerEmail == null && subscription.getStatus() == SubscriptionStatus.ACTIVE) {
            subscription.transitionStatus(SubscriptionStatus.SUSPENDED);
        } else if (subscription.getStatus() != SubscriptionStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ có thể hủy yêu cầu đang chờ thanh toán.");
        }
        return mapToResponse(subscription, payment);
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
                    .filter(s -> {
                        LocalDate today = LocalDate.now(BUSINESS_ZONE);
                        return !today.isBefore(s.getStartDate()) && !today.isAfter(s.getEndDate());
                    })
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

            boolean hasActive = subscriptionRepository.hasActiveSubscription(provider.getId(), LocalDate.now(BUSINESS_ZONE));
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
            return mapHistory(subscriptions);
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
        return mapHistory(subscriptionRepository.findByProviderIdOrderByCreatedAtDesc(provider.getId()));
    }

    private SubscriptionResponse mapToResponse(Subscription subscription) {
        return mapToResponse(subscription, onlinePayment(subscription));
    }

    private List<SubscriptionResponse> mapHistory(List<Subscription> subscriptions) {
        if (subscriptions.isEmpty()) return List.of();
        var ids = subscriptions.stream().map(Subscription::getId).toList();
        var online = payments.findBySubscriptionIdInAndPaymentMethod(ids, PaymentMethod.PAYOS).stream()
                .collect(Collectors.toMap(p -> p.getSubscription().getId(), Function.identity()));
        return subscriptions.stream().map(s -> mapToResponse(s, online.get(s.getId()))).toList();
    }

    private SubscriptionResponse mapToResponse(Subscription subscription, PaymentTransaction payment) {
        boolean canPay = isAwaitingPayment(subscription, payment) && subscription.getPaymentNote() == null;
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
                .paymentCode(payment == null ? null : payment.getTransactionCode())
                .paymentStatus(payment == null ? null : payment.getPaymentStatus())
                .paidAt(payment == null ? null : payment.getPaidAt())
                .checkoutUrl(canPay ? payment.getCheckoutUrl() : null)
                .qrPayload(canPay ? payment.getQrPayload() : null)
                .build();
    }
}
