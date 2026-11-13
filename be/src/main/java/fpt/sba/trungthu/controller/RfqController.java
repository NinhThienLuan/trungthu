package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.AcceptQuotesRequest;
import fpt.sba.trungthu.dto.request.CreateRfqRequest;
import fpt.sba.trungthu.dto.request.SubmitQuoteRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.QuoteResponse;
import fpt.sba.trungthu.dto.response.RfqResponse;
import fpt.sba.trungthu.service.RfqService;
import fpt.sba.trungthu.service.RfqDeliveryEstimator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class RfqController {
    private final RfqService rfqService;
    private final RfqDeliveryEstimator deliveryEstimator;

    @GetMapping("/api/rfqs/earliest-delivery")
    public ResponseEntity<ApiResponseDTO<RfqDeliveryEstimator.Estimate>> earliestDelivery(
            @RequestParam @Min(20) int boxes, @RequestParam @Min(1) @Max(100) int cakesPerBox,
            @RequestParam(required = false) UUID providerId) {
        return ResponseEntity.ok(ApiResponseDTO.success(deliveryEstimator.estimate(boxes, cakesPerBox, providerId)));
    }

    @PostMapping("/api/rfqs")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<RfqResponse>> create(@Valid @RequestBody CreateRfqRequest input) {
        return ResponseEntity.ok(ApiResponseDTO.success(rfqService.create(input)));
    }

    @GetMapping("/api/rfqs/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<List<RfqResponse>>> mine() {
        return ResponseEntity.ok(ApiResponseDTO.success(rfqService.mine()));
    }

    @GetMapping("/api/provider/rfqs")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<List<RfqResponse>>> providerFeed() {
        return ResponseEntity.ok(ApiResponseDTO.success(rfqService.providerFeed()));
    }

    @GetMapping("/api/provider/rfqs/quotes/me")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<List<QuoteResponse>>> providerQuotes() {
        return ResponseEntity.ok(ApiResponseDTO.success(rfqService.providerQuotes()));
    }

    @PostMapping("/api/provider/rfqs/{requestId}/quotes")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<QuoteResponse>> submitQuote(@PathVariable UUID requestId,
            @Valid @RequestBody SubmitQuoteRequest input) {
        return ResponseEntity.ok(ApiResponseDTO.success(rfqService.submitQuote(requestId, input)));
    }

    @PutMapping("/api/provider/rfqs/{requestId}/quotes/{quoteId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<QuoteResponse>> reviseQuote(@PathVariable UUID requestId,
            @PathVariable UUID quoteId, @Valid @RequestBody SubmitQuoteRequest input) {
        return ResponseEntity.ok(ApiResponseDTO.success(rfqService.reviseQuote(requestId, quoteId, input)));
    }

    @GetMapping("/api/rfqs/{requestId}/quotes")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<List<QuoteResponse>>> quotes(@PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponseDTO.success(rfqService.quotes(requestId)));
    }

    @PostMapping("/api/rfqs/{requestId}/quotes/{quoteId}/accept")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<QuoteResponse>> acceptQuote(@PathVariable UUID requestId,
            @PathVariable UUID quoteId) {
        return ResponseEntity.ok(ApiResponseDTO.success(rfqService.acceptQuote(requestId, quoteId)));
    }

    /** Chia RFQ cho nhiều xưởng: mỗi xưởng một đơn sỉ con với số hộp khách chọn */
    @PostMapping("/api/rfqs/{requestId}/accept")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<List<QuoteResponse>>> acceptQuotes(@PathVariable UUID requestId,
            @Valid @RequestBody AcceptQuotesRequest input) {
        return ResponseEntity.ok(ApiResponseDTO.success(rfqService.acceptQuotes(requestId, input.items())));
    }

    /** Mở RFQ mới cho phần hộp đơn tổng còn thiếu */
    @PostMapping("/api/rfqs/{requestId}/shortfall")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<RfqResponse>> reorderShortfall(@PathVariable UUID requestId) {
        return ResponseEntity.ok(ApiResponseDTO.success(rfqService.reorderShortfall(requestId)));
    }
}
