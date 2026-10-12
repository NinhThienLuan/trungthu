package fpt.sba.trungthu.service.gateway;

import fpt.sba.trungthu.common.security.GoogleIdTokenVerifier;
import fpt.sba.trungthu.dto.request.AuthGatewayRequest;
import fpt.sba.trungthu.dto.response.AuthUserProfile;
import fpt.sba.trungthu.entity.enumeration.AuthProviderType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Component("googleAuthGateway")
@RequiredArgsConstructor
public class GoogleAuthGatewayImpl implements AuthGateway {

    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    @Override
    public AuthProviderType getProviderType() {
        return AuthProviderType.GOOGLE;
    }

    @Override
    public AuthUserProfile authenticate(AuthGatewayRequest request) {
        log.info("Authenticating via GoogleAuthGateway");

        if (!StringUtils.hasText(request.getIdToken())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google ID token is required");
        }

        Jwt googleToken = googleIdTokenVerifier.verify(request.getIdToken());
        if (!Boolean.TRUE.equals(googleToken.getClaimAsBoolean("email_verified"))) {
            log.warn("Google authentication rejected: email not verified");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Google email is not verified");
        }

        String email = googleToken.getClaimAsString("email");
        String fullName = googleToken.getClaimAsString("name");
        String subject = googleToken.getSubject();

        return AuthUserProfile.builder()
                .providerUserId(subject != null ? subject : email)
                .email(email)
                .fullName(fullName)
                .provider(AuthProviderType.GOOGLE)
                .build();
    }
}
