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
import fpt.sba.trungthu.dto.request.VerifyOtpRequest;
import fpt.sba.trungthu.dto.response.AuthResponse;
import fpt.sba.trungthu.dto.response.UserResponse;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.VerificationToken;
import fpt.sba.trungthu.entity.enumeration.VerificationTokenType;
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
import java.time.Instant;
import java.time.LocalDateTime;
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

    private final fpt.sba.trungthu.repository.VerificationTokenRepository verificationTokens;

    @Value("${spring.mail.username}")
    private String mailFrom;

    @Value("${spring.mail.from-name:Nguyệt Viên Đài}")
    private String mailFromName;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private static final int OTP_EXPIRE_MINUTES = 10;
    private static final int OTP_RESEND_COOLDOWN_SECONDS = 60;
    private static final int OTP_MAX_FAILED_ATTEMPTS = 5;
    private static final String MSG_EMAIL_NOT_FOUND = "Email không tồn tại. Bạn chưa có tài khoản? Đăng ký ngay";
    private static final String MSG_OTP_WRONG = "Mã OTP không đúng";
    private static final String MSG_OTP_EXPIRED = "Mã đã hết hạn. Vui lòng gửi lại";

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private static final int PASSWORD_LENGTH = 10;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        log.info("Processing registration request for email: {}", request.getEmail());

        // Chuẩn hoá trước khi kiểm tra trùng: entity lưu email chữ thường
        request.setEmail(request.getEmail().trim().toLowerCase());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký");
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

        String temporaryPassword = temporaryPassword();
        User user = request.toUserEntity(passwordEncoder.encode(temporaryPassword));
        user.setRequirePasswordChange(true);
        User savedUser = userRepository.save(user);

        // Gửi mail lỗi -> ném lỗi -> rollback insert: không có tài khoản nào thiếu mật khẩu
        sendMail(savedUser.getEmail(), "Tài khoản Nguyệt Viên Đài của bạn",
                "Xin chào " + savedUser.getFullName() + ",\n\n"
                        + "Tài khoản của bạn đã được tạo thành công!\n\n"
                        + "Thông tin đăng nhập:\n"
                        + "- Email: " + savedUser.getEmail() + "\n"
                        + "- Mật khẩu tạm: " + temporaryPassword + "\n"
                        + "- Vai trò: " + roleLabel(savedUser.getRole()) + "\n\n"
                        + "LƯU Ý QUAN TRỌNG:\n"
                        + "Vui lòng đăng nhập và đổi mật khẩu ngay ở lần đăng nhập đầu tiên.\n\n"
                        + "Link đổi mật khẩu: " + frontendUrl + "/change-password\n\n"
                        + "Trân trọng,\nNguyệt Viên Đài");

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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới phải khác mật khẩu hiện tại");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setRequirePasswordChange(false);
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
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailAndStatus(request.getEmail().trim().toLowerCase(), UserStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, MSG_EMAIL_NOT_FOUND));

        verificationTokens.findFirstByUserIdAndTokenTypeAndUsedAtIsNullOrderByCreatedAtDesc(
                        user.getId(), VerificationTokenType.PASSWORD_RESET)
                .filter(last -> last.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(OTP_RESEND_COOLDOWN_SECONDS)))
                .ifPresent(last -> {
                    throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                            "Vui lòng đợi " + OTP_RESEND_COOLDOWN_SECONDS + " giây trước khi gửi lại mã");
                });

        // Mỗi lần gửi chỉ còn đúng một mã hiệu lực
        verificationTokens.deleteByUserIdAndTokenTypeAndUsedAtIsNull(user.getId(), VerificationTokenType.PASSWORD_RESET);
        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        verificationTokens.save(VerificationToken.builder()
                .user(user)
                .tokenType(VerificationTokenType.PASSWORD_RESET)
                .tokenHash(sha256(otp))
                .expiresAt(Instant.now().plusSeconds(OTP_EXPIRE_MINUTES * 60L))
                .build());

        sendMail(user.getEmail(), "Mã xác thực tài khoản Nguyệt Viên Đài",
                "Xin chào " + user.getFullName() + ",\n\n"
                        + "Mã OTP của bạn là: " + otp + "\n\n"
                        + "Mã này có hiệu lực trong " + OTP_EXPIRE_MINUTES + " phút.\n\n"
                        + "Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.\n\n"
                        + "Trân trọng,\nNguyệt Viên Đài");
        log.info("Password reset OTP sent to {}", user.getEmail());
    }

    // Nhập sai phải giữ lại số lần sai -> không rollback khi ném ResponseStatusException
    @Override
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void verifyOtp(VerifyOtpRequest request) {
        requireValidOtp(request.getEmail(), request.getOtp());
    }

    @Override
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void resetPassword(ResetPasswordRequest request) {
        VerificationToken token = requireValidOtp(request.getEmail(), request.getOtp());
        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setRequirePasswordChange(false);
        token.setUsedAt(Instant.now());
        userRepository.save(user);
        verificationTokens.save(token);
    }

    /** OTP đúng, chưa dùng, chưa hết hạn, chưa vượt số lần nhập sai. Sai -> tăng failedAttempts. */
    private VerificationToken requireValidOtp(String email, String otp) {
        User user = userRepository.findByEmailAndStatus(email.trim().toLowerCase(), UserStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, MSG_OTP_WRONG));
        VerificationToken token = verificationTokens
                .findFirstByUserIdAndTokenTypeAndUsedAtIsNullOrderByCreatedAtDesc(user.getId(),
                        VerificationTokenType.PASSWORD_RESET)
                .filter(t -> t.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, MSG_OTP_EXPIRED));
        if (token.getFailedAttempts() >= OTP_MAX_FAILED_ATTEMPTS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Bạn đã nhập sai quá " + OTP_MAX_FAILED_ATTEMPTS + " lần. Vui lòng gửi lại mã");
        }
        if (!MessageDigest.isEqual(sha256(otp).getBytes(StandardCharsets.US_ASCII),
                token.getTokenHash().getBytes(StandardCharsets.US_ASCII))) {
            token.setFailedAttempts(token.getFailedAttempts() + 1);
            verificationTokens.save(token);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, MSG_OTP_WRONG);
        }
        return token;
    }

    private void sendMail(String to, String subject, String text) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(mailFromName + " <" + mailFrom + ">");
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

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    /** Mật khẩu tạm khi đăng ký: TempPass#{năm}{3 chữ hoa}{3 số}, vd TempPass#2026ABC123 */
    private static String temporaryPassword() {
        StringBuilder sb = new StringBuilder("TempPass#").append(java.time.Year.now().getValue());
        for (int i = 0; i < 3; i++) sb.append((char) ('A' + RANDOM.nextInt(26)));
        for (int i = 0; i < 3; i++) sb.append(RANDOM.nextInt(10));
        return sb.toString();
    }

    private static String roleLabel(UserRole role) {
        return switch (role) {
            case CUSTOMER -> "Khách hàng";
            case PROVIDER -> "Nhà cung cấp";
            case PLATFORM_ADMIN -> "Quản trị sàn";
        };
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
