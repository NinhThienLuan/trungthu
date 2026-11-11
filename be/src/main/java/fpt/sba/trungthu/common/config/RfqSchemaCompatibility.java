package fpt.sba.trungthu.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;

/**
 * Older deployments used Hibernate schema update without Flyway. Adding a NOT NULL column
 * to a table with existing RFQs can fail during Hibernate startup, leaving the app running
 * but RFQ reads and writes returning 500. Flyway V4 remains the primary migration.
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class RfqSchemaCompatibility implements ApplicationRunner {
    private final DataSource dataSource;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            ensureCakesPerBox(connection);
        }
    }

    static void ensureCakesPerBox(Connection connection) throws Exception {
        try (Statement statement = connection.createStatement();
                ResultSet result = statement.executeQuery("SELECT * FROM bulk_request WHERE 1 = 0")) {
            ResultSetMetaData columns = result.getMetaData();
            for (int i = 1; i <= columns.getColumnCount(); i++) {
                if ("cakes_per_box".equalsIgnoreCase(columns.getColumnName(i))) return;
            }
        }
        String database = connection.getMetaData().getDatabaseProductName().toLowerCase();
        String sql = database.contains("sql server")
                ? "IF COL_LENGTH('bulk_request', 'cakes_per_box') IS NULL "
                        + "ALTER TABLE bulk_request ADD cakes_per_box INT NOT NULL DEFAULT 1"
                : "ALTER TABLE bulk_request ADD COLUMN IF NOT EXISTS cakes_per_box INTEGER NOT NULL DEFAULT 1";
        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
        log.warn("Added missing bulk_request.cakes_per_box column for pre-Flyway database");
    }
}
