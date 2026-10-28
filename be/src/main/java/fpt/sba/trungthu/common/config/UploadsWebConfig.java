package fpt.sba.trungthu.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/** Phục vụ file do LocalStorageServiceImpl lưu (app.storage.base-path) tại /uploads/**. Quyền xem đặt ở WebSecurityConfig. */
@Configuration
public class UploadsWebConfig implements WebMvcConfigurer {

    @Value("${app.storage.base-path:uploads}")
    private String basePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(Paths.get(basePath).toAbsolutePath().toUri().toString());
    }
}
