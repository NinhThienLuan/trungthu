package fpt.sba.trungthu.service.gateway;

import fpt.sba.trungthu.dto.request.AuthGatewayRequest;
import fpt.sba.trungthu.dto.response.AuthUserProfile;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.AuthProviderType;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Component("localAuthGateway")
@RequiredArgsConstructor
public class LocalAuthGatewayImpl implements AuthGateway {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthProviderType getProviderType() {
        return AuthProviderType.LOCAL;
    }

    @Override
    public AuthUserProfile authenticate(AuthGatewayRequest request) {
        log.info("Authenticating via LocalAuthGateway for email: {}", request.getEmail());

        if (request.getEmail() == null || request.getPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account has been disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Local authentication failed: invalid password for email: {}", request.getEmail());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return AuthUserProfile.builder()
                .providerUserId(user.getEmail())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .provider(AuthProviderType.LOCAL)
                .build();
    }
}
