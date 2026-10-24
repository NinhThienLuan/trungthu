package fpt.sba.trungthu;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/** README 3.2–3.3: đăng ký -> mật khẩu tạm -> bắt đổi; quên mật khẩu bằng OTP 6 số */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
        "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc
class PasswordFlowTests {

    private static final String NEW_PASSWORD = "Moon#2026ok";

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper json;
    @MockitoBean private JavaMailSender mailSender;

    @Test
    void registeredMemberGetsTemporaryPasswordAndMustChangeIt() throws Exception {
        String email = UUID.randomUUID().toString().substring(0, 8) + "@Buyer.Test"; // chữ hoa: BE phải chuẩn hoá
        assertThat(call(post("/api/auth/register"), """
                {"email":"%s","fullName":"Nguyễn Văn Khách","phone":"0912345678","role":"CUSTOMER"}""".formatted(email), null)
                .getStatus()).isEqualTo(201);
        String temp = find(lastMail().getText(), "Mật khẩu tạm: (\\S+)");
        assertThat(temp).matches("TempPass#\\d{4}[A-Z]{3}\\d{3}");
        assertThat(lastMail().getFrom()).contains("<");

        // Đăng ký lại cùng email khác hoa/thường -> 409, không phải lỗi 500 từ ràng buộc unique
        assertThat(call(post("/api/auth/register"), """
                {"email":"%s","fullName":"Trùng","phone":"0912345679","role":"CUSTOMER"}""".formatted(email.toLowerCase()), null)
                .getStatus()).isEqualTo(409);

        JsonNode login = body(call(post("/api/auth/login"), credentials(email, temp), null));
        assertThat(login.at("/data/user/requirePasswordChange").asBoolean()).isTrue();
        String token = login.at("/data/accessToken").asText();

        assertThat(call(post("/api/auth/change-password"), change(temp, "yeu123"), token).getStatus())
                .as("mật khẩu yếu").isEqualTo(400);
        MockHttpServletResponse wrongOld = call(post("/api/auth/change-password"), change("Sai#2026xx", NEW_PASSWORD), token);
        assertThat(wrongOld.getStatus()).isEqualTo(400);
        assertThat(wrongOld.getContentAsString(StandardCharsets.UTF_8)).contains("Mật khẩu hiện tại không đúng");
        assertThat(call(post("/api/auth/change-password"), change(temp, NEW_PASSWORD), token).getStatus()).isEqualTo(200);

        JsonNode again = body(call(post("/api/auth/login"), credentials(email, NEW_PASSWORD), null));
        assertThat(again.at("/data/user/requirePasswordChange").asBoolean()).isFalse();
    }

    @Test
    void forgotPasswordWithOtpIsSingleUseAndRejectsUnknownEmail() throws Exception {
        MockHttpServletResponse unknown = call(post("/api/auth/forgot-password"),
                "{\"email\":\"nobody-" + UUID.randomUUID() + "@x.test\"}", null);
        assertThat(unknown.getStatus()).isEqualTo(404);
        assertThat(unknown.getContentAsString(StandardCharsets.UTF_8)).contains("Email không tồn tại");

        String email = "buyer@gmail.com"; // tài khoản seed
        assertThat(call(post("/api/auth/forgot-password"), "{\"email\":\"" + email + "\"}", null).getStatus()).isEqualTo(200);
        String otp = find(lastMail().getText(), "Mã OTP của bạn là: (\\d{6})");
        assertThat(call(post("/api/auth/forgot-password"), "{\"email\":\"" + email + "\"}", null).getStatus())
                .as("gửi lại trong 60 giây").isEqualTo(429);

        String wrong = otp.equals("000000") ? "111111" : "000000";
        assertThat(call(post("/api/auth/verify-otp"), otpBody(email, wrong), null).getContentAsString(StandardCharsets.UTF_8))
                .contains("Mã OTP không đúng");
        assertThat(call(post("/api/auth/verify-otp"), otpBody(email, otp), null).getStatus()).isEqualTo(200);

        assertThat(call(post("/api/auth/reset-password"), reset(email, otp, "yeu"), null).getStatus()).isEqualTo(400);
        assertThat(call(post("/api/auth/reset-password"), reset(email, otp, NEW_PASSWORD), null).getStatus()).isEqualTo(200);
        assertThat(call(post("/api/auth/login"), credentials(email, NEW_PASSWORD), null).getStatus()).isEqualTo(200);
        assertThat(call(post("/api/auth/reset-password"), reset(email, otp, "Other#2026ok"), null)
                .getContentAsString(StandardCharsets.UTF_8)).as("OTP chỉ dùng một lần").contains("Mã đã hết hạn");
    }

    @Test
    void otpLocksAfterFiveWrongAttempts() throws Exception {
        String email = "seller@givral.vn";
        call(post("/api/auth/forgot-password"), "{\"email\":\"" + email + "\"}", null);
        String otp = find(lastMail().getText(), "Mã OTP của bạn là: (\\d{6})");
        String wrong = otp.equals("000000") ? "111111" : "000000";
        for (int i = 0; i < 5; i++) call(post("/api/auth/verify-otp"), otpBody(email, wrong), null);
        assertThat(call(post("/api/auth/verify-otp"), otpBody(email, otp), null).getContentAsString(StandardCharsets.UTF_8))
                .contains("nhập sai quá");
    }

    private SimpleMailMessage lastMail() {
        ArgumentCaptor<SimpleMailMessage> mail = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, atLeastOnce()).send(mail.capture());
        return mail.getValue();
    }

    private static String find(String text, String regex) {
        Matcher m = Pattern.compile(regex).matcher(text);
        assertThat(m.find()).as(text).isTrue();
        return m.group(1);
    }

    private MockHttpServletResponse call(MockHttpServletRequestBuilder req, String body, String bearer) throws Exception {
        if (bearer != null) req.header("Authorization", "Bearer " + bearer);
        return mvc.perform(req.contentType(MediaType.APPLICATION_JSON).content(body.getBytes(StandardCharsets.UTF_8)))
                .andReturn().getResponse();
    }

    private JsonNode body(MockHttpServletResponse res) throws Exception {
        String text = res.getContentAsString(StandardCharsets.UTF_8);
        assertThat(res.getStatus()).as(text).isEqualTo(200);
        return json.readTree(text);
    }

    private static String credentials(String email, String password) {
        return "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password);
    }

    private static String change(String oldPassword, String newPassword) {
        return "{\"oldPassword\":\"%s\",\"newPassword\":\"%s\"}".formatted(oldPassword, newPassword);
    }

    private static String otpBody(String email, String otp) {
        return "{\"email\":\"%s\",\"otp\":\"%s\"}".formatted(email, otp);
    }

    private static String reset(String email, String otp, String newPassword) {
        return "{\"email\":\"%s\",\"otp\":\"%s\",\"newPassword\":\"%s\"}".formatted(email, otp, newPassword);
    }
}
