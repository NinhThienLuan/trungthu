package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.JwtService;
import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.DailyCapacityRepository;
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

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
        "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc
class CapacityApiTests {

    @Autowired private MockMvc mvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository users;
    @Autowired private DailyCapacityRepository capacities;
    @MockitoBean private JavaMailSender mailSender;

    private final LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
    private User provider;
    private User customer;

    @BeforeEach
    void setUp() {
        provider = users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@shop.test").password("hash")
                .fullName("Baker").storeName("Oven").role(UserRole.PROVIDER).status(UserStatus.ACTIVE).build());
        customer = users.saveAndFlush(User.builder().email(UUID.randomUUID() + "@buyer.test").password("hash")
                .fullName("Buyer").role(UserRole.CUSTOMER).status(UserStatus.ACTIVE).build());
    }

    @Test
    void deliveryDayNeedsFreeBakeCapacityOnThePreviousDayAndLeadTime() throws Exception {
        LocalDate d = today.plusDays(5);
        capacities.saveAndFlush(DailyCapacity.builder().provider(provider).capacityDate(d.minusDays(1))
                .maxQuantity(10).reservedQuantity(0).build());
        capacities.saveAndFlush(DailyCapacity.builder().provider(provider).capacityDate(d)
                .maxQuantity(10).reservedQuantity(10).build());
        capacities.saveAndFlush(DailyCapacity.builder().provider(provider).capacityDate(today)
                .maxQuantity(10).reservedQuantity(0).build());

        // Công khai, không cần đăng nhập
        mvc.perform(get("/api/providers/{id}/available-dates", provider.getId())
                        .param("from", today.plusDays(1).toString()).param("to", d.plusDays(1).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(6))
                .andExpect(jsonPath("$.data[0].available").value(false)) // ngày nướng = hôm nay nhưng chưa đủ 3 ngày
                .andExpect(jsonPath("$.data[4].date").value(d.toString()))
                .andExpect(jsonPath("$.data[4].available").value(true))
                .andExpect(jsonPath("$.data[5].available").value(false)); // ngày nướng d đã kín
    }

    @Test
    void providerSetsRangeButCannotGoBelowReserved() throws Exception {
        LocalDate from = today.plusDays(2);
        capacities.saveAndFlush(DailyCapacity.builder().provider(provider).capacityDate(from)
                .maxQuantity(50).reservedQuantity(30).build());

        mvc.perform(put("/api/provider/capacities").header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"from\":\"%s\",\"to\":\"%s\",\"maxQuantity\":20}".formatted(from, from.plusDays(2))))
                .andExpect(status().isConflict());

        mvc.perform(put("/api/provider/capacities").header("Authorization", token(provider))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"from\":\"%s\",\"to\":\"%s\",\"maxQuantity\":80}".formatted(from, from.plusDays(2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(3));

        assertThat(capacities.findByProviderIdAndCapacityDate(provider.getId(), from).orElseThrow())
                .returns(80, DailyCapacity::getMaxQuantity).returns(30, DailyCapacity::getReservedQuantity);

        mvc.perform(get("/api/provider/capacities").header("Authorization", token(provider))
                        .param("from", from.toString()).param("to", from.plusDays(2).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[2].maxQuantity").value(80));

        mvc.perform(put("/api/provider/capacities").header("Authorization", token(customer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"from\":\"%s\",\"to\":\"%s\",\"maxQuantity\":80}".formatted(from, from)))
                .andExpect(status().isForbidden());
    }

    private String token(User user) {
        return "Bearer " + jwtService.generateAccessToken(user);
    }
}
