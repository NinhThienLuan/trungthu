package fpt.sba.trungthu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.sba.trungthu.dto.request.LoginRequest;
import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.request.RegisterRequest;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ProductControllerTest {

    private static final String SELLER = "seller@kinhdo.vn";
    private static final String BUYER = "buyer@gmail.com";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JavaMailSender mailSender;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void testProviderCreatesCakeWithVariantsAndCustomerSeesOnlyActive() throws Exception {
        String token = login(SELLER);
        String productId = createProduct(token, ProductType.LOOSE_CAKE, 15);

        String variantJson = send(post("/api/provider/products/" + productId + "/variants"), token,
                cakeVariant("baked-gaquay-150g", 150))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.sku").value("BAKED-GAQUAY-150G"))
                .andReturn().getResponse().getContentAsString();
        String variantId = objectMapper.readTree(variantJson).get("data").get("id").asText();

        ProductVariantRequest hidden = cakeVariant("BAKED-GAQUAY-200G", 200);
        hidden.setStatus("HIDDEN");
        send(post("/api/provider/products/" + productId + "/variants"), token, hidden)
                .andExpect(status().isCreated());

        // Đổi giá + tồn kho
        ProductVariantRequest update = cakeVariant("BAKED-GAQUAY-150G", 150);
        update.setPrice(new BigDecimal("70000"));
        update.setStockQuantity(5);
        send(put("/api/provider/products/" + productId + "/variants/" + variantId), token, update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.price").value(70000))
                .andExpect(jsonPath("$.data.stockQuantity").value(5));

        // Provider thấy cả biến thể ẩn, khách chỉ thấy biến thể đang bán
        mockMvc.perform(get("/api/provider/products").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].variants.length()").value(2));

        mockMvc.perform(get("/api/public/products/" + productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.storeName").value("Bánh Trung Thu Kinh Đô"))
                .andExpect(jsonPath("$.data.variants.length()").value(1))
                .andExpect(jsonPath("$.data.variants[0].sku").value("BAKED-GAQUAY-150G"));

        mockMvc.perform(get("/api/public/products").param("type", "BOX_SHELL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void testVariantRulesPerProductType() throws Exception {
        String token = login(SELLER);
        String cakeId = createProduct(token, ProductType.LOOSE_CAKE, 10);
        String boxId = createProduct(token, ProductType.BOX_SHELL, null);

        // Bánh lẻ bắt buộc có trọng lượng
        send(post("/api/provider/products/" + cakeId + "/variants"), token, cakeVariant("CAKE-NOWEIGHT", null))
                .andExpect(status().isBadRequest());

        // Vỏ hộp chỉ nhận 2/4/6 ô
        ProductVariantRequest box = ProductVariantRequest.builder()
                .variantName("Set 5").sku("BOX-SET5").price(new BigDecimal("150000")).stockQuantity(10).boxCapacity(5).build();
        send(post("/api/provider/products/" + boxId + "/variants"), token, box)
                .andExpect(status().isBadRequest());

        box.setBoxCapacity(4);
        send(post("/api/provider/products/" + boxId + "/variants"), token, box)
                .andExpect(status().isCreated());

        // Trùng SKU
        send(post("/api/provider/products/" + boxId + "/variants"), token, box)
                .andExpect(status().isConflict());

        // Giá âm
        ProductVariantRequest negative = cakeVariant("CAKE-NEG", 150);
        negative.setPrice(new BigDecimal("-1"));
        send(post("/api/provider/products/" + cakeId + "/variants"), token, negative)
                .andExpect(status().isBadRequest());

        // LOOSE_CAKE thiếu hạn sử dụng
        send(post("/api/provider/products"), token,
                ProductRequest.builder().name("Bánh dẻo").productType(ProductType.LOOSE_CAKE).build())
                .andExpect(status().isBadRequest());
    }

    @Test
    void testOnlyOwnerProviderCanManageProduct() throws Exception {
        String ownerToken = login(SELLER);
        String productId = createProduct(ownerToken, ProductType.LOOSE_CAKE, 10);

        // Khách không được gọi API provider
        send(post("/api/provider/products"), login(BUYER),
                ProductRequest.builder().name("X").productType(ProductType.GREETING_CARD).build())
                .andExpect(status().isForbidden());

        // Provider khác không sửa được sản phẩm của shop này
        RegisterRequest other = RegisterRequest.builder()
                .email("other@shop.vn").fullName("Other Shop")
                .phone("0912345670").role(UserRole.PROVIDER).storeName("Other Shop").build();
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(other)))
                .andExpect(status().isCreated());

        // Password is random and only delivered by mail
        ArgumentCaptor<SimpleMailMessage> mail = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(mail.capture());
        String otherPassword = mail.getValue().getText().lines()
                .filter(l -> l.startsWith("Password: ")).findFirst().orElseThrow().substring("Password: ".length());

        send(post("/api/provider/products/" + productId + "/variants"), login("other@shop.vn", otherPassword),
                cakeVariant("HACK-150G", 150))
                .andExpect(status().isNotFound());

        // Chưa đăng nhập
        mockMvc.perform(get("/api/provider/products"))
                .andExpect(status().isUnauthorized());
    }

    private String login(String email) throws Exception {
        return login(email, "12345678");
    }

    private String login(String email, String password) throws Exception {
        String json = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                LoginRequest.builder().email(email).password(password).build())))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json).get("data").get("accessToken").asText();
    }

    private String createProduct(String token, ProductType type, Integer shelfLifeDays) throws Exception {
        ProductRequest request = ProductRequest.builder()
                .name("Sản phẩm " + type).productType(type).shelfLifeDays(shelfLifeDays).build();
        String json = send(post("/api/provider/products"), token, request)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json).get("data").get("id").asText();
    }

    private ProductVariantRequest cakeVariant(String sku, Integer weightGram) {
        return ProductVariantRequest.builder()
                .variantName(weightGram + "g").sku(sku).price(new BigDecimal("65000"))
                .stockQuantity(100).weightGram(weightGram).build();
    }

    private ResultActions send(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder,
                               String token, Object body) throws Exception {
        return mockMvc.perform(builder
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }
}
