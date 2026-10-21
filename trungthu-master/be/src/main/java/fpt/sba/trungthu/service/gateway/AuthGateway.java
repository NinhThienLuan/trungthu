package fpt.sba.trungthu.service.gateway;

import fpt.sba.trungthu.dto.request.AuthGatewayRequest;
import fpt.sba.trungthu.dto.response.AuthUserProfile;
import fpt.sba.trungthu.entity.enumeration.AuthProviderType;

public interface AuthGateway {
    AuthProviderType getProviderType();
    AuthUserProfile authenticate(AuthGatewayRequest request);
}
