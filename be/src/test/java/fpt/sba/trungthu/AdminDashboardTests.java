package fpt.sba.trungthu;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.controller.AdminDashboardController;
import fpt.sba.trungthu.dto.response.AdminDashboardResponse;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.AdminDashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
class AdminDashboardTests {

    @Autowired
    private AdminDashboardController dashboardController;

    @Autowired
    private AdminDashboardService dashboardService;

    @Autowired
    private UserRepository users;

    @MockitoBean
    private SecurityContextService security;

    @Test
    @WithMockUser(roles = "PLATFORM_ADMIN")
    void canRetrieveAdminDashboardMetrics() {
        User admin = users.save(User.builder()
                .email("admin-" + UUID.randomUUID() + "@example.com")
                .password("hash")
                .fullName("Platform Admin")
                .role(UserRole.PLATFORM_ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        users.save(User.builder()
                .email("provider-" + UUID.randomUUID() + "@example.com")
                .password("hash")
                .fullName("Test Provider")
                .role(UserRole.PROVIDER)
                .status(UserStatus.ACTIVE)
                .isComplianceApproved(true)
                .isSeasonActive(true)
                .build());

        when(security.getCurrentUser()).thenReturn(admin);

        var response = dashboardController.getDashboard();
        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();

        AdminDashboardResponse data = response.getBody().getData();
        assertThat(data).isNotNull();
        assertThat(data.getTotalProviders()).isGreaterThanOrEqualTo(1);
        assertThat(data.getApprovedProviders()).isGreaterThanOrEqualTo(1);
        assertThat(data.getOrdersByStatus()).isNotNull();
    }
}
