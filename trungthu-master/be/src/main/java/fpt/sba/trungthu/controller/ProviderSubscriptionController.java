package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.request.CreateSubscriptionRequest;
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
    @Operation(summary = "Create subscription request")
    public ResponseEntity<ApiResponseDTO<SubscriptionResponse>> createSubscription(
            @Valid @RequestBody CreateSubscriptionRequest request) {
        
        log.info("Provider creating subscription request");
        
        try {
            String providerEmail = getCurrentUserEmail();
            SubscriptionResponse response = subscriptionService.createSubscription(providerEmail, request);
            
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponseDTO.success("Subscription request created successfully", response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid subscription request", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseDTO.error(HttpStatus.BAD_REQUEST, e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating subscription", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create subscription: " + e.getMessage()));
        }
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
        
        log.info("Provider cancelling subscription: {}", subscriptionId);
        
        try {
            SubscriptionResponse response = subscriptionService.cancelSubscription(subscriptionId);
            
            return ResponseEntity.ok(ApiResponseDTO.success("Subscription cancelled successfully", response));
        } catch (IllegalStateException e) {
            log.error("Invalid cancellation request", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseDTO.error(HttpStatus.BAD_REQUEST, e.getMessage()));
        } catch (Exception e) {
            log.error("Error cancelling subscription", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to cancel subscription: " + e.getMessage()));
        }
    }
}
