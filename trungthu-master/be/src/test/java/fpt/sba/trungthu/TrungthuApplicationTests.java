package fpt.sba.trungthu;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1")
class TrungthuApplicationTests {

	@Test
	void contextLoads() {
	}

}
