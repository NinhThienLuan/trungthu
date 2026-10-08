package fpt.sba.trungthu.service.serviceImpl;

import fpt.sba.trungthu.common.security.JwtProperties;
import fpt.sba.trungthu.common.security.JwtService;
import fpt.sba.trungthu.common.util.AuthCookieHelper;
import fpt.sba.trungthu.dto.request.LoginRequest;
import fpt.sba.trungthu.dto.request.RegisterRequest;
import fpt.sba.trungthu.dto.response.AuthResponse;
import fpt.sba.trungthu.dto.response.UserResponse;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.AuthService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthCookieHelper authCookieHelper;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        log.info("Processing registration request for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists with this email");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number is already registered");
        }

        if (request.getRole() == UserRole.SELLER && !StringUtils.hasText(request.getStoreName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Store name is required for Seller account");
        }

        User user = request.toUserEntity(passwordEncoder);
        User savedUser = userRepository.save(user);
        log.info("Successfully registered user id: {}, email: {}", savedUser.getId(), savedUser.getEmail());

        return UserResponse.fromUserEntity(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        log.info("Processing login request for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!user.isStatus()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account has been disabled");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        authCookieHelper.attachAuthCookies(response, user);
        String accessToken = jwtService.generateAccessToken(user);

        return AuthResponse.from(accessToken, jwtProperties.accessTokenExpMinutes() * 60, user);
    }

    @Override
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response, String explicitRefreshToken) {
        String token = explicitRefreshToken;

        if (!StringUtils.hasText(token)) {
            token = authCookieHelper.readCookie(request, AuthCookieHelper.REFRESH_COOKIE).orElse(null);
        }

        if (!StringUtils.hasText(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No refresh token provided");
        }

        try {
            Claims claims = jwtService.parseClaims(token);
            String typ = claims.get("typ", String.class);
            if (!"refresh".equals(typ)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Provided token is not a refresh token");
            }

            String email = claims.getSubject();
            User user = userRepository.findByEmailAndStatusTrue(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

            authCookieHelper.attachAccessCookie(response, user);
            String newAccessToken = jwtService.generateAccessToken(user);

            return AuthResponse.from(newAccessToken, jwtProperties.accessTokenExpMinutes() * 60, user);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Failed to refresh token: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is invalid or expired");
        }
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmailAndStatusTrue(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserResponse.fromUserEntity(user);
    }

    @Override
    public void logout(HttpServletResponse response) {
        authCookieHelper.clearAuthCookies(response);
    }
}
