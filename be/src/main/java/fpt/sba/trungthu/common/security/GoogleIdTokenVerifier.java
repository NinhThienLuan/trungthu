package fpt.sba.trungthu.common.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.Set;

/**
 * Verifies a Google ID token sent by a frontend / mobile app (Google Sign-In button):
 * signature against Google's public keys, expiry, issuer, and that it was issued for OUR client id.
 */
@Slf4j
@Component
public class GoogleIdTokenVerifier {

    private static final String GOOGLE_JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> GOOGLE_ISSUERS = Set.of("accounts.google.com", "https://accounts.google.com");

    private final JwtDecoder decoder;

    public GoogleIdTokenVerifier(@Value("${spring.security.oauth2.client.registration.google.client-id}") String clientId) {
        NimbusJwtDecoder nimbus = NimbusJwtDecoder.withJwkSetUri(GOOGLE_JWKS_URI).build();
        nimbus.setJwtValidator(validator(clientId));
        this.decoder = nimbus;
    }

    public Jwt verify(String idToken) {
        try {
            return decoder.decode(idToken);
        } catch (JwtException e) {
            // Lý do thật (sai aud = GOOGLE_CLIENT_ID trên server khác client id của FE, hết hạn...) chỉ ghi log
            log.warn("Google ID token rejected: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
        }
    }

    // Without the audience check, an ID token issued to ANY other app could be replayed here to log in
    static OAuth2TokenValidator<Jwt> validator(String clientId) {
        return new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(),
                new JwtClaimValidator<String>("iss", GOOGLE_ISSUERS::contains),
                new JwtClaimValidator<Object>("aud", aud -> aud instanceof Collection<?> c
                        ? c.contains(clientId)
                        : clientId.equals(aud)));
    }
}
