package fpt.sba.trungthu.common.data;

import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final String defaultPassword = "12345678";

    @Override
    public void run(String... args) {
        seedPlatformAdmin();
        seedSampleProvider();
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
        String sellerEmail = "seller@kinhdo.vn";
        if (userRepository.findByEmail(sellerEmail).isEmpty()) {
            User seller = User.builder()
                    .email(sellerEmail)
                    .password(passwordEncoder.encode(defaultPassword))
                    .fullName("Kinh Do Mooncake Store")
                    .phone("0902000002")
                    .role(UserRole.PROVIDER)
                    .storeName("Bánh Trung Thu Kinh Đô")
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(seller);
            log.info("Default Provider seeded: {}", sellerEmail);
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
                    .role(UserRole.CUSTOMER)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(buyer);
            log.info("Default Customer seeded: {}", buyerEmail);
        }
    }
}
