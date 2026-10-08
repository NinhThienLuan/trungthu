package fpt.sba.trungthu.common.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.cookie")
public class CookieProperties {
    private boolean secure = false;
    private String sameSite = "Lax";
    private String domain;
}
