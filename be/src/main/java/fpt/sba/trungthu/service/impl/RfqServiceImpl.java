package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.CreateRfqRequest;
import fpt.sba.trungthu.dto.request.SubmitQuoteRequest;
import fpt.sba.trungthu.dto.response.QuoteResponse;
import fpt.sba.trungthu.dto.response.RfqResponse;
import fpt.sba.trungthu.entity.BulkRequest;
import fpt.sba.trungthu.entity.ProviderQuotation;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.BulkRequestStatus;
import fpt.sba.trungthu.entity.enumeration.QuoteStatus;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.BulkRequestRepository;
import fpt.sba.trungthu.repository.ProviderQuotationRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.service.RfqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class RfqServiceImpl implements RfqService {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");

    private final SecurityContextService security;
    private final BulkRequestRepository requests;
    private final ProviderQuotationRepository quotations;
    private final SubscriptionRepository subscriptions;

    @Override
    @Transactional
    public RfqResponse create(CreateRfqRequest input) {
        User customer = security.getCurrentUser();
        LocalDate today = LocalDate.now(VIETNAM);
        String companyName = input.companyName().trim();
        if (companyName.length() < 3) {
            throw badRequest("Tên doanh nghiệp phải có ít nhất 3 ký tự");
        }
        if (input.expectedDeliveryDate().isBefore(today.plusDays(3))) {
            throw badRequest("Ngày nhận hàng phải cách ít nhất 3 ngày");
        }
        String prefix = "RFQ-" + today.format(DateTimeFormatter.BASIC_ISO_DATE) + "-";
        String code = null;
        for (int i = 0; i < 100; i++) {
            String candidate = prefix + String.format("%04d", ThreadLocalRandom.current().nextInt(10_000));
            if (!requests.existsByRequestCode(candidate)) { code = candidate; break; }
        }
        if (code == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "Không tạo được mã RFQ");
        BulkRequest request = requests.saveAndFlush(BulkRequest.builder().customer(customer).requestCode(code)
                .companyName(companyName).taxCode(input.taxCode().trim())
                .contactName(input.contactName().trim()).contactPosition(input.contactPosition().trim())
                .contactPhone(input.contactPhone().trim()).contactEmail(input.contactEmail().trim())
                .requestedQuantity(input.requestedQuantity()).expectedDate(input.expectedDeliveryDate())
                .expectedBudget(input.expectedBudget()).description(input.description()).logoUrl(input.logoUrl())
                .status(BulkRequestStatus.DISTRIBUTED).build());
        return toRfqResponse(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RfqResponse> mine() {
        return requests.findTop100ByCustomerIdOrderByCreatedAtDesc(security.getCurrentUserId())
                .stream().map(this::toRfqResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RfqResponse> providerFeed() {
        User provider = requireEligibleProvider();
        Map<UUID, RfqResponse> feed = new LinkedHashMap<>();
        requests.findTop100ByStatusInOrderByCreatedAtDesc(
                List.of(BulkRequestStatus.DISTRIBUTED, BulkRequestStatus.QUOTES_RECEIVED))
                .forEach(request -> feed.put(request.getId(), toProviderRfqResponse(request)));
        quotations.findTop100ByProviderIdOrderByCreatedAtDesc(provider.getId()).stream()
                .filter(quote -> quote.getStatus() == QuoteStatus.ACCEPTED)
                .forEach(quote -> feed.put(quote.getRequest().getId(), toRfqResponse(quote.getRequest())));
        return List.copyOf(feed.values());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponse> providerQuotes() {
        User provider = requireEligibleProvider();
        return quotations.findTop100ByProviderIdOrderByCreatedAtDesc(provider.getId())
                .stream().map(this::toQuoteResponse).toList();
    }

    @Override
    @Transactional
    public QuoteResponse submitQuote(UUID requestId, SubmitQuoteRequest input) {
        User provider = requireEligibleProvider();
        BulkRequest request = requests.findForUpdateById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy RFQ"));
        if (request.getStatus() != BulkRequestStatus.DISTRIBUTED
                && request.getStatus() != BulkRequestStatus.QUOTES_RECEIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "RFQ đã đóng");
        }
        if (quotations.existsByRequestIdAndProviderId(requestId, provider.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Xưởng đã gửi báo giá cho RFQ này");
        }
        LocalDate today = LocalDate.now(VIETNAM);
        if (input.validUntil().isBefore(today) || input.estimatedDeliveryDate().isBefore(today)) {
            throw badRequest("Ngày hiệu lực và ngày giao dự kiến không được ở quá khứ");
        }
        if (input.offeredQuantity() < request.getRequestedQuantity()) {
            throw badRequest("Số lượng chào giá phải đáp ứng yêu cầu của khách");
        }
        ProviderQuotation quote = quotations.saveAndFlush(ProviderQuotation.builder()
                .request(request).provider(provider).quotedPrice(input.unitPrice())
                .offeredQuantity(input.offeredQuantity()).estimatedDeliveryDate(input.estimatedDeliveryDate())
                .validUntil(input.validUntil()).note(input.note()).status(QuoteStatus.SUBMITTED).build());
        if (request.getStatus() == BulkRequestStatus.DISTRIBUTED) {
            request.transitionStatus(BulkRequestStatus.QUOTES_RECEIVED);
        }
        return toQuoteResponse(quote);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponse> quotes(UUID requestId) {
        BulkRequest request = requireOwnedRequest(requestId);
        return quotations.findByRequestIdOrderByQuotedPriceAsc(request.getId())
                .stream().map(this::toQuoteResponse).toList();
    }

    @Override
    @Transactional
    public QuoteResponse acceptQuote(UUID requestId, UUID quoteId) {
        BulkRequest request = requests.findForUpdateById(requestId)
                .filter(item -> item.getCustomer().getId().equals(security.getCurrentUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy RFQ"));
        if (request.getStatus() != BulkRequestStatus.QUOTES_RECEIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "RFQ chưa thể chốt báo giá");
        }
        ProviderQuotation selected = quotations.findById(quoteId)
                .filter(quote -> quote.getRequest().getId().equals(requestId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo giá"));
        if (selected.getStatus() != QuoteStatus.SUBMITTED
                || selected.getValidUntil() != null && selected.getValidUntil().isBefore(LocalDate.now(VIETNAM))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Báo giá đã hết hiệu lực");
        }
        selected.transitionStatus(QuoteStatus.ACCEPTED);
        for (ProviderQuotation quote : quotations.findByRequestIdOrderByQuotedPriceAsc(requestId)) {
            if (!quote.getId().equals(quoteId) && quote.getStatus() == QuoteStatus.SUBMITTED) {
                quote.transitionStatus(QuoteStatus.REJECTED);
            }
        }
        request.transitionStatus(BulkRequestStatus.WON);
        return toQuoteResponse(selected);
    }

    private BulkRequest requireOwnedRequest(UUID requestId) {
        return requests.findById(requestId)
                .filter(request -> request.getCustomer().getId().equals(security.getCurrentUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy RFQ"));
    }

    private User requireEligibleProvider() {
        User provider = security.getCurrentUser();
        LocalDate today = LocalDate.now(VIETNAM);
        if (provider.getStatus() != UserStatus.ACTIVE || !Boolean.TRUE.equals(provider.getIsComplianceApproved())
                || !Boolean.TRUE.equals(provider.getIsSeasonActive())
                || !subscriptions.existsByProviderIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        provider.getId(), SubscriptionStatus.ACTIVE, today, today)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Xưởng chưa đủ điều kiện nhận RFQ");
        }
        return provider;
    }

    private RfqResponse toRfqResponse(BulkRequest request) {
        return new RfqResponse(request.getId(), request.getRequestCode(), request.getCompanyName(),
                request.getTaxCode(), request.getContactName(), request.getContactPosition(),
                request.getContactPhone(), request.getContactEmail(), request.getRequestedQuantity(),
                request.getExpectedDate(), request.getExpectedBudget(), request.getDescription(),
                request.getLogoUrl(), request.getStatus());
    }

    private RfqResponse toProviderRfqResponse(BulkRequest request) {
        return new RfqResponse(request.getId(), request.getRequestCode(), "Khách doanh nghiệp",
                null, null, null, null, null, request.getRequestedQuantity(),
                request.getExpectedDate(), request.getExpectedBudget(), request.getDescription(),
                request.getLogoUrl(), request.getStatus());
    }

    private QuoteResponse toQuoteResponse(ProviderQuotation quote) {
        return new QuoteResponse(quote.getId(), quote.getRequest().getId(), quote.getProvider().getId(),
                quote.getProvider().getStoreName(), quote.getQuotedPrice(), quote.getOfferedQuantity(),
                quote.getEstimatedDeliveryDate(), quote.getValidUntil(), quote.getNote(),
                quote.getStatus(), quote.getCreatedAt());
    }

    private ResponseStatusException badRequest(String reason) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
    }
}
