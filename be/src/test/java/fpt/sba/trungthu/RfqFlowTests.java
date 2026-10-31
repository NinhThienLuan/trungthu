package fpt.sba.trungthu;

import com.jayway.jsonpath.JsonPath;
import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.CreateRfqRequest;
import fpt.sba.trungthu.dto.request.SubmitQuoteRequest;
import fpt.sba.trungthu.entity.Subscription;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.BulkRequestStatus;
import fpt.sba.trungthu.entity.enumeration.QuoteStatus;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.BulkRequestRepository;
import fpt.sba.trungthu.repository.ProviderQuotationRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.RfqService;
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
    @MockitoBean private SecurityContextService security;

    @Test
    void customerCreatesProviderQuotesAndCustomerAcceptsOnlyOwnQuote() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User otherBuyer = createUser(UserRole.CUSTOMER, false);
        User seller = createUser(UserRole.PROVIDER, true);
        User otherSeller = createUser(UserRole.PROVIDER, true);
        subscribe(seller, today);
        subscribe(otherSeller, today);

        as(buyer);
        var request = rfq.create(new CreateRfqRequest("Công ty Mặt Trăng", "0123456789", "Lan",
                "Thu mua", "0901234567", "lan@example.com", 100, today.plusDays(7),
                new BigDecimal("50000000"), "In logo", null));
        assertThat(request.code()).startsWith("RFQ-");
        assertThat(rfq.mine()).extracting("id").contains(request.id());

        as(seller);
        var feed = rfq.providerFeed();
        assertThat(feed).extracting("id").contains(request.id());
        assertThat(feed.stream().filter(item -> item.id().equals(request.id())).findFirst().orElseThrow().contactEmail()).isNull();
        var first = rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("420000"),
                100, today.plusDays(7), today.plusDays(5), "Giao một đợt"));
        assertThat(first.status()).isEqualTo(QuoteStatus.SUBMITTED);
        assertThatThrownBy(() -> rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("400000"),
                100, today.plusDays(7), today.plusDays(5), null))).isInstanceOf(ResponseStatusException.class);

        as(otherSeller);
        var second = rfq.submitQuote(request.id(), new SubmitQuoteRequest(new BigDecimal("410000"),
                100, today.plusDays(7), today.plusDays(5), null));

        as(otherBuyer);
        assertThat(rfq.mine()).doesNotContain(request);
        assertThatThrownBy(() -> rfq.quotes(request.id())).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> rfq.acceptQuote(request.id(), second.id())).isInstanceOf(ResponseStatusException.class);

        as(buyer);
        assertThat(rfq.quotes(request.id())).extracting("id").containsExactly(second.id(), first.id());
        // Chưa chọn: khách chưa thấy liên hệ xưởng
        assertThat(rfq.quotes(request.id())).extracting("providerEmail").containsOnlyNulls();
        assertThat(rfq.acceptQuote(request.id(), first.id()).status()).isEqualTo(QuoteStatus.ACCEPTED);
        // Đã chọn: báo giá thắng có liên hệ xưởng, báo giá bị từ chối thì không
        assertThat(rfq.quotes(request.id())).filteredOn(q -> q.id().equals(first.id()))
                .extracting("providerEmail").containsExactly(seller.getEmail());
        assertThat(rfq.quotes(request.id())).filteredOn(q -> q.id().equals(second.id()))
                .extracting("providerEmail").containsOnlyNulls();
        assertThat(requests.findById(request.id()).orElseThrow().getStatus()).isEqualTo(BulkRequestStatus.WON);
        assertThat(quotations.findById(second.id()).orElseThrow().getStatus()).isEqualTo(QuoteStatus.REJECTED);
        assertThatThrownBy(() -> rfq.acceptQuote(request.id(), second.id())).isInstanceOf(ResponseStatusException.class);

        as(seller);
        assertThat(rfq.providerQuotes()).extracting("status").contains(QuoteStatus.ACCEPTED);
        assertThat(rfq.providerFeed().stream().filter(item -> item.id().equals(request.id()))
                .findFirst().orElseThrow().contactEmail()).isEqualTo("lan@example.com");
    }

    @Test
    void httpEndpointsConnectBuyerAndProviderWithRoleChecks() throws Exception {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        User buyer = createUser(UserRole.CUSTOMER, false);
        User seller = createUser(UserRole.PROVIDER, true);
        subscribe(seller, today);

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
                {"unitPrice":420000,"offeredQuantity":50,"estimatedDeliveryDate":"%s","validUntil":"%s"}
                """.formatted(today.plusDays(7), today.plusDays(5));
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
                null, null, null));

        as(seller);
        String invalidQuote = """
                {"unitPrice":123.456,"offeredQuantity":100,
                 "estimatedDeliveryDate":"%s","validUntil":"%s"}
                """.formatted(today.plusDays(7), today.plusDays(5));
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

    private void subscribe(User provider, LocalDate today) {
        subscriptions.saveAndFlush(Subscription.builder().provider(provider).planName("Test")
                .price(BigDecimal.ZERO).startDate(today.minusDays(1)).endDate(today.plusDays(30))
                .status(SubscriptionStatus.ACTIVE).build());
    }

    private void as(User user) {
        when(security.getCurrentUser()).thenReturn(user);
        when(security.getCurrentUserId()).thenReturn(user.getId());
    }
}
