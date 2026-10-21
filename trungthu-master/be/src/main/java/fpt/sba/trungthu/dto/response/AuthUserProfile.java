package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.AuthProviderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserProfile {
    private String providerUserId;
    private String email;
    private String fullName;
    private AuthProviderType provider;
}
