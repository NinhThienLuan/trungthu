package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.enumeration.AuthProviderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthGatewayRequest {
    private AuthProviderType provider;
    private String email;
    private String password;
    private String idToken;
}
