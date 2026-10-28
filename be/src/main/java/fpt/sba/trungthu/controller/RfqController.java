package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.CreateRfqRequest;
import fpt.sba.trungthu.dto.request.SubmitQuoteRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.QuoteResponse;
import fpt.sba.trungthu.dto.response.RfqResponse;
import fpt.sba.trungthu.service.RfqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class RfqController {
    private final RfqService rfqService;

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
}
