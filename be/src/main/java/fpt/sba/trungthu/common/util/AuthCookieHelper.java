package fpt.sba.trungthu.common.util;

import fpt.sba.trungthu.common.config.CookieProperties;
import fpt.sba.trungthu.common.security.JwtProperties;
import fpt.sba.trungthu.common.security.JwtService;
import fpt.sba.trungthu.entity.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AuthCookieHelper {

    public static final String ACCESS_COOKIE = "access_token";
    public static final String REFRESH_COOKIE = "refresh_token";

    private final JwtService jwtService;
    private final CookieProperties cookieProperties;
    private final JwtProperties jwtProperties;

    public void attachAuthCookies(HttpServletResponse response, User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        response.addHeader(HttpHeaders.SET_COOKIE,
                buildResponseCookie(ACCESS_COOKIE, accessToken, Duration.ofMinutes(jwtProperties.accessTokenExpMinutes())).toString());
        response.addHeader(HttpHeaders.SET_COOKIE,
                buildResponseCookie(REFRESH_COOKIE, refreshToken, Duration.ofDays(jwtProperties.refreshTokenExpDays())).toString());
    }

    public void attachAccessCookie(HttpServletResponse response, User user) {
        String accessToken = jwtService.generateAccessToken(user);
        response.addHeader(HttpHeaders.SET_COOKIE,
                buildResponseCookie(ACCESS_COOKIE, accessToken, Duration.ofMinutes(jwtProperties.accessTokenExpMinutes())).toString());
    }

    public void clearAuthCookies(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildResponseCookie(ACCESS_COOKIE, "", Duration.ZERO).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, buildResponseCookie(REFRESH_COOKIE, "", Duration.ZERO).toString());
    }

    public Optional<String> readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return Optional.of(cookie.getValue());
            }
        }
        return Optional.empty();
    }

    private ResponseCookie buildResponseCookie(String name, String value, Duration maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieProperties.isSecure())
                .sameSite(cookieProperties.getSameSite())
                .path("/")
                .maxAge(maxAge);

        if (cookieProperties.getDomain() != null && !cookieProperties.getDomain().isBlank()) {
            builder.domain(cookieProperties.getDomain());
        }

        return builder.build();
    }
}
