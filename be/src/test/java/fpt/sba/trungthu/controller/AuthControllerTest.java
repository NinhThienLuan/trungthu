package fpt.sba.trungthu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.sba.trungthu.common.util.AuthCookieHelper;
import fpt.sba.trungthu.dto.request.LoginRequest;
import fpt.sba.trungthu.dto.request.RegisterRequest;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.AuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JavaMailSender mailSender;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void testRegisterBuyerSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("newbuyer@example.com")
                    .fullName("New Buyer")
                .phone("0912345678")
                .role(UserRole.CUSTOMER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.email").value("newbuyer@example.com"))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"));
    }

    @Test
    void testRegisterMailsRandomPasswordThenUserChangesIt() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("Mailed@Example.com")
                .fullName("Mailed User")
                .role(UserRole.CUSTOMER)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        ArgumentCaptor<SimpleMailMessage> mail = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(mail.capture());
        assertThat(mail.getValue().getTo()).containsExactly("mailed@example.com");
        String mailedPassword = mail.getValue().getText().lines()
                .filter(l -> l.startsWith("Password: ")).findFirst().orElseThrow().substring("Password: ".length());
        assertThat(mailedPassword).hasSize(10);

        String token = loginAndGetToken("mailed@example.com", mailedPassword);

        // Wrong old password is rejected
        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\":\"wrong\",\"newPassword\":\"MyNewPass1\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\":\"" + mailedPassword + "\",\"newPassword\":\"MyNewPass1\"}"))
                .andExpect(status().isOk());

        loginAndGetToken("mailed@example.com", "MyNewPass1");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                LoginRequest.builder().email("mailed@example.com").password(mailedPassword).build())))
                .andExpect(status().isUnauthorized());

        // Not logged in -> cannot change password
        mockMvc.perform(post("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\":\"x\",\"newPassword\":\"MyNewPass2\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRegisterRollsBackWhenMailFails() throws Exception {
        doThrow(new MailSendException("SMTP down")).when(mailSender).send(any(SimpleMailMessage.class));
        RegisterRequest request = RegisterRequest.builder()
                .email("nomail@example.com")
                .fullName("No Mail")
                .role(UserRole.CUSTOMER)
                .build();
        String body = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isServiceUnavailable());

        // User was not saved, so registering again is not a "duplicate email" conflict
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void testGoogleLoginRedirectsToGoogle() throws Exception {
        mockMvc.perform(get("/oauth2/authorization/google"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", startsWith("https://accounts.google.com/o/oauth2/v2/auth")));
    }

    @Test
    void testGoogleLoginCreatesCustomerOnceAndSetsCookies() throws Exception {
        MockHttpServletResponse first = new MockHttpServletResponse();
        authService.loginWithGoogle("New.Google@Gmail.com", "Google User", first);
        assertThat(first.getHeaders("Set-Cookie")).anyMatch(c -> c.startsWith(AuthCookieHelper.ACCESS_COOKIE + "="));

        User created = userRepository.findByEmail("new.google@gmail.com").orElseThrow();
        assertThat(created.getRole()).isEqualTo(UserRole.CUSTOMER);
        assertThat(created.getFullName()).isEqualTo("Google User");

        // Second login reuses the account; existing seeded users can also sign in with Google
        authService.loginWithGoogle("new.google@gmail.com", "Google User", new MockHttpServletResponse());
        assertThat(userRepository.count()).isEqualTo(4); // 3 seeded + 1
        authService.loginWithGoogle("seller@kinhdo.vn", "Seller", new MockHttpServletResponse());
        assertThat(userRepository.findByEmail("seller@kinhdo.vn").orElseThrow().getRole()).isEqualTo(UserRole.PROVIDER);
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        String json = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                LoginRequest.builder().email(email).password(password).build())))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(json).get("data").get("accessToken").asText();
    }

    @Test
    void testRegisterSellerRequiresStoreName() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email("newseller@example.com")
                .fullName("New Seller")
                .phone("0912345679")
                .role(UserRole.PROVIDER)
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
