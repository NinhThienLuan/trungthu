package fpt.sba.trungthu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.sba.trungthu.dto.request.LoginRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ProviderControllerTest {

    private static final String SELLER = "seller@kinhdo.vn";
    private static final String BUYER = "buyer@gmail.com";

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void testGetAndUpdateStoreProfile() throws Exception {
        String token = login(SELLER);

        // Lấy profile gian hàng
        mockMvc.perform(get("/api/provider/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.storeName").value("Bánh Trung Thu Kinh Đô"))
                .andExpect(jsonPath("$.data.isSeasonActive").value(true));

        // Cập nhật profile gian hàng
        mockMvc.perform(put("/api/provider/profile")
                        .header("Authorization", "Bearer " + token)
                        .param("storeName", "Kinh Đô Bakery Premium")
                        .param("address", "123 Nguyễn Huệ, Q1, HCM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.storeName").value("Kinh Đô Bakery Premium"))
                .andExpect(jsonPath("$.data.address").value("123 Nguyễn Huệ, Q1, HCM"));

        // Bật/tắt trạng thái mùa vụ
        mockMvc.perform(patch("/api/provider/season-active")
                        .header("Authorization", "Bearer " + token)
                        .param("isActive", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isSeasonActive").value(false));
    }

    @Test
    void testBuyerCannotAccessProviderEndpoints() throws Exception {
        String buyerToken = login(BUYER);

        mockMvc.perform(get("/api/provider/profile").header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isForbidden());
    }

    private String login(String email) throws Exception {
        String json = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                LoginRequest.builder().email(email).password("12345678").build())))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json).get("data").get("accessToken").asText();
    }
}
