package fpt.sba.trungthu;

import com.jayway.jsonpath.JsonPath;
import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.AcceptQuotesRequest;
import fpt.sba.trungthu.dto.request.CreateRfqRequest;
import fpt.sba.trungthu.dto.request.SubmitQuoteRequest;
import fpt.sba.trungthu.entity.Subscription;
import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.BulkRequestStatus;
import fpt.sba.trungthu.entity.enumeration.QuoteStatus;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.BulkRequestRepository;
import fpt.sba.trungthu.repository.ProviderQuotationRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.repository.DailyCapacityRepository;
import fpt.sba.trungthu.repository.BulkOrderRepository;
import fpt.sba.trungthu.service.RfqService;
import fpt.sba.trungthu.service.RfqDeliveryEstimator;
import fpt.sba.trungthu.service.impl.BulkOrderService;
import fpt.sba.trungthu.entity.enumeration.BulkOrderStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
class RfqFlowTests {
    @Autowired private MockMvc mvc;
    @Autowired private RfqService rfq;
    @Autowired private UserRepository users;
    @Autowired private SubscriptionRepository subscriptions;
    @Autowired private BulkRequestRepository requests;
    @Autowired private ProviderQuotationRepository quotations;
    @Autowired private DailyCapacityRepository capacities;
    @Autowired private BulkOrderRepository bulkOrders;
    @Autowired private BulkOrderService bulkOrderService;
    @Autowired private RfqDeliveryEstimator deliveryEstimator;
    @MockitoBean private SecurityContextService security;

