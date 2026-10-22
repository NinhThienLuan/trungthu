package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.security.GoogleIdTokenVerifier;
import fpt.sba.trungthu.common.security.JwtProperties;
import fpt.sba.trungthu.common.security.JwtService;
import fpt.sba.trungthu.common.util.AuthCookieHelper;
import fpt.sba.trungthu.dto.request.ChangePasswordRequest;
import fpt.sba.trungthu.dto.request.ForgotPasswordRequest;
import fpt.sba.trungthu.dto.request.LoginRequest;
import fpt.sba.trungthu.dto.request.RegisterRequest;
import fpt.sba.trungthu.dto.request.ResetPasswordRequest;
import fpt.sba.trungthu.dto.response.AuthResponse;
import fpt.sba.trungthu.dto.response.UserResponse;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.AuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import fpt.sba.trungthu.dto.request.AuthGatewayRequest;
import fpt.sba.trungthu.dto.response.AuthUserProfile;
import fpt.sba.trungthu.entity.enumeration.AuthProviderType;
import fpt.sba.trungthu.service.gateway.AuthGateway;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final fpt.sba.trungthu.repository.UserSocialAccountRepository userSocialAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthCookieHelper authCookieHelper;
    private final JavaMailSender mailSender;
    private final Map<String, AuthGateway> gateways;

    @Value("${spring.mail.username}")
    private String mailFrom;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private static final int PASSWORD_LENGTH = 10;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        log.info("Processing registration request for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists with this email");
        }

        if (request.getRole() == UserRole.PLATFORM_ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Platform admin cannot self-register");
        }

        if (request.getRole() == UserRole.PROVIDER) {
            if (!StringUtils.hasText(request.getStoreName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Store name is required for Provider account");
            }
            if (!StringUtils.hasText(request.getBankCode())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bank code is required for Provider account");
            }
            if (!StringUtils.hasText(request.getBankAccountNumber())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bank account number is required for Provider account");
            }
            if (!StringUtils.hasText(request.getBankAccountName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bank account name is required for Provider account");
            }
            validateBankCode(request.getBankCode());
        }

        String rawPassword = randomPassword();
        User savedUser = userRepository.save(request.toUserEntity(passwordEncoder.encode(rawPassword)));

        // Throwing here rolls back the insert, so a user never exists without having
        // received their password
        sendMail(savedUser.getEmail(), "Your Trung Thu account password",
                "Hello " + savedUser.getFullName() + ",\n\n"
                        + "Your account has been created.\n"
                        + "Email: " + savedUser.getEmail() + "\n"
                        + "Password: " + rawPassword + "\n\n"
                        + "Please log in and change your password (POST /api/auth/change-password).");

        log.info("Successfully registered user id: {}, email: {}", savedUser.getId(), savedUser.getEmail());
        return UserResponse.fromUserEntity(savedUser);
    }

    private void validateBankCode(String bankCode) {
        java.util.Set<String> validBankCodes = java.util.Set.of(
                "VCB", "TCB", "MB", "ACB", "VIB", "TPB", "STB",
                "BIDV", "VPB", "AGR", "OCB", "MSB", "SEAB", "SCB");
        if (!validBankCodes.contains(bankCode.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid bank code. Supported banks: " + String.join(", ", validBankCodes));
        }
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public AuthResponse authenticate(AuthGatewayRequest request, HttpServletResponse response) {
        if (request.getProvider() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provider type is required");
        }

        String gatewayBeanName = switch (request.getProvider()) {
            case LOCAL -> "localAuthGateway";
            case GOOGLE -> "googleAuthGateway";
        };

        AuthGateway gateway = gateways.get(gatewayBeanName);
        if (gateway == null) {
            log.error("Auth gateway bean not found for: {}", gatewayBeanName);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported auth provider");
        }

        AuthUserProfile profile = gateway.authenticate(request);

        User user;
        if (profile.getProvider() == AuthProviderType.LOCAL) {
            user = userRepository.findByEmail(profile.getEmail().trim().toLowerCase())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        } else {
            // Social Auth (GOOGLE, FACEBOOK, etc.) using UserSocialAccount mapping
            user = resolveSocialUser(profile);
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account has been disabled");
        }

        authCookieHelper.attachAuthCookies(response, user);
        String accessToken = jwtService.generateAccessToken(user);
        return AuthResponse.from(accessToken, jwtProperties.accessTokenExpMinutes() * 60, user);
    }

    private User resolveSocialUser(AuthUserProfile profile) {
        // 1. Check if this social identity is already linked to an existing user
        return userSocialAccountRepository
                .findByProviderAndProviderUserId(profile.getProvider(), profile.getProviderUserId())
                .map(fpt.sba.trungthu.entity.UserSocialAccount::getUser)
                .orElseGet(() -> {
                    // 2. Not linked yet. Find user by email or auto-provision a new CUSTOMER
                    String normalizedEmail = profile.getEmail().trim().toLowerCase();
                    User targetUser = userRepository.findByEmail(normalizedEmail)
                            .orElseGet(() -> userRepository.save(User.builder()
                                    .email(normalizedEmail)
                                    .password(passwordEncoder.encode(randomPassword()))
                                    .fullName(StringUtils.hasText(profile.getFullName()) ? profile.getFullName() : normalizedEmail)
                                    .role(UserRole.CUSTOMER)
                                    .status(UserStatus.ACTIVE)
                                    .build()));

                    // 3. Link this social identity to the user
                    fpt.sba.trungthu.entity.UserSocialAccount socialAccount = fpt.sba.trungthu.entity.UserSocialAccount.builder()
                            .user(targetUser)
                            .provider(profile.getProvider())
                            .providerUserId(profile.getProviderUserId())
                            .providerEmail(profile.getEmail())
                            .build();
                    userSocialAccountRepository.save(socialAccount);
                    log.info("Linked social account ({}: {}) to user: {}", 
                            profile.getProvider(), profile.getProviderUserId(), targetUser.getEmail());

                    return targetUser;
                });
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        // Unknown/disabled emails get the same silent 200, so this endpoint can't be
        // used to discover accounts
        userRepository.findByEmailAndStatus(request.getEmail().trim().toLowerCase(), UserStatus.ACTIVE).ifPresent(user -> {
            String token = jwtService.generatePasswordResetToken(user, passwordFingerprint(user));
            sendMail(user.getEmail(), "Reset your Trung Thu password",
                    "Hello " + user.getFullName() + ",\n\n"
                            + "We received a request to reset your password.\n"
                            + "Reset token: " + token + "\n\n"
                            + "Send it to POST /api/auth/reset-password together with your new password.\n"
                            + "The token expires in " + JwtService.PASSWORD_RESET_EXP_MINUTES
                            + " minutes and works only once.\n"
                            + "If you did not request this, ignore this email - your password stays the same.");
            log.info("Password reset email sent to {}", user.getEmail());
        });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Claims claims;
        try {
            claims = jwtService.parseClaims(request.getToken());
        } catch (JwtException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token is invalid or expired");
        }
        if (!"reset".equals(claims.get("typ", String.class))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token is invalid or expired");
        }

        User user = userRepository.findByEmailAndStatus(claims.getSubject(), UserStatus.ACTIVE)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token is invalid or expired"));

        if (!passwordFingerprint(user).equals(claims.get("pwd", String.class))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token has already been used");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private void sendMail(String to, String subject, String text) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(mailFrom);
            mail.setTo(to);
            mail.setSubject(subject);
            mail.setText(text);
            mailSender.send(mail);
        } catch (MailException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not send email, please try again later");
        }
    }

    // Short hash of the stored BCrypt hash: changes whenever the password changes,
    // reveals nothing usable
    private static String passwordFingerprint(User user) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(user.getPassword().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest, 0, 8);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String randomPassword() {
        StringBuilder sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            sb.append(PASSWORD_CHARS.charAt(RANDOM.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    @Override
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        log.info("Processing login request for email: {}", request.getEmail());
        AuthGatewayRequest gatewayRequest = AuthGatewayRequest.builder()
                .provider(AuthProviderType.LOCAL)
                .email(request.getEmail())
                .password(request.getPassword())
                .build();
        return authenticate(gatewayRequest, response);
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
            User user = userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE)
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
        User user = userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserResponse.fromUserEntity(user);
    }

    @Override
    public void logout(HttpServletResponse response) {
        authCookieHelper.clearAuthCookies(response);
    }
}
