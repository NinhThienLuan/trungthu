package fpt.sba.trungthu.common.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GoogleIdTokenVerifierTest {

    private static final String CLIENT_ID = "our-app.apps.googleusercontent.com";
    private final OAuth2TokenValidator<Jwt> validator = GoogleIdTokenVerifier.validator(CLIENT_ID);

    private Jwt token(String iss, List<String> aud, Instant expiresAt) {
        return Jwt.withTokenValue("t")
                .header("alg", "RS256")
                .issuer(iss)
                .audience(aud)
                .subject("123")
                .issuedAt(expiresAt.minusSeconds(3600))
                .expiresAt(expiresAt)
                .build();
    }

    @Test
    void acceptsTokenIssuedByGoogleForOurClient() {
        Instant later = Instant.now().plusSeconds(600);
        assertThat(validator.validate(token("https://accounts.google.com", List.of(CLIENT_ID), later)).hasErrors()).isFalse();
        assertThat(validator.validate(token("accounts.google.com", List.of(CLIENT_ID), later)).hasErrors()).isFalse();
    }

    @Test
    void rejectsOtherAppWrongIssuerOrExpired() {
        Instant later = Instant.now().plusSeconds(600);
        assertThat(validator.validate(token("https://accounts.google.com", List.of("other-app"), later)).hasErrors()).isTrue();
        assertThat(validator.validate(token("https://evil.example.com", List.of(CLIENT_ID), later)).hasErrors()).isTrue();
        assertThat(validator.validate(token("https://accounts.google.com", List.of(CLIENT_ID),
                Instant.now().minusSeconds(3600))).hasErrors()).isTrue();
    }
}
