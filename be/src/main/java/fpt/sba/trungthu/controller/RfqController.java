package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.CreateRfqRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.RfqResponse;
import fpt.sba.trungthu.entity.BulkRequest;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.*;
import fpt.sba.trungthu.repository.BulkRequestRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequiredArgsConstructor
public class RfqController {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private final SecurityContextService security;
    private final BulkRequestRepository requests;
    private final SubscriptionRepository subscriptions;

    @PostMapping("/api/rfqs")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<RfqResponse>> create(@Valid @RequestBody CreateRfqRequest input) {
        User customer = security.getCurrentUser();
        LocalDate today = LocalDate.now(VIETNAM);
        if (input.expectedDeliveryDate().isBefore(today.plusDays(3))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery date must be at least 3 days ahead");
        }
        String prefix = "RFQ-" + today.format(DateTimeFormatter.BASIC_ISO_DATE) + "-";
        String code = null;
        for (int i = 0; i < 100; i++) {
            String candidate = prefix + String.format("%04d", ThreadLocalRandom.current().nextInt(10_000));
            if (!requests.existsByRequestCode(candidate)) { code = candidate; break; }
        }
        if (code == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "No RFQ code available");
        BulkRequest request = requests.saveAndFlush(BulkRequest.builder().customer(customer).requestCode(code)
                .companyName(input.companyName().trim()).taxCode(input.taxCode().trim())
                .contactName(input.contactName().trim()).contactPosition(input.contactPosition().trim())
                .contactPhone(input.contactPhone().trim()).contactEmail(input.contactEmail().trim())
                .requestedQuantity(input.requestedQuantity()).expectedDate(input.expectedDeliveryDate())
                .expectedBudget(input.expectedBudget()).description(input.description()).logoUrl(input.logoUrl())
                .status(BulkRequestStatus.DISTRIBUTED).build());
        return ResponseEntity.ok(ApiResponseDTO.success(toResponse(request)));
    }

    @GetMapping("/api/rfqs/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<RfqResponse>>> mine() {
        return ResponseEntity.ok(ApiResponseDTO.success(requests
                .findTop100ByCustomerIdOrderByCreatedAtDesc(security.getCurrentUserId())
                .stream().map(this::toResponse).toList()));
    }

    @GetMapping("/api/provider/rfqs")
    @PreAuthorize("hasRole('PROVIDER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<RfqResponse>>> providerFeed() {
        User provider = security.getCurrentUser();
        LocalDate today = LocalDate.now(VIETNAM);
        if (provider.getStatus() != UserStatus.ACTIVE || !Boolean.TRUE.equals(provider.getIsComplianceApproved())
                || !Boolean.TRUE.equals(provider.getIsSeasonActive())
                || !subscriptions.existsByProviderIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        provider.getId(), SubscriptionStatus.ACTIVE, today, today)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Provider is not eligible for RFQs");
        }
        return ResponseEntity.ok(ApiResponseDTO.success(requests
                .findTop100ByStatusOrderByCreatedAtDesc(BulkRequestStatus.DISTRIBUTED)
                .stream().map(this::toResponse).toList()));
    }

    private RfqResponse toResponse(BulkRequest request) {
        return new RfqResponse(request.getId(), request.getRequestCode(), request.getCompanyName(),
                request.getTaxCode(), request.getContactName(), request.getContactPosition(),
                request.getContactPhone(), request.getContactEmail(), request.getRequestedQuantity(),
                request.getExpectedDate(), request.getExpectedBudget(), request.getDescription(),
                request.getLogoUrl(), request.getStatus());
    }
}