    @Test
    void hundredBoxesOfFourCakesNeedTwoBakeDaysBeforeDelivery() throws Exception {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User seller = createUser(UserRole.PROVIDER, true);
        subscribe(seller, today);
        capacity(seller, today.plusDays(1), 200);
        capacity(seller, today.plusDays(2), 200);

        var estimate = deliveryEstimator.estimate(100, 4, seller.getId());
        assertThat(estimate.cakeQuantity()).isEqualTo(400);
        assertThat(estimate.productionDays()).isEqualTo(2);
        assertThat(estimate.earliestDeliveryDate()).isEqualTo(today.plusDays(3));
        mvc.perform(get("/api/rfqs/earliest-delivery")
                        .param("boxes", "100").param("cakesPerBox", "4").param("providerId", seller.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.productionDays").value(2))
                .andExpect(jsonPath("$.data.earliestDeliveryDate").value(today.plusDays(3).toString()));

        as(buyer);
        assertThatThrownBy(() -> rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 100, 4, today.plusDays(2),
                null, null, null, seller.getId(), null))).isInstanceOf(ResponseStatusException.class);
        var request = rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 100, 4, today.plusDays(3),
                null, null, null, seller.getId(), null));
        assertThat(request.cakesPerBox()).isEqualTo(4);
        assertThat(request.expectedDeliveryDate()).isEqualTo(today.plusDays(3));

        var firstDay = capacities.findByProviderIdAndCapacityDate(seller.getId(), today.plusDays(1)).orElseThrow();
        firstDay.setReservedQuantity(100);
        capacities.saveAndFlush(firstDay);
        capacity(seller, today.plusDays(3), 200);
        assertThat(deliveryEstimator.estimate(100, 4, seller.getId()).earliestDeliveryDate())
                .isEqualTo(today.plusDays(4));
    }

    @Test
    void customerCreatesProviderQuotesAndCustomerAcceptsOnlyOwnQuote() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User otherBuyer = createUser(UserRole.CUSTOMER, false);
        User seller = createUser(UserRole.PROVIDER, true);
        User otherSeller = createUser(UserRole.PROVIDER, true);
        subscribe(seller, today);
        subscribe(otherSeller, today);
        capacity(seller, today.plusDays(6), 100);
        capacity(otherSeller, today.plusDays(6), 100);

        as(buyer);
        var request = rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 100, today.plusDays(7),
                new BigDecimal("50000000"), "In logo", null, null, null));
        assertThat(request.code()).startsWith("RFQ-");
        assertThat(rfq.mine()).extracting("id").contains(request.id());

        as(seller);
        var feed = rfq.providerFeed();
        assertThat(feed).extracting("id").contains(request.id());
        assertThat(feed.stream().filter(item -> item.id().equals(request.id())).findFirst().orElseThrow().contactEmail()).isNull();
        var first = rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("420000"),
                100, today.plusDays(7), today.plusDays(8), "Giao một đợt"));
        assertThat(first.status()).isEqualTo(QuoteStatus.SUBMITTED);
        assertThatThrownBy(() -> rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("400000"),
                100, today.plusDays(7), today.plusDays(8), null))).isInstanceOf(ResponseStatusException.class);

        as(otherSeller);
        var second = rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("410000"),
                100, today.plusDays(7), today.plusDays(8), null));
        assertThat(rfq.reviseQuote(request.id(), second.id(), new SubmitQuoteRequest(new BigDecimal("400000"),
                100, 1, today.plusDays(7), today.plusDays(8), "Đã chỉnh giá")).cakesPerBox()).isEqualTo(1);

        as(otherBuyer);
        assertThat(rfq.mine()).doesNotContain(request);
        assertThatThrownBy(() -> rfq.quotes(request.id())).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> rfq.acceptQuote(request.id(), second.id())).isInstanceOf(ResponseStatusException.class);

        as(buyer);
        assertThat(rfq.quotes(request.id())).extracting("id").containsExactly(second.id(), first.id());
        // Chưa chọn: khách chưa thấy liên hệ xưởng
        assertThat(rfq.quotes(request.id())).extracting("providerEmail").containsOnlyNulls();
        assertThat(rfq.acceptQuote(request.id(), first.id()).status()).isEqualTo(QuoteStatus.ACCEPTED);
        assertThat(bulkOrders.findByQuoteId(first.id()).orElseThrow().getTotalAmount())
                .isEqualByComparingTo("29400000");
        assertThat(capacities.findByProviderIdAndCapacityDate(seller.getId(), today.plusDays(6))
                .orElseThrow().getReservedQuantity()).isEqualTo(100);
        // Đã chọn: báo giá thắng có liên hệ xưởng, báo giá bị từ chối thì không
        assertThat(rfq.quotes(request.id())).filteredOn(q -> q.id().equals(first.id()))
                .extracting("providerEmail").containsExactly(seller.getEmail());
        assertThat(rfq.quotes(request.id())).filteredOn(q -> q.id().equals(second.id()))
                .extracting("providerEmail").containsOnlyNulls();
        assertThat(requests.findById(request.id()).orElseThrow().getStatus()).isEqualTo(BulkRequestStatus.WON);
        assertThat(quotations.findById(second.id()).orElseThrow().getStatus()).isEqualTo(QuoteStatus.REJECTED);
        assertThatThrownBy(() -> rfq.acceptQuote(request.id(), second.id())).isInstanceOf(ResponseStatusException.class);
        as(otherSeller);
        assertThatThrownBy(() -> rfq.reviseQuote(request.id(), second.id(), new SubmitQuoteRequest(new BigDecimal("390000"),
                100, today.plusDays(7), today.plusDays(8), null))).isInstanceOf(ResponseStatusException.class);

        as(seller);
        assertThat(rfq.providerQuotes()).extracting("status").contains(QuoteStatus.ACCEPTED);
        assertThat(rfq.providerFeed().stream().filter(item -> item.id().equals(request.id()))
                .findFirst().orElseThrow().contactEmail()).isEqualTo("lan@example.com");
    }

    @Test
    void largeOrderReservesFourBakeDaysAndReleasesThemWhenCancelled() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User seller = createUser(UserRole.PROVIDER, true);
        subscribe(seller, today);
        for (int i = 3; i <= 6; i++) capacity(seller, today.plusDays(i), 500);

        as(buyer);
        var request = rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 2000, today.plusDays(7),
                null, null, null, seller.getId(), null));
        as(seller);
        var quote = rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("100000"),
                2000, 1, today.plusDays(7), today.plusDays(8), null));
        assertThat(quote.grossAmount()).isEqualByComparingTo("200000000");
        assertThat(quote.discountAmount()).isEqualByComparingTo("60000000");
        assertThat(quote.totalAmount()).isEqualByComparingTo("140000000");

        as(buyer);
        rfq.acceptQuote(request.id(), quote.id());
        var order = bulkOrderService.mine().stream().filter(item -> item.quoteId().equals(quote.id())).findFirst().orElseThrow();
        assertThat(order.status()).isEqualTo(BulkOrderStatus.WAITING_DEPOSIT);
        assertThat(order.productionDays()).hasSize(4).extracting("cakes").containsOnly(500);
        for (int i = 3; i <= 6; i++) assertThat(capacities.findByProviderIdAndCapacityDate(seller.getId(), today.plusDays(i))
                .orElseThrow().getReservedQuantity()).isEqualTo(500);
        assertThatThrownBy(() -> rfq.acceptQuote(request.id(), quote.id())).isInstanceOf(ResponseStatusException.class);

        bulkOrderService.cancel(order.id());
        assertThat(bulkOrderService.mine().stream().filter(item -> item.id().equals(order.id()))
                .findFirst().orElseThrow().status()).isEqualTo(BulkOrderStatus.CANCELLED);
        for (int i = 3; i <= 6; i++) assertThat(capacities.findByProviderIdAndCapacityDate(seller.getId(), today.plusDays(i))
                .orElseThrow().getReservedQuantity()).isZero();
    }

    @Test
    void acceptanceFailsWithoutEnoughCakesAndLeavesQuoteOpen() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User seller = createUser(UserRole.PROVIDER, true);
        subscribe(seller, today);
        capacity(seller, today.plusDays(6), 4000);
        as(buyer);
        var request = rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 1000, 4, today.plusDays(7),
                null, null, null, seller.getId(), null));
        as(seller);
        var quote = rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("100000"),
                1000, 4, today.plusDays(7), today.plusDays(8), null));
        var changed = capacities.findByProviderIdAndCapacityDate(seller.getId(), today.plusDays(6)).orElseThrow();
        changed.setMaxQuantity(500);
        capacities.saveAndFlush(changed);
        as(buyer);
        assertThatThrownBy(() -> rfq.acceptQuote(request.id(), quote.id()))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(quotations.findById(quote.id()).orElseThrow().getStatus()).isEqualTo(QuoteStatus.SUBMITTED);
        assertThat(bulkOrders.findByQuoteId(quote.id())).isEmpty();
        assertThat(capacities.findByProviderIdAndCapacityDate(seller.getId(), today.plusDays(6))
                .orElseThrow().getReservedQuantity()).isZero();
    }

    @Test
    void httpEndpointsConnectBuyerAndProviderWithRoleChecks() throws Exception {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User seller = createUser(UserRole.PROVIDER, true);
        subscribe(seller, today);
        capacity(seller, today.plusDays(6), 50);

        as(buyer);
        String body = """
                {"companyName":"Công ty Ánh Trăng","taxCode":"0123456789","contactName":"Mai",
                 "contactPosition":"Thu mua","contactPhone":"0901234567","contactEmail":"mai@example.com",
                 "requestedQuantity":50,"expectedDeliveryDate":"%s"}
                """.formatted(today.plusDays(7));
        String created = mvc.perform(post("/api/rfqs").with(user("buyer").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.code").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(created, "$.data.id");
        mvc.perform(get("/api/rfqs/me").with(user("buyer").roles("CUSTOMER")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].id").value(id));
        mvc.perform(get("/api/provider/rfqs").with(user("buyer").roles("CUSTOMER")))
                .andExpect(status().isForbidden());

        as(seller);
        mvc.perform(get("/api/provider/rfqs").with(user("seller").roles("PROVIDER")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].contactEmail").doesNotExist());
        String quoteBody = """
                {"unitPrice":420000,"offeredQuantity":50,"cakesPerBox":1,"estimatedDeliveryDate":"%s","validUntil":"%s"}
                """.formatted(today.plusDays(7), today.plusDays(8));
        String quoted = mvc.perform(post("/api/provider/rfqs/{requestId}/quotes", id)
                        .with(user("seller").roles("PROVIDER"))
                        .contentType(MediaType.APPLICATION_JSON).content(quoteBody))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andReturn().getResponse().getContentAsString();
        String quoteId = JsonPath.read(quoted, "$.data.id");
        mvc.perform(get("/api/provider/rfqs/quotes/me").with(user("seller").roles("PROVIDER")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].id").value(quoteId));
        mvc.perform(get("/api/rfqs/{requestId}/quotes", id).with(user("seller").roles("PROVIDER")))
                .andExpect(status().isForbidden());

        as(buyer);
        mvc.perform(get("/api/rfqs/{requestId}/quotes", id).with(user("buyer").roles("CUSTOMER")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].id").value(quoteId));
        mvc.perform(post("/api/rfqs/{requestId}/quotes/{quoteId}/accept", id, quoteId)
                        .with(user("buyer").roles("CUSTOMER")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("ACCEPTED"));
        mvc.perform(get("/api/bulk-orders/me").with(user("buyer").roles("CUSTOMER")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].totalAmount").value(14700000));
        UUID bulkId = bulkOrders.findByQuoteId(UUID.fromString(quoteId)).orElseThrow().getId();
        mvc.perform(get("/api/bulk-orders/{id}/vietqr", bulkId).with(user("buyer").roles("CUSTOMER")))
                .andExpect(status().isConflict());
        seller.setBankCode("VCB");
        seller.setBankAccountNumber("1234567890");
        seller.setBankAccountName("XUONG THU");
        users.saveAndFlush(seller);
        mvc.perform(get("/api/bulk-orders/{id}/vietqr", bulkId).with(user("buyer").roles("CUSTOMER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.amount").value(7350000))
                .andExpect(jsonPath("$.data.accountNumber").value("1234567890"))
                .andExpect(jsonPath("$.data.imageUrl").value(org.hamcrest.Matchers.containsString("amount=7350000")));
        as(createUser(UserRole.CUSTOMER, false));
        mvc.perform(get("/api/bulk-orders/{id}/vietqr", bulkId).with(user("other").roles("CUSTOMER")))
                .andExpect(status().isNotFound());
        as(buyer);
        mvc.perform(get("/api/provider/bulk-orders").with(user("buyer").roles("CUSTOMER")))
                .andExpect(status().isForbidden());
        as(seller);
        mvc.perform(get("/api/provider/bulk-orders").with(user("seller").roles("PROVIDER")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].status").value("WAITING_DEPOSIT"));
    }

    @Test
    void rejectsMalformedTaxCodeAndPhone() throws Exception {
        LocalDate date = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(7);
        as(createUser(UserRole.CUSTOMER, false));
        String template = """
                {"companyName":"Cong ty Anh Trang","taxCode":"%s","contactName":"Mai",
                 "contactPosition":"Thu mua","contactPhone":"%s","contactEmail":"mai@example.com",
                 "requestedQuantity":50,"expectedDeliveryDate":"%s"}
                """;
        for (String[] bad : new String[][] {{"abc123", "0901234567"}, {"123456789", "0901234567"},
                {"0123456789-12", "0901234567"}, {"0123456789", "12345"}}) {
            mvc.perform(post("/api/rfqs").with(user("buyer").roles("CUSTOMER")).contentType(MediaType.APPLICATION_JSON)
                            .content(template.formatted(bad[0], bad[1], date)))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/rfqs").with(user("buyer").roles("CUSTOMER")).contentType(MediaType.APPLICATION_JSON)
                        .content(template.formatted("0123456789-001", "0901234567", date)))
                .andExpect(status().isOk());
    }

    @Test
    void rejectsInvalidRfqContactAndMoneyBeforeSaving() throws Exception {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        as(buyer);

        String validContact = """
                {"companyName":"Công ty Ánh Trăng","taxCode":"0123456789","contactName":"Mai",
                 "contactPosition":"Thu mua","contactPhone":"0901234567","contactEmail":"mai@example.com",
                 "requestedQuantity":50,"expectedDeliveryDate":"%s"}
                """.formatted(today.plusDays(7));
        mvc.perform(post("/api/rfqs").with(user("buyer").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validContact.replace("0123456789", "abc")))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/rfqs").with(user("buyer").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validContact.replace("0901234567", "not-a-phone")))
                .andExpect(status().isBadRequest());

        String invalidBudget = """
                {"companyName":"Công ty Ánh Trăng","taxCode":"0123456789","contactName":"Mai",
                 "contactPosition":"Thu mua","contactPhone":"0901234567","contactEmail":"mai@example.com",
                 "requestedQuantity":50,"expectedDeliveryDate":"%s","expectedBudget":123.456}
                """.formatted(today.plusDays(7));
        mvc.perform(post("/api/rfqs").with(user("buyer").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON).content(invalidBudget))
                .andExpect(status().isBadRequest());
        assertThat(requests.findTop100ByCustomerIdOrderByCreatedAtDesc(buyer.getId())).isEmpty();

        String whitespaceName = invalidBudget.replace("Công ty Ánh Trăng", "  A  ")
                .replace("123.456", "123");
        mvc.perform(post("/api/rfqs").with(user("buyer").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON).content(whitespaceName))
                .andExpect(status().isBadRequest());
        assertThat(requests.findTop100ByCustomerIdOrderByCreatedAtDesc(buyer.getId())).isEmpty();
    }

    @Test
    void rejectsQuotePriceThatCannotFitDatabaseColumn() throws Exception {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User seller = createUser(UserRole.PROVIDER, true);
        subscribe(seller, today);
        as(buyer);
        var request = rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 100, today.plusDays(7),
                null, null, null, null, null));

        as(seller);
        String invalidQuote = """
                {"unitPrice":123.456,"offeredQuantity":100,
                 "estimatedDeliveryDate":"%s","validUntil":"%s"}
                """.formatted(today.plusDays(7), today.plusDays(8));
        mvc.perform(post("/api/provider/rfqs/{requestId}/quotes", request.id())
                        .with(user("seller").roles("PROVIDER"))
                        .contentType(MediaType.APPLICATION_JSON).content(invalidQuote))
                .andExpect(status().isBadRequest());
        assertThat(quotations.findTop100ByProviderIdOrderByCreatedAtDesc(seller.getId())).isEmpty();
    }

    private User createUser(UserRole role, boolean eligible) {
        return users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@example.com")
                .password("unused").fullName("Test").role(role).storeName(role == UserRole.PROVIDER ? "Xưởng thử" : null)
                .isComplianceApproved(eligible).isSeasonActive(eligible).build());
    }

    @Test
    void rfqSentToOneProviderIsHiddenFromOthers() {
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User seller = createUser(UserRole.PROVIDER, true);
        User otherSeller = createUser(UserRole.PROVIDER, true);
        subscribe(seller, today);
        subscribe(otherSeller, today);
        capacity(seller, today.plusDays(6), 100);

        as(buyer);
        var request = rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 100, today.plusDays(7),
                null, null, null, seller.getId(), null));
        assertThat(request.providerId()).isEqualTo(seller.getId());
        assertThat(request.providerName()).isEqualTo("Xưởng thử");
        assertThatThrownBy(() -> rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 100, today.plusDays(7),
                null, null, null, buyer.getId(), null))).isInstanceOf(ResponseStatusException.class);

        as(otherSeller);
        assertThat(rfq.providerFeed()).extracting("id").doesNotContain(request.id());
        assertThatThrownBy(() -> rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("410000"),
                100, today.plusDays(7), today.plusDays(8), null))).isInstanceOf(ResponseStatusException.class);

        as(seller);
        assertThat(rfq.providerFeed()).extracting("id").contains(request.id());
        assertThat(rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("420000"),
                100, today.plusDays(7), today.plusDays(8), null)).status()).isEqualTo(QuoteStatus.SUBMITTED);
    }

    @Test
    void providerCanOfferFewerBoxesWhenQuoteExpiresAfterDelivery() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User seller = createUser(UserRole.PROVIDER, true);
        subscribe(seller, today);
        capacity(seller, today.plusDays(6), 100);
        as(buyer);
        var request = rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 100, today.plusDays(7),
                null, null, null, seller.getId(), null));

        as(seller);
        assertThatThrownBy(() -> rfq.submitQuote(request.id(), new SubmitQuoteRequest(
                new BigDecimal("420000"), 50, today.plusDays(7), today.plusDays(7), null)))
                .isInstanceOf(ResponseStatusException.class);
        var quote = rfq.submitQuote(request.id(), new SubmitQuoteRequest(
                new BigDecimal("420000"), 50, today.plusDays(7), today.plusDays(8), null));
        assertThat(quote.offeredQuantity()).isEqualTo(50);
        as(buyer);
        rfq.acceptQuote(request.id(), quote.id());
        assertThat(bulkOrders.findByQuoteId(quote.id()).orElseThrow().getQuantity()).isEqualTo(50);
    }

    @Test
    void customerSplitsOneRfqAcrossTwoProvidersAndReordersShortfallAfterCancel() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User small = createUser(UserRole.PROVIDER, true);
        User big = createUser(UserRole.PROVIDER, true);
        User late = createUser(UserRole.PROVIDER, true);
        for (User p : List.of(small, big, late)) { subscribe(p, today); capacity(p, today.plusDays(6), 1000); }

        as(buyer);
        var request = rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 1000, today.plusDays(7),
                null, "Hộp đỏ", null, null, null));
        as(small);
        var q1 = rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("100000"),
                400, today.plusDays(7), today.plusDays(8), "Chỉ làm được 400"));
        as(big);
        var q2 = rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("120000"),
                700, today.plusDays(7), today.plusDays(8), null));
        as(late);
        var q3 = rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("90000"),
                1000, today.plusDays(7), today.plusDays(8), null));

        as(buyer);
        // Chọn quá số hộp xưởng báo: cả lần chốt bị từ chối, không tạo đơn nào
        assertThatThrownBy(() -> rfq.acceptQuotes(request.id(), List.of(
                new AcceptQuotesRequest.Item(q1.id(), 500), new AcceptQuotesRequest.Item(q2.id(), 500))))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(bulkOrders.findByQuoteRequestId(request.id())).isEmpty();

        var accepted = rfq.acceptQuotes(request.id(), List.of(
                new AcceptQuotesRequest.Item(q1.id(), 400), new AcceptQuotesRequest.Item(q2.id(), 600)));
        assertThat(accepted).extracting("acceptedQuantity").containsExactlyInAnyOrder(400, 600);
        assertThat(accepted.stream().filter(q -> q.id().equals(q2.id())).findFirst().orElseThrow().totalAmount())
                .isEqualByComparingTo("50400000"); // 600 × 120.000 − 30%
        assertThat(bulkOrders.findByQuoteRequestId(request.id())).extracting("quantity").containsExactlyInAnyOrder(400, 600);
        assertThat(capacities.findByProviderIdAndCapacityDate(big.getId(), today.plusDays(6))
                .orElseThrow().getReservedQuantity()).isEqualTo(600);
        assertThat(quotations.findById(q3.id()).orElseThrow().getStatus()).isEqualTo(QuoteStatus.REJECTED);
        assertThat(requests.findById(request.id()).orElseThrow().getStatus()).isEqualTo(BulkRequestStatus.WON);
        assertThat(bulkOrderService.mine()).filteredOn(o -> o.requestId().equals(request.id()))
                .extracting("requestedQuantity").containsOnly(1000);
        assertThatThrownBy(() -> rfq.reorderShortfall(request.id())).isInstanceOf(ResponseStatusException.class);

        // Một đơn con bị huỷ: đơn tổng thiếu 400 hộp, khách mở RFQ mới đúng phần thiếu
        bulkOrderService.cancel(bulkOrders.findByQuoteId(q1.id()).orElseThrow().getId());
        var refill = rfq.reorderShortfall(request.id());
        assertThat(refill.requestedQuantity()).isEqualTo(400);
        assertThat(refill.providerId()).isNull();
        assertThat(refill.description()).contains(request.code(), "Hộp đỏ");
    }

    private void subscribe(User provider, LocalDate today) {
        subscriptions.saveAndFlush(Subscription.builder().provider(provider).planName("Test")
                .price(BigDecimal.ZERO).startDate(today.minusDays(1)).endDate(today.plusDays(30))
                .status(SubscriptionStatus.ACTIVE).build());
    }

    private void capacity(User provider, LocalDate date, int count) {
        capacities.saveAndFlush(DailyCapacity.builder().provider(provider).capacityDate(date)
                .maxQuantity(count).reservedQuantity(0).build());
    }

    private void as(User user) {
        when(security.getCurrentUser()).thenReturn(user);
        when(security.getCurrentUserId()).thenReturn(user.getId());
    }
}
