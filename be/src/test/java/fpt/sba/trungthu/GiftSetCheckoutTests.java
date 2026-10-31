package fpt.sba.trungthu;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import fpt.sba.trungthu.common.security.JwtService;
import fpt.sba.trungthu.entity.GiftSetComponent;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.repository.GiftSetComponentRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Set quà demo (DemoProductSeeder) + năng lực/phí giao demo (DemoCheckoutSeeder) */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
        "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc
class GiftSetCheckoutTests {

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository users;
    @Autowired private ProductRepository products;
    @Autowired private ProductVariantRepository variants;
    @Autowired private GiftSetComponentRepository components;
    @Autowired private ObjectMapper json;
    @Autowired private PlatformTransactionManager transactions;
    @MockitoBean private JavaMailSender mailSender;

    @Test
    void giftSetIsSoldThroughCheckoutWithComponentLinesAndMatchingTotal() throws Exception {
        User buyer = users.findByEmail("buyer@gmail.com").orElseThrow();
        Product set = products.findAll().stream()
                .filter(p -> p.getProductType() == ProductType.GIFT_SET
                        && p.getStatus() == fpt.sba.trungthu.entity.enumeration.ProductStatus.ACTIVE
                        && boxesOf(p) > 0)
                .findFirst().orElseThrow();
        set.setSalePrice(set.getSalePrice().add(new BigDecimal("0.75")));
        products.saveAndFlush(set);
        int boxesBefore = boxesOf(set);
        LocalDate delivery = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(5);
        String group = """
                {"deliveryDate":"%s","province":"Hà Nội","district":"Hoàn Kiếm","paymentMethod":"COD",
                 "items":[{"setProductId":"%s","quantity":1}]}""".formatted(delivery, set.getId());

        JsonNode preview = call("/api/checkout/preview", "{\"groups\":[" + group + "]}", buyer);
        BigDecimal previewTotal = preview.at("/data/grandTotal").decimalValue();
        BigDecimal setPrice = preview.at("/data/groups/0/lines/0/subtotal").decimalValue();
        assertThat(setPrice).isEqualByComparingTo(set.getSalePrice().setScale(0, RoundingMode.DOWN));
        assertThat(previewTotal.stripTrailingZeros().scale()).isLessThanOrEqualTo(0);

        JsonNode orders = call("/api/checkout", """
                {"receiverName":"Mua","receiverPhone":"0903000003","shippingAddress":"12 Tràng Tiền","groups":[%s]}"""
                .formatted(group), buyer);
        JsonNode order = orders.at("/data/0");
        assertThat(order.get("totalAmount").decimalValue()).isEqualByComparingTo(previewTotal);
        assertThat(order.get("totalAmount").decimalValue().stripTrailingZeros().scale()).isLessThanOrEqualTo(0);
        assertThat(order.get("discountAmount").decimalValue()).isPositive();
        assertThat(order.get("lines")).isNotEmpty().allSatisfy(line ->
                assertThat(line.get("sourceSetId").asText()).isEqualTo(set.getId().toString()));
        assertThat(boxesOf(set)).isEqualTo(boxesBefore - 1);
    }

    @Test
    void lineMustBeVariantOrSetNotBoth() throws Exception {
        User buyer = users.findByEmail("buyer@gmail.com").orElseThrow();
        LocalDate delivery = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(5);
        mvc.perform(post("/api/checkout/preview").header("Authorization", "Bearer " + jwtService.generateAccessToken(buyer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"groups":[{"deliveryDate":"%s","province":"Hà Nội","district":"Hoàn Kiếm",
                                 "paymentMethod":"COD","items":[{"quantity":1}]}]}""".formatted(delivery)
                                .getBytes(java.nio.charset.StandardCharsets.UTF_8)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void customFourCakeBoxCanBePreviewedAndOrdered() throws Exception {
        User buyer = users.findByEmail("buyer@gmail.com").orElseThrow();
        BoxChoice choice = new TransactionTemplate(transactions).execute(tx -> {
            Product box = products.findAll().stream()
                    .filter(p -> p.getProductType() == ProductType.BOX_SHELL
                            && p.getStatus() == fpt.sba.trungthu.entity.enumeration.ProductStatus.ACTIVE)
                    .filter(p -> variants.findByProductId(p.getId()).stream()
                            .anyMatch(v -> Integer.valueOf(4).equals(v.getBoxCapacity()) && v.getStockQuantity() > 0))
                    .findFirst().orElseThrow();
            ProductVariant boxVariant = variants.findByProductId(box.getId()).stream()
                    .filter(v -> Integer.valueOf(4).equals(v.getBoxCapacity()) && v.getStockQuantity() > 0)
                    .findFirst().orElseThrow();
            Product cake = products.findAll().stream()
                    .filter(p -> p.getProductType() == ProductType.LOOSE_CAKE
                            && p.getStatus() == fpt.sba.trungthu.entity.enumeration.ProductStatus.ACTIVE
                            && p.getProvider().getId().equals(box.getProvider().getId()))
                    .findFirst().orElseThrow();
            ProductVariant cakeVariant = variants.findByProductId(cake.getId()).getFirst();
            return new BoxChoice(boxVariant.getId(), cakeVariant.getId(), boxVariant.getPrice(),
                    boxVariant.getStockQuantity());
        });
        LocalDate delivery = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(5);
        String group = """
                {"deliveryDate":"%s","province":"Hà Nội","district":"Hoàn Kiếm","paymentMethod":"COD",
                 "items":[{"variantId":"%s","quantity":1,"boxContents":["%s","%s","%s","%s"]}]}"""
                .formatted(delivery, choice.boxVariantId(), choice.cakeVariantId(), choice.cakeVariantId(),
                        choice.cakeVariantId(), choice.cakeVariantId());

        JsonNode preview = call("/api/checkout/preview", "{\"groups\":[" + group + "]}", buyer);
        assertThat(preview.at("/data/groups/0/lines/0/subtotal").decimalValue())
                .isEqualByComparingTo(choice.boxPrice());
        JsonNode created = call("/api/checkout", """
                {"receiverName":"Mua","receiverPhone":"0903000003","shippingAddress":"12 Tràng Tiền","groups":[%s]}"""
                .formatted(group), buyer);
        assertThat(created.at("/data/0/lines/0/variantName").asText()).contains("×4");
        assertThat(variants.findById(choice.boxVariantId()).orElseThrow().getStockQuantity())
                .isEqualTo(choice.boxStockBefore() - 1);
    }

    private record BoxChoice(java.util.UUID boxVariantId, java.util.UUID cakeVariantId,
            BigDecimal boxPrice, int boxStockBefore) {}

    /** Số set đã đóng sẵn (dòng vỏ hộp), đọc trong transaction vì quan hệ LAZY */
    private int boxesOf(Product set) {
        return new TransactionTemplate(transactions).execute(tx -> components.findBySetProductId(set.getId()).stream()
                .filter(c -> c.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL)
                .findFirst().map(GiftSetComponent::getQuantity).orElse(0));
    }

    private JsonNode call(String url, String body, User user) throws Exception {
        var res = mvc.perform(post(url).header("Authorization", "Bearer " + jwtService.generateAccessToken(user))
                        .contentType(MediaType.APPLICATION_JSON).content(body.getBytes(java.nio.charset.StandardCharsets.UTF_8)))
                .andReturn().getResponse();
        String text = res.getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        assertThat(res.getStatus()).as(text).isEqualTo(200);
        return json.readTree(text);
    }
}
