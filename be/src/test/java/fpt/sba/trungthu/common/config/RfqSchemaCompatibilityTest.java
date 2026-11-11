package fpt.sba.trungthu.common.config;

import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RfqSchemaCompatibilityTest {
    @Test
    void addsCakeCountToExistingRfqRowsAndCanRunAgain() throws Exception {
        JdbcDataSource source = new JdbcDataSource();
        source.setURL("jdbc:h2:mem:rfq_compat_" + UUID.randomUUID() + ";DB_CLOSE_DELAY=-1");
        try (Connection connection = source.getConnection(); Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE bulk_request (id INTEGER PRIMARY KEY)");
            statement.execute("INSERT INTO bulk_request (id) VALUES (1)");
            statement.execute("CREATE TABLE provider_quotation (id INTEGER PRIMARY KEY)");
            statement.execute("INSERT INTO provider_quotation (id) VALUES (1)");
            RfqSchemaCompatibility.ensureCakesPerBox(connection);
            RfqSchemaCompatibility.ensureCakesPerBox(connection);
            for (String table : RfqSchemaCompatibility.TABLES) {
                try (ResultSet result = statement.executeQuery("SELECT cakes_per_box FROM " + table + " WHERE id = 1")) {
                    assertThat(result.next()).isTrue();
                    assertThat(result.getInt(1)).isEqualTo(1);
                }
            }
        }
    }
}
