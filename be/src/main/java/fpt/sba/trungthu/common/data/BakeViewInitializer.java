package fpt.sba.trungthu.common.data;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.DependsOn;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@Order(0)
@DependsOn("entityManagerFactory")
@RequiredArgsConstructor
public class BakeViewInitializer implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        String query = new ClassPathResource("db/views/v_bake_lines.sql")
                .getContentAsString(StandardCharsets.UTF_8);
        jdbcTemplate.execute((ConnectionCallback<Void>) connection -> {
            String database = connection.getMetaData().getDatabaseProductName();
            String createView = switch (database) {
                case "Microsoft SQL Server" -> "CREATE OR ALTER VIEW v_bake_lines AS\n";
                case "H2" -> "CREATE OR REPLACE VIEW v_bake_lines AS\n";
                default -> throw new IllegalStateException("Unsupported database for v_bake_lines: " + database);
            };
            try (var statement = connection.createStatement()) {
                statement.execute(createView + query);
            }
            log.info("Initialized v_bake_lines for {}", database);
            return null;
        });
    }
}
