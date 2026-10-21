package fpt.sba.trungthu.dto.request;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    private String refreshToken;
}
