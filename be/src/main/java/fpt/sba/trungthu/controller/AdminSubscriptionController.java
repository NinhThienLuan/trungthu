package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.request.ActivateSubscriptionRequest;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.SubscriptionResponse;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/subscriptions")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Admin Subscription", description = "Admin subscription management")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class AdminSubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    @Operation(summary = "List subscriptions with pagination and an optional status filter")
    public ApiResponseDTO<PageResponse<SubscriptionResponse>> listSubscriptions(
            @RequestParam(required = false) SubscriptionStatus status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return ApiResponseDTO.success(subscriptionService.getSubscriptionsPage(status, page, size));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get subscriptions by status")
    public ResponseEntity<ApiResponseDTO<List<SubscriptionResponse>>> getSubscriptionsByStatus(
            @PathVariable SubscriptionStatus status) {
        
        log.info("Admin getting subscriptions with status: {}", status);
        
        try {
            List<SubscriptionResponse> subscriptions = subscriptionService
                    .getAllSubscriptionsByStatus(status);
            
            return ResponseEntity.ok(ApiResponseDTO.success("Subscriptions retrieved successfully", subscriptions));
        } catch (Exception e) {
            log.error("Error getting subscriptions by status", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve subscriptions: " + e.getMessage()));
        }
    }

    @PutMapping("/{subscriptionId}/activate")
    @Operation(summary = "Activate subscription")
    public ResponseEntity<ApiResponseDTO<SubscriptionResponse>> activateSubscription(
            @PathVariable UUID subscriptionId,
            @Valid @RequestBody(required = false) ActivateSubscriptionRequest request) {
        
        log.info("Admin activating subscription: {}", subscriptionId);
        
        try {
            if (request == null) {
                request = new ActivateSubscriptionRequest();
            }
            
            SubscriptionResponse response = subscriptionService
                    .activateSubscription(subscriptionId, request);
            
            return ResponseEntity.ok(ApiResponseDTO.success("Subscription activated successfully", response));
        } catch (IllegalStateException e) {
            log.error("Invalid activation request", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseDTO.error(HttpStatus.BAD_REQUEST, e.getMessage()));
        } catch (Exception e) {
            log.error("Error activating subscription", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to activate subscription: " + e.getMessage()));
        }
    }

    @PutMapping("/{subscriptionId}/expire")
    @Operation(summary = "Expire subscription")
    public ResponseEntity<ApiResponseDTO<SubscriptionResponse>> expireSubscription(
            @PathVariable UUID subscriptionId) {
        
        log.info("Admin expiring subscription: {}", subscriptionId);
        
        try {
            SubscriptionResponse response = subscriptionService.expireSubscription(subscriptionId);
            
            return ResponseEntity.ok(ApiResponseDTO.success("Subscription expired successfully", response));
        } catch (IllegalStateException e) {
            log.error("Invalid expiration request", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponseDTO.error(HttpStatus.BAD_REQUEST, e.getMessage()));
        } catch (Exception e) {
            log.error("Error expiring subscription", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to expire subscription: " + e.getMessage()));
        }
    }

    @PutMapping("/{subscriptionId}/cancel")
    @Operation(summary = "Cancel subscription")
    public ResponseEntity<ApiResponseDTO<SubscriptionResponse>> cancelSubscription(
            @PathVariable UUID subscriptionId) {
        
        log.info("Admin cancelling subscription: {}", subscriptionId);
        
        try {
            SubscriptionResponse response = subscriptionService.cancelSubscription(subscriptionId, null);
            
            return ResponseEntity.ok(ApiResponseDTO.success("Subscription cancelled successfully", response));
        } catch (ResponseStatusException e) {
            throw e;
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
