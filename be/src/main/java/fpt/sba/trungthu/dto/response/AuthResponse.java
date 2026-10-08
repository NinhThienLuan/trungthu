package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.User;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private String accessToken;
    private String tokenType;
    private long expiresInSeconds;
    private UserResponse user;

    public static AuthResponse from(String accessToken, long expiresInSeconds, User user) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresInSeconds(expiresInSeconds)
                .user(UserResponse.fromUserEntity(user))
                .build();
    }
}
