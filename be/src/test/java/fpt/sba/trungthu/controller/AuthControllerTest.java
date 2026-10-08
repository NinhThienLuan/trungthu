package fpt.sba.trungthu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.sba.trungthu.common.util.AuthCookieHelper;
import fpt.sba.trungthu.dto.request.LoginRequest;
import fpt.sba.trungthu.dto.request.RegisterRequest;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void testRegisterBuyerSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("newbuyer@example.com")
                .password("Password123!")
                .fullName("New Buyer")
                .phone("0912345678")
                .role(UserRole.BUYER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.email").value("newbuyer@example.com"))
                .andExpect(jsonPath("$.data.role").value("BUYER"));
    }

    @Test
    void testRegisterSellerRequiresStoreName() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("newseller@example.com")
                .password("Password123!")
                .fullName("New Seller")
                .phone("0912345679")
                .role(UserRole.SELLER)
                .storeName("")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLoginSuccessAndAccessProtectedEndpoint() throws Exception {
        // Initial seeded admin: admin@trungthu.fpt.edu.vn / 12345678
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@trungthu.fpt.edu.vn")
                .password("12345678")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().exists(AuthCookieHelper.ACCESS_COOKIE))
                .andExpect(cookie().exists(AuthCookieHelper.REFRESH_COOKIE))
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.role").value("PLATFORM_ADMIN"))
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        String accessToken = objectMapper.readTree(responseJson).get("data").get("accessToken").asText();
        Cookie accessCookie = result.getResponse().getCookie(AuthCookieHelper.ACCESS_COOKIE);

        // Access /api/auth/me via Bearer header
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.email").value("admin@trungthu.fpt.edu.vn"))
                .andExpect(jsonPath("$.data.role").value("PLATFORM_ADMIN"));

        // Access /api/auth/me via Cookie
        mockMvc.perform(get("/api/auth/me")
                        .cookie(accessCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("admin@trungthu.fpt.edu.vn"));
    }

    @Test
    void testLoginWithInvalidPassword() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@trungthu.fpt.edu.vn")
                .password("WrongPassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRefreshTokenFlow() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("buyer@gmail.com")
                .password("12345678")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie refreshCookie = loginResult.getResponse().getCookie(AuthCookieHelper.REFRESH_COOKIE);

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(cookie().exists(AuthCookieHelper.ACCESS_COOKIE));
    }

    @Test
    void testLogoutClearsCookies() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(cookie().maxAge(AuthCookieHelper.ACCESS_COOKIE, 0))
                .andExpect(cookie().maxAge(AuthCookieHelper.REFRESH_COOKIE, 0));
    }

    @Test
    void testUnauthorizedAccessToMeWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Unauthorized access"));
    }
}
