package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.request.CreateSubscriptionRequest;
import fpt.sba.trungthu.entity.enumeration.SubscriptionPlan;
import fpt.sba.trungthu.dto.response.SubscriptionResponse;
import fpt.sba.trungthu.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/provider/subscriptions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Provider Subscription", description = "Provider subscription management")
@PreAuthorize("hasRole('PROVIDER')")
public class ProviderSubscriptionController {

    private final SubscriptionService subscriptionService;
    private final SecurityContextService securityContextService;

    private String getCurrentUserEmail() {
        return securityContextService.getCurrentUser().getEmail();
    }

    @PostMapping
    @Operation(summary = "Reserve a subscription payment")
    public ResponseEntity<ApiResponseDTO<SubscriptionResponse>> createSubscription(
            @Valid @RequestBody CreateSubscriptionRequest request) {
        return ResponseEntity.ok(ApiResponseDTO.success(subscriptionService.createSubscription(getCurrentUserEmail(), request)));
    }

    @PostMapping("/{subscriptionId}/checkout")
    public ResponseEntity<ApiResponseDTO<SubscriptionResponse>> openCheckout(@PathVariable UUID subscriptionId) {
        return ResponseEntity.ok(ApiResponseDTO.success(subscriptionService.openCheckout(subscriptionId, getCurrentUserEmail())));
    }

    @PostMapping("/{subscriptionId}/payment/refresh")
    public ResponseEntity<ApiResponseDTO<SubscriptionResponse>> refreshPayment(@PathVariable UUID subscriptionId) {
        return ResponseEntity.ok(ApiResponseDTO.success(subscriptionService.refreshPayment(subscriptionId, getCurrentUserEmail())));
    }

    public record PlanView(SubscriptionPlan code, String name, java.math.BigDecimal price, int maxProducts) {}

    /** Bảng giá gói của sàn (seller chọn một mã gói khi đăng ký) */
    @GetMapping("/plans")
    public ResponseEntity<ApiResponseDTO<List<PlanView>>> plans() {
        return ResponseEntity.ok(ApiResponseDTO.success(java.util.Arrays.stream(SubscriptionPlan.values())
                .map(p -> new PlanView(p, p.label(), p.price(), p.maxProducts())).toList()));
    }

    /** Mọi gói của tôi (đang chờ, đang chạy, đã hết hạn), mới nhất trước */
    @GetMapping
    public ResponseEntity<ApiResponseDTO<List<SubscriptionResponse>>> mine() {
        return ResponseEntity.ok(ApiResponseDTO.success(subscriptionService.mySubscriptions(getCurrentUserEmail())));
    }

    @GetMapping("/active")
    @Operation(summary = "Get my active subscription")
    public ResponseEntity<ApiResponseDTO<SubscriptionResponse>> getActiveSubscription() {
        log.info("Provider getting active subscription");
        
        try {
            String providerEmail = getCurrentUserEmail();
            SubscriptionResponse subscription = subscriptionService.getActiveSubscription(providerEmail);
            
            return ResponseEntity.ok(ApiResponseDTO.success("Active subscription retrieved successfully", subscription));
        } catch (IllegalArgumentException e) {
            log.error("No active subscription found", e);
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseDTO.error(HttpStatus.NOT_FOUND, e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting active subscription", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve subscription: " + e.getMessage()));
        }
    }

    @GetMapping("/status")
    @Operation(summary = "Check if I have active subscription")
    public ResponseEntity<ApiResponseDTO<Boolean>> checkSubscriptionStatus() {
        log.info("Provider checking subscription status");
        
        try {
            String providerEmail = getCurrentUserEmail();
            boolean hasActive = subscriptionService.hasActiveSubscription(providerEmail);
            
            return ResponseEntity.ok(ApiResponseDTO.success("Subscription status checked", hasActive));
        } catch (Exception e) {
            log.error("Error checking subscription status", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to check status: " + e.getMessage()));
        }
    }

    @PutMapping("/{subscriptionId}/cancel")
    @Operation(summary = "Cancel subscription")
    public ResponseEntity<ApiResponseDTO<SubscriptionResponse>> cancelSubscription(
            @PathVariable UUID subscriptionId) {
        return ResponseEntity.ok(ApiResponseDTO.success(subscriptionService.cancelSubscription(subscriptionId, getCurrentUserEmail())));
    }
}
