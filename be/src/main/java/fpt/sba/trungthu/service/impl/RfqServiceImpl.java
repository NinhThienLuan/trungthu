package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.dto.request.VnFormats;
import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.AcceptQuotesRequest;
import fpt.sba.trungthu.dto.request.CreateRfqRequest;
import fpt.sba.trungthu.dto.request.SubmitQuoteRequest;
import fpt.sba.trungthu.dto.response.QuoteResponse;
import fpt.sba.trungthu.dto.response.RfqResponse;
import fpt.sba.trungthu.entity.BulkOrder;
import fpt.sba.trungthu.entity.BulkRequest;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProviderQuotation;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.BulkOrderStatus;
import fpt.sba.trungthu.entity.enumeration.BulkRequestStatus;
import fpt.sba.trungthu.entity.enumeration.QuoteStatus;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.BulkOrderRepository;
import fpt.sba.trungthu.repository.BulkRequestRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProviderQuotationRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.RfqService;
import fpt.sba.trungthu.service.RfqDeliveryEstimator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class RfqServiceImpl implements RfqService {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");

    private final SecurityContextService security;
    private final BulkRequestRepository requests;
    private final ProviderQuotationRepository quotations;
    private final SubscriptionRepository subscriptions;
    private final UserRepository users;
    private final ProductRepository products;
    private final BulkOrderService bulkOrders;
    private final BulkOrderRepository bulkOrderRepository;
    private final RfqDeliveryEstimator deliveryEstimator;

    @Override
    @Transactional
    public RfqResponse create(CreateRfqRequest input) {
        User customer = security.getCurrentUser();
        LocalDate today = LocalDate.now(VIETNAM);
        boolean isBusiness = "BUSINESS".equalsIgnoreCase(input.customerType())
                || (input.taxCode() != null && !input.taxCode().isBlank());
        String companyName = input.companyName() == null ? null : input.companyName().trim();
        String taxCode = input.taxCode() == null ? null : input.taxCode().trim();
        String contactPosition = input.contactPosition() == null ? null : input.contactPosition().trim();

        if (isBusiness) {
            if (companyName == null || companyName.length() < 3) {
                throw badRequest("Tên doanh nghiệp phải có ít nhất 3 ký tự");
            }
            if (taxCode == null || !taxCode.matches(VnFormats.TAX_CODE)) {
                throw badRequest(VnFormats.TAX_CODE_MESSAGE);
            }
            if (contactPosition == null || contactPosition.isBlank()) {
                throw badRequest("Chức vụ người liên hệ không được để trống");
            }
        } else {
            if (companyName == null || companyName.isBlank()) {
                companyName = "Khách cá nhân (" + input.contactName().trim() + ")";
            }
            if (contactPosition == null || contactPosition.isBlank()) {
                contactPosition = "Khách hàng cá nhân";
            }
            taxCode = null;
        }
        // Chọn sản phẩm thì gửi cho xưởng của sản phẩm đó; chọn cả hai thì sản phẩm phải thuộc xưởng đã chọn
        // Hàng sỉ xưởng nướng theo đơn: sản phẩm đang hiện công khai (kể cả hết tồn bán lẻ) đều nhận RFQ
        Product product = input.productId() == null ? null : products.findPublicById(input.productId())
                .orElseThrow(() -> badRequest("Sản phẩm không tồn tại hoặc đã ngừng bán"));
        User target = input.providerId() == null ? null : users.findById(input.providerId())
                .filter(user -> user.getRole() == UserRole.PROVIDER && user.getStatus() == UserStatus.ACTIVE)
                .orElseThrow(() -> badRequest("Xưởng không tồn tại hoặc đã ngừng hoạt động"));
        if (product != null) {
            if (target != null && !target.getId().equals(product.getProvider().getId())) {
                throw badRequest("Sản phẩm không thuộc xưởng đã chọn");
            }
            target = product.getProvider();
        }
        int cakesPerBox = input.cakesPerBox() == null ? 1 : input.cakesPerBox();
        LocalDate earliest = deliveryEstimator.estimate(input.requestedQuantity(), cakesPerBox,
                target == null ? null : target.getId()).earliestDeliveryDate();
        if (input.expectedDeliveryDate().isBefore(earliest)) {
            throw badRequest("Ngày nhận sớm nhất theo suất nướng hiện tại là " + earliest);
        }
        String prefix = "RFQ-" + today.format(DateTimeFormatter.BASIC_ISO_DATE) + "-";
        String code = null;
        for (int i = 0; i < 100; i++) {
            String candidate = prefix + String.format("%04d", ThreadLocalRandom.current().nextInt(10_000));
            if (!requests.existsByRequestCode(candidate)) { code = candidate; break; }
        }
        if (code == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "Không tạo được mã RFQ");
        BulkRequest request = requests.saveAndFlush(BulkRequest.builder().customer(customer).requestCode(code)
                .companyName(companyName).taxCode(taxCode)
                .contactName(input.contactName().trim()).contactPosition(contactPosition)
                .contactPhone(input.contactPhone().trim()).contactEmail(input.contactEmail().trim())
                .requestedQuantity(input.requestedQuantity()).cakesPerBox(cakesPerBox)
                .expectedDate(input.expectedDeliveryDate())
                .expectedBudget(input.expectedBudget()).description(input.description()).logoUrl(input.logoUrl())
                .targetProvider(target).product(product)
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
                .stream().filter(request -> visibleTo(request, provider))
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
        if (!visibleTo(request, provider)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy RFQ");
        }
        if (quotations.existsByRequestIdAndProviderId(requestId, provider.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Xưởng đã gửi báo giá cho RFQ này");
        }
        validateQuote(request, input, provider.getId());
        ProviderQuotation quote = quotations.saveAndFlush(ProviderQuotation.builder()
                .request(request).provider(provider).quotedPrice(input.unitPrice())
                .offeredQuantity(input.offeredQuantity()).cakesPerBox(input.cakesPerBox())
                .estimatedDeliveryDate(input.estimatedDeliveryDate())
                .validUntil(input.validUntil()).note(input.note()).status(QuoteStatus.SUBMITTED).build());
        if (request.getStatus() == BulkRequestStatus.DISTRIBUTED) {
            request.transitionStatus(BulkRequestStatus.QUOTES_RECEIVED);
        }
        return toQuoteResponse(quote);
    }

    @Override
    @Transactional
    public QuoteResponse reviseQuote(UUID requestId, UUID quoteId, SubmitQuoteRequest input) {
        User provider = requireEligibleProvider();
        BulkRequest request = requests.findForUpdateById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy RFQ"));
        ProviderQuotation quote = quotations.findById(quoteId)
                .filter(item -> item.getRequest().getId().equals(requestId)
                        && item.getProvider().getId().equals(provider.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo giá"));
        if (request.getStatus() != BulkRequestStatus.QUOTES_RECEIVED || quote.getStatus() != QuoteStatus.SUBMITTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Báo giá đã chốt, không thể sửa");
        }
        validateQuote(request, input, provider.getId());
        quote.setQuotedPrice(input.unitPrice());
        quote.setOfferedQuantity(input.offeredQuantity());
        quote.setCakesPerBox(input.cakesPerBox());
        quote.setEstimatedDeliveryDate(input.estimatedDeliveryDate());
        quote.setValidUntil(input.validUntil());
        quote.setNote(input.note());
        return toQuoteResponse(quote);
    }

    private void validateQuote(BulkRequest request, SubmitQuoteRequest input, UUID providerId) {
        LocalDate today = LocalDate.now(VIETNAM);
        if (!input.cakesPerBox().equals(request.getCakesPerBox())) {
            throw badRequest("Số bánh mỗi hộp phải đúng với yêu cầu báo giá");
        }
        if (input.validUntil().isBefore(today) || input.estimatedDeliveryDate().isBefore(today)) {
            throw badRequest("Ngày hiệu lực và ngày giao dự kiến không được ở quá khứ");
        }
        if (!input.validUntil().isAfter(input.estimatedDeliveryDate())) {
            throw badRequest("Ngày hết hiệu lực báo giá phải sau ngày giao dự kiến");
        }
        BigDecimal gross = input.unitPrice().multiply(BigDecimal.valueOf(input.offeredQuantity()));
        if (gross.precision() - gross.scale() > 16) {
            throw badRequest("Tổng tiền vượt giới hạn hệ thống");
        }
        try {
            Math.multiplyExact(input.offeredQuantity(), input.cakesPerBox());
        } catch (ArithmeticException e) {
            throw badRequest("Số bánh vượt giới hạn hệ thống");
        }
        LocalDate earliest = deliveryEstimator.estimate(input.offeredQuantity(), input.cakesPerBox(),
                providerId).earliestDeliveryDate();
        if (input.estimatedDeliveryDate().isBefore(earliest)) {
            throw badRequest("Ngày giao sớm nhất theo suất nướng hiện tại là " + earliest);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponse> quotes(UUID requestId) {
        BulkRequest request = requireOwnedRequest(requestId);
        return quotations.findByRequestIdOrderByQuotedPriceAsc(request.getId())
                .stream().map(this::toQuoteResponse).toList();
    }

    /** Chốt trọn một xưởng với toàn bộ số hộp xưởng đó báo (luồng cũ, giữ cho tương thích) */
    @Override
    @Transactional
    public QuoteResponse acceptQuote(UUID requestId, UUID quoteId) {
        return acceptQuotes(requestId, List.of(new AcceptQuotesRequest.Item(quoteId, null))).get(0);
    }

    /**
     * Chia một RFQ (đơn tổng) cho nhiều xưởng: mỗi báo giá được chọn thành một đơn sỉ con với số hộp khách chọn.
     * Tất cả hoặc không: một xưởng thiếu suất nướng thì cả lần chốt bị huỷ, không để lại đơn lẻ.
     * {@code quantity} null = lấy hết số hộp xưởng báo.
     */
    @Override
    @Transactional
    public List<QuoteResponse> acceptQuotes(UUID requestId, List<AcceptQuotesRequest.Item> items) {
        BulkRequest request = requests.findForUpdateById(requestId)
                .filter(item -> item.getCustomer().getId().equals(security.getCurrentUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy RFQ"));
        if (request.getStatus() != BulkRequestStatus.QUOTES_RECEIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "RFQ chưa thể chốt báo giá");
        }
        if (items == null || items.isEmpty()) throw badRequest("Chọn ít nhất một xưởng");
        LocalDate today = LocalDate.now(VIETNAM);
        Map<UUID, Integer> boxes = new LinkedHashMap<>();
        List<ProviderQuotation> selected = new ArrayList<>();
        for (AcceptQuotesRequest.Item item : items) {
            if (boxes.containsKey(item.quoteId())) throw badRequest("Mỗi xưởng chỉ được chọn một lần");
            ProviderQuotation quote = quotations.findById(item.quoteId())
                    .filter(q -> q.getRequest().getId().equals(requestId))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo giá"));
            if (quote.getStatus() != QuoteStatus.SUBMITTED
                    || quote.getValidUntil() != null && quote.getValidUntil().isBefore(today)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Báo giá của " + quote.getProvider().getStoreName() + " đã hết hiệu lực");
            }
            int qty = item.quantity() == null ? quote.getOfferedQuantity() : item.quantity();
            if (qty < 1 || qty > quote.getOfferedQuantity()) {
                throw badRequest("Số hộp chọn của " + quote.getProvider().getStoreName()
                        + " phải từ 1 đến " + quote.getOfferedQuantity());
            }
            boxes.put(quote.getId(), qty);
            selected.add(quote);
        }
        // Giữ suất nướng theo thứ tự xưởng cố định: hai RFQ chốt cùng lúc không khoá chéo lịch của nhau
        selected.sort(Comparator.comparing(q -> q.getProvider().getId()));
        for (ProviderQuotation quote : selected) {
            bulkOrders.createForAcceptedQuote(quote, boxes.get(quote.getId()));
            quote.transitionStatus(QuoteStatus.ACCEPTED);
        }
        for (ProviderQuotation quote : quotations.findByRequestIdOrderByQuotedPriceAsc(requestId)) {
            if (!boxes.containsKey(quote.getId()) && quote.getStatus() == QuoteStatus.SUBMITTED) {
                quote.transitionStatus(QuoteStatus.REJECTED);
            }
        }
        request.transitionStatus(BulkRequestStatus.WON);
        return selected.stream().map(this::toQuoteResponse).toList();
    }

    /**
     * Đơn tổng còn thiếu hộp (chốt chưa đủ hoặc một đơn con bị huỷ): mở RFQ mới cho đúng phần thiếu,
     * gửi mọi xưởng, giữ thông tin liên hệ, logo và ngày nhận của RFQ gốc.
     */
    @Override
    @Transactional
    public RfqResponse reorderShortfall(UUID requestId) {
        BulkRequest original = requests.findForUpdateById(requestId)
                .filter(item -> item.getCustomer().getId().equals(security.getCurrentUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy RFQ"));
        if (original.getStatus() != BulkRequestStatus.WON) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "RFQ chưa chốt xưởng nào");
        }
        int shortfall = original.getRequestedQuantity() - allocatedBoxes(requestId);
        if (shortfall <= 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "Đơn tổng đã đủ số hộp");
        String note = "Bổ sung " + shortfall + " hộp còn thiếu của " + original.getRequestCode() + ".";
        return create(new CreateRfqRequest(original.getCompanyName(), original.getTaxCode(), original.getContactName(),
                original.getContactPosition(), original.getContactPhone(), original.getContactEmail(), shortfall,
                original.getCakesPerBox(), original.getExpectedDate(), null,
                original.getDescription() == null ? note : note + "\n" + original.getDescription(),
                original.getLogoUrl(), null, null, original.getTaxCode() == null ? "INDIVIDUAL" : "BUSINESS"));
    }

    /** Số hộp đã giao cho các đơn sỉ con còn hiệu lực (bỏ đơn đã huỷ) */
    private int allocatedBoxes(UUID requestId) {
        return bulkOrderRepository.findByQuoteRequestId(requestId).stream()
                .filter(order -> order.getStatus() != BulkOrderStatus.CANCELLED)
                .mapToInt(BulkOrder::getQuantity).sum();
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

    /** RFQ gửi riêng chỉ xưởng được chọn thấy và báo giá */
    private static boolean visibleTo(BulkRequest request, User provider) {
        return request.getTargetProvider() == null || request.getTargetProvider().getId().equals(provider.getId());
    }

    private RfqResponse toRfqResponse(BulkRequest request) {
        return new RfqResponse(request.getId(), request.getRequestCode(), request.getCompanyName(),
                request.getTaxCode(), request.getContactName(), request.getContactPosition(),
                request.getContactPhone(), request.getContactEmail(), request.getRequestedQuantity(),
                request.getCakesPerBox(),
                request.getExpectedDate(), request.getExpectedBudget(), request.getDescription(),
                request.getLogoUrl(), request.getStatus(),
                request.getTargetProvider() == null ? null : request.getTargetProvider().getId(),
                request.getTargetProvider() == null ? null : request.getTargetProvider().getStoreName(),
                request.getProduct() == null ? null : request.getProduct().getId(),
                request.getProduct() == null ? null : request.getProduct().getName());
    }

    private RfqResponse toProviderRfqResponse(BulkRequest request) {
        return new RfqResponse(request.getId(), request.getRequestCode(), "Khách doanh nghiệp",
                null, null, null, null, null, request.getRequestedQuantity(), request.getCakesPerBox(),
                request.getExpectedDate(), request.getExpectedBudget(), request.getDescription(),
                request.getLogoUrl(), request.getStatus(),
                request.getTargetProvider() == null ? null : request.getTargetProvider().getId(),
                request.getTargetProvider() == null ? null : request.getTargetProvider().getStoreName(),
                request.getProduct() == null ? null : request.getProduct().getId(),
                request.getProduct() == null ? null : request.getProduct().getName());
    }

    private QuoteResponse toQuoteResponse(ProviderQuotation quote) {
        boolean accepted = quote.getStatus() == QuoteStatus.ACCEPTED;
        // Đã chốt: tiền tính theo số hộp thực chốt với xưởng (có thể ít hơn số xưởng báo khi chia nhiều xưởng)
        Integer acceptedBoxes = accepted ? bulkOrderRepository.findByQuoteId(quote.getId())
                .map(BulkOrder::getQuantity).orElse(null) : null;
        int boxes = acceptedBoxes != null ? acceptedBoxes : quote.getOfferedQuantity();
        BigDecimal gross = quote.getQuotedPrice().multiply(BigDecimal.valueOf(boxes));
        BigDecimal discount = gross.multiply(new BigDecimal("0.30")).setScale(2, RoundingMode.HALF_UP);
        return new QuoteResponse(quote.getId(), quote.getRequest().getId(), quote.getProvider().getId(),
                quote.getProvider().getStoreName(), quote.getQuotedPrice(), quote.getOfferedQuantity(),
                quote.getEstimatedDeliveryDate(), quote.getValidUntil(), quote.getNote(),
                quote.getStatus(), quote.getCreatedAt(),
                accepted ? quote.getProvider().getPhone() : null,
                accepted ? quote.getProvider().getEmail() : null,
                accepted ? quote.getProvider().getAddress() : null,
                quote.getCakesPerBox(), gross, discount, gross.subtract(discount),
                CheckoutServiceImpl.minDeposit(gross.subtract(discount)), acceptedBoxes);
    }

    private ResponseStatusException badRequest(String reason) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, reason);
    }
}
