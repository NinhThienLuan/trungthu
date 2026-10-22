package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.JwtService;
import fpt.sba.trungthu.entity.Subscription;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
        "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc
class GiftSetStockTests {

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository users;
    @Autowired private SubscriptionRepository subscriptions;
    @Autowired private ProductVariantRepository variants;
    @Autowired private ProductRepository products;
    @MockitoBean private JavaMailSender mailSender;

    private User provider;

    @BeforeEach
    void setUp() {
        provider = users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@shop.test").password("hash")
                .fullName("Baker").storeName("Oven").role(UserRole.PROVIDER).status(UserStatus.ACTIVE)
                .isComplianceApproved(true).isSeasonActive(true).build());
        subscriptions.saveAndFlush(Subscription.builder().provider(provider).planName("MVP")
                .price(BigDecimal.ZERO).startDate(LocalDate.of(2026, 1, 1))
                .endDate(LocalDate.of(2027, 12, 31)).maxProductsAllowed(500)
                .status(SubscriptionStatus.ACTIVE).build());
    }

    @Test
    void packingFromStockSplitsLooseAndSetWithoutBreakingTheBalance() throws Exception {
        Created cake = createCake("PACK-150", 5);
        String setId = createSet();
        String packed = mvc.perform(post("/api/provider/products/{productId}/components", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"source":"STOCK","variantId":"%s","quantity":2}
                                """.formatted(cake.variantId())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String componentId = com.jayway.jsonpath.JsonPath.read(packed, "$.data.components[0].id");

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/provider/products/{productId}/variants/{variantId}/stats",
                        cake.productId(), cake.variantId()).header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.looseOnHand").value(3))
                .andExpect(jsonPath("$.data.inSet").value(2))
                .andExpect(jsonPath("$.data.onHand").value(5))
                .andExpect(jsonPath("$.data.discrepancy").value(0));

        mvc.perform(patch("/api/provider/products/{productId}/components/{componentId}",
                        setId, componentId).header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":0}"))
                .andExpect(status().isOk());

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/provider/products/{productId}/variants/{variantId}/stats",
                        cake.productId(), cake.variantId()).header("Authorization", token()))
                .andExpect(jsonPath("$.data.looseOnHand").value(5))
                .andExpect(jsonPath("$.data.inSet").value(0))
                .andExpect(jsonPath("$.data.onHand").value(5))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
    }

    @Test
    void directImportAddsStockInsideTheSetWithoutTouchingLooseStock() throws Exception {
        Created cake = createCake("DIRECT-150", 5);
        String setId = createSet();
        mvc.perform(post("/api/provider/products/{productId}/components", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"source":"DIRECT","variantId":"%s","quantity":4}
                                """.formatted(cake.variantId())))
                .andExpect(status().isCreated());

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/provider/products/{productId}/variants/{variantId}/stats",
                        cake.productId(), cake.variantId()).header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.inbound").value(9))
                .andExpect(jsonPath("$.data.looseOnHand").value(5))
                .andExpect(jsonPath("$.data.inSet").value(4))
                .andExpect(jsonPath("$.data.onHand").value(9))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
    }

    @Test
    void setLossAndDiscontinueKeepTheSetBalance() throws Exception {
        Created cake = createCake("SET-CHART", 1);
        mvc.perform(post("/api/provider/products/{productId}/variants/{variantId}/adjustments",
                        cake.productId(), cake.variantId())
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"ADJUSTMENT_EXPIRED\",\"quantity\":1,\"reason\":\"về 0\"}"))
                .andExpect(status().isOk());
        Created box = createBox();
        String setId = createSet();
        mvc.perform(post("/api/provider/products/{id}/composition", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"box":{"variantId":"%s","quantity":1},"cakes":[{"variantId":"%s","quantity":4}]}
                                """.formatted(box.variantId(), cake.variantId())))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/provider/products/{id}/composition/stock", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"setCount\":3,\"reason\":\"Nhập set\"}"))
                .andExpect(status().isOk());
        addCover(setId);
        mvc.perform(put("/api/provider/products/{id}", setId).header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Set đoàn viên\",\"productType\":\"GIFT_SET\",\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/provider/products/{id}/set-adjustments", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"ADJUSTMENT_BROKEN\",\"quantity\":1,\"reason\":\"móp hộp\"}"))
                .andExpect(status().isOk());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/provider/products/{id}/set-stats", setId).header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.inbound").value(3))
                .andExpect(jsonPath("$.data.broken").value(1))
                .andExpect(jsonPath("$.data.onHand").value(2))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/provider/products/{productId}/variants/{variantId}/stats",
                        cake.productId(), cake.variantId()).header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.inbound").value(13))
                .andExpect(jsonPath("$.data.broken").value(4))
                .andExpect(jsonPath("$.data.expired").value(1))
                .andExpect(jsonPath("$.data.looseOnHand").value(0))
                .andExpect(jsonPath("$.data.inSet").value(8))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
        mvc.perform(post("/api/provider/products/{id}/discontinue", setId).header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SOLD_OUT"))
                .andExpect(jsonPath("$.data.assembledQuantity").value(0));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/provider/products/{id}/set-stats", setId).header("Authorization", token()))
                .andExpect(jsonPath("$.data.onHand").value(0))
                .andExpect(jsonPath("$.data.terminateClear").value(2))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/provider/products/{productId}/variants/{variantId}/stats",
                        cake.productId(), cake.variantId()).header("Authorization", token()))
                .andExpect(jsonPath("$.data.inbound").value(13))
                .andExpect(jsonPath("$.data.broken").value(4))
                .andExpect(jsonPath("$.data.terminateClear").value(8))
                .andExpect(jsonPath("$.data.looseOnHand").value(0))
                .andExpect(jsonPath("$.data.inSet").value(0))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
        assertThat(variants.findById(UUID.fromString(cake.variantId())).orElseThrow().getStockQuantity()).isZero();
    }

    @Test
    void discontinueRetailLeavesPiecesPackedInTheSet() throws Exception {
        Created cake = createCake("RETAIL-KEEP-SET", 8);
        String setId = createSet();
        mvc.perform(post("/api/provider/products/{productId}/components", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"source":"DIRECT","variantId":"%s","quantity":4}
                                """.formatted(cake.variantId())))
                .andExpect(status().isCreated());

        mvc.perform(post("/api/provider/products/{id}/discontinue", cake.productId()).header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SOLD_OUT"));

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/provider/products/{productId}/variants/{variantId}/stats",
                        cake.productId(), cake.variantId()).header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.looseOnHand").value(0))
                .andExpect(jsonPath("$.data.inSet").value(4));
        assertThat(products.findById(UUID.fromString(setId)).orElseThrow().getStatus()).isEqualTo(ProductStatus.DRAFT);
    }

    @Test
    void discontinueSetDoesNotReturnPiecesToLooseStock() throws Exception {
        Created cake = createCake("SET-KEEP-LOOSE", 6);
        Created box = createBox("SET-KEEP-BOX");
        String setId = createSet();
        mvc.perform(post("/api/provider/products/{id}/composition", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"box":{"variantId":"%s","quantity":1},"cakes":[{"variantId":"%s","quantity":4}]}
                                """.formatted(box.variantId(), cake.variantId())))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/provider/products/{id}/composition/stock", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"setCount\":1,\"reason\":\"Nhập set\"}"))
                .andExpect(status().isOk());
        addCover(setId);
        mvc.perform(put("/api/provider/products/{id}", setId).header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Set đoàn viên\",\"productType\":\"GIFT_SET\",\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/provider/products/{productId}/components", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"source":"STOCK","variantId":"%s","quantity":2}
                                """.formatted(cake.variantId())))
                .andExpect(status().isCreated());

        mvc.perform(post("/api/provider/products/{id}/discontinue", setId).header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SOLD_OUT"))
                .andExpect(jsonPath("$.data.assembledQuantity").value(0));
        assertThat(variants.findById(UUID.fromString(cake.variantId())).orElseThrow().getStockQuantity()).isEqualTo(4);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/provider/products/{productId}/variants/{variantId}/stats",
                        cake.productId(), cake.variantId()).header("Authorization", token()))
                .andExpect(jsonPath("$.data.looseOnHand").value(4))
                .andExpect(jsonPath("$.data.inSet").value(0))
                .andExpect(jsonPath("$.data.inbound").value(10))
                .andExpect(jsonPath("$.data.terminateClear").value(6))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/products/{id}", cake.productId()))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    void releaseCompositionRemovesTheSetInbound() throws Exception {
        Created cake = createCake("SET-UNDO", 5);
        Created box = createBox("SET-UNDO-BOX");
        String setId = createSet();
        mvc.perform(post("/api/provider/products/{id}/composition", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"box":{"variantId":"%s","quantity":1},"cakes":[{"variantId":"%s","quantity":4}]}
                                """.formatted(box.variantId(), cake.variantId())))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/provider/products/{id}/composition/stock", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"setCount\":2}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/provider/products/{id}/composition/release", setId)
                        .header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.assembledQuantity").value(0));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/provider/products/{id}/set-stats", setId).header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.inbound").value(0))
                .andExpect(jsonPath("$.data.onHand").value(0))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/provider/products/{productId}/variants/{variantId}/stats",
                        cake.productId(), cake.variantId()).header("Authorization", token()))
                .andExpect(jsonPath("$.data.inbound").value(5))
                .andExpect(jsonPath("$.data.looseOnHand").value(5))
                .andExpect(jsonPath("$.data.inSet").value(0))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
    }

    @Test
    void draftSetOpeningStockReplacesThePreviousQuantity() throws Exception {
        Created cake = createCake("SET-OPENING", 5);
        Created box = createBox("SET-OPENING-BOX");
        String setId = createSet();
        mvc.perform(post("/api/provider/products/{id}/composition", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"box":{"variantId":"%s","quantity":1},"cakes":[{"variantId":"%s","quantity":4}]}
                                """.formatted(box.variantId(), cake.variantId())))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/provider/products/{id}/composition/stock", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"setCount\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.assembledQuantity").value(2));
        mvc.perform(post("/api/provider/products/{id}/composition/stock", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"setCount\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.assembledQuantity").value(4));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .get("/api/provider/products/{id}/set-stats", setId).header("Authorization", token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.inbound").value(4))
                .andExpect(jsonPath("$.data.onHand").value(4))
                .andExpect(jsonPath("$.data.discrepancy").value(0));
        assertThat(variants.findById(UUID.fromString(cake.variantId())).orElseThrow().getStockQuantity()).isEqualTo(5);
        addCover(setId);
        mvc.perform(put("/api/provider/products/{id}", setId).header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Set đoàn viên\",\"productType\":\"GIFT_SET\",\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/provider/products/{id}/composition/stock", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"setCount\":1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Lý do nhập")));
    }

    @Test
    void giftSetRejectsAVariant() throws Exception {
        String setId = createSet();
        mvc.perform(post("/api/provider/products/{id}/variants", setId)
                        .header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantName":"Set 4","sku":"SET-NO-VARIANT","price":0,"stockQuantity":0}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("no variants")));
        assertThat(variants.countByProductId(UUID.fromString(setId))).isZero();
    }

    private Created createCake(String sku, int stock) throws Exception {
        String productId = id(mvc.perform(post("/api/provider/products").header("Authorization", token())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Bánh lẻ\",\"productType\":\"LOOSE_CAKE\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        String variantId = id(mvc.perform(post("/api/provider/products/{id}/variants", productId)
                .header("Authorization", token())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"variantName":"150g","sku":"%s","price":80000,"stockQuantity":%d,"weightGram":150}
                        """.formatted(sku, stock)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        addCover(productId);
        mvc.perform(put("/api/provider/products/{id}", productId).header("Authorization", token())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Bánh lẻ\",\"productType\":\"LOOSE_CAKE\",\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());
        return new Created(productId, variantId);
    }

    private Created createBox() throws Exception {
        return createBox("SET-BOX-4");
    }

    private Created createBox(String sku) throws Exception {
        String productId = id(mvc.perform(post("/api/provider/products").header("Authorization", token())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Hộp\",\"productType\":\"BOX_SHELL\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        String variantId = id(mvc.perform(post("/api/provider/products/{id}/variants", productId)
                .header("Authorization", token())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"variantName":"Hộp 4","sku":"%s","price":20000,"stockQuantity":1,"boxCapacity":4}
                        """.formatted(sku)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        addCover(productId);
        mvc.perform(put("/api/provider/products/{id}", productId).header("Authorization", token())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Hộp\",\"productType\":\"BOX_SHELL\",\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());
        return new Created(productId, variantId);
    }

    private String createSet() throws Exception {
        return id(mvc.perform(post("/api/provider/products").header("Authorization", token())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Set đoàn viên\",\"productType\":\"GIFT_SET\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
    }

    private void addCover(String productId) throws Exception {
        mvc.perform(put("/api/provider/products/{id}/images", productId).header("Authorization", token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"images\":[{\"imageUrl\":\"https://cdn/cake.jpg\",\"isPrimary\":true,\"displayOrder\":0}]}"))
                .andExpect(status().isOk());
    }

    private String id(String body) {
        return body.replaceAll("(?s).*\"id\":\"([^\"]+)\".*", "$1");
    }

    private String token() {
        return "Bearer " + jwtService.generateAccessToken(provider);
    }

    private record Created(String productId, String variantId) {
    }
}
