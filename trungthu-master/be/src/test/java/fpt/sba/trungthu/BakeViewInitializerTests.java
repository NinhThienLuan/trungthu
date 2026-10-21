package fpt.sba.trungthu;

import fpt.sba.trungthu.common.data.BakeViewInitializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
class BakeViewInitializerTests {
    @Autowired private BakeViewInitializer initializer;
    @Autowired private JdbcTemplate jdbcTemplate;

    @Test
    void canInitializeAgainWhenViewAlreadyExists() throws Exception {
        Long before = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM v_bake_lines", Long.class);
        initializer.run();
        initializer.run();
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM v_bake_lines", Long.class)).isEqualTo(before);
    }
}
