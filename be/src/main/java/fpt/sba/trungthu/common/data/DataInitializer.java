package fpt.sba.trungthu.common.data;

import fpt.sba.trungthu.entity.Subscription;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.demo-seed", havingValue = "true", matchIfMissing = true)
@Order(10)
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    private final String defaultPassword = "12345678";

    @Override
    public void run(String... args) {
        seedPlatformAdmin();
        seedSampleProvider();
        seedProvider("seller@dongkhanh.vn", "Đồng Khánh", "0902000011",
                "Bánh Trung Thu Đồng Khánh", "DONG KHANH", "1234567801");
        seedProvider("seller@givral.vn", "Givral", "0902000012",
                "Bánh Trung Thu Givral", "GIVRAL", "1234567802");
        seedSampleCustomer();
    }

    private void seedPlatformAdmin() {
        String adminEmail = "admin@trungthu.fpt.edu.vn";
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(defaultPassword))
                    .fullName("Platform Administrator")
                    .phone("0901000001")
                    .role(UserRole.PLATFORM_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("Default Platform Admin seeded: {}", adminEmail);
        }
    }

    private void seedSampleProvider() {
        seedProvider("seller@kinhdo.vn", "Kinh Do Mooncake Store", "0902000002",
                "Bánh Trung Thu Kinh Đô", "KINH DO MOONCAKE", "0123456789");
    }

    private void seedProvider(String email, String fullName, String phone, String storeName,
            String bankAccountName, String bankAccountNumber) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User seller = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(defaultPassword))
                    .fullName(fullName)
                    .phone(phone)
                    .role(UserRole.PROVIDER)
                    .storeName(storeName)
                    .isComplianceApproved(true)
                    .isSeasonActive(true)
                    .bankCode("VCB")
                    .bankAccountNumber(bankAccountNumber)
                    .bankAccountName(bankAccountName)
                    .status(UserStatus.ACTIVE)
                    .build();
            seller = userRepository.save(seller);
            subscriptionRepository.save(Subscription.builder()
                    .provider(seller)
                    .planName("MVP")
                    .price(BigDecimal.ZERO)
                    .startDate(LocalDate.of(2026, 1, 1))
                    .endDate(LocalDate.of(2026, 12, 31))
                    .maxProductsAllowed(100)
                    .status(SubscriptionStatus.ACTIVE)
                    .build());
            log.info("Default Provider seeded: {}", email);
        }
    }

    private void seedSampleCustomer() {
        String buyerEmail = "buyer@gmail.com";
        if (userRepository.findByEmail(buyerEmail).isEmpty()) {
            User buyer = User.builder()
                    .email(buyerEmail)
                    .password(passwordEncoder.encode(defaultPassword))
                    .fullName("Nguyễn Văn Mua")
                    .phone("0903000003")
                    .address("12 Lê Lợi, Quận 1, TP. Hồ Chí Minh")
                    .role(UserRole.CUSTOMER)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(buyer);
            log.info("Default Customer seeded: {}", buyerEmail);
        }
    }
}
