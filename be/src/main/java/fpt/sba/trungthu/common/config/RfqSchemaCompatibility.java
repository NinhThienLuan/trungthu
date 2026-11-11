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

    /** Cả yêu cầu báo giá lẫn báo giá đều có cakes_per_box NOT NULL; thiếu ở bảng nào cũng làm RFQ trả 500 */
    static final String[] TABLES = {"bulk_request", "provider_quotation"};

    static void ensureCakesPerBox(Connection connection) throws Exception {
        for (String table : TABLES) {
            ensureCakesPerBox(connection, table);
        }
    }

    static void ensureCakesPerBox(Connection connection, String table) throws Exception {
        try (Statement statement = connection.createStatement();
                ResultSet result = statement.executeQuery("SELECT * FROM " + table + " WHERE 1 = 0")) {
            ResultSetMetaData columns = result.getMetaData();
            for (int i = 1; i <= columns.getColumnCount(); i++) {
                if ("cakes_per_box".equalsIgnoreCase(columns.getColumnName(i))) return;
            }
        } catch (java.sql.SQLException missingTable) {
            return; // Bảng chưa tạo (DB mới): Hibernate/Flyway sẽ tạo kèm cột
        }
        String database = connection.getMetaData().getDatabaseProductName().toLowerCase();
        String sql = database.contains("sql server")
                ? "IF COL_LENGTH('" + table + "', 'cakes_per_box') IS NULL "
                        + "ALTER TABLE " + table + " ADD cakes_per_box INT NOT NULL DEFAULT 1"
                : "ALTER TABLE " + table + " ADD COLUMN IF NOT EXISTS cakes_per_box INTEGER NOT NULL DEFAULT 1";
        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
        log.warn("Added missing {}.cakes_per_box column for pre-Flyway database", table);
    }
}
