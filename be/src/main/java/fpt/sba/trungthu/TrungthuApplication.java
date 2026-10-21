package fpt.sba.trungthu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TrungthuApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrungthuApplication.class, args);
	}

}
