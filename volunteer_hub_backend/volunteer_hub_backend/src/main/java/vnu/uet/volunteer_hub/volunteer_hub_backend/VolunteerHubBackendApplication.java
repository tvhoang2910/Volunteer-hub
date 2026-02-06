package vnu.uet.volunteer_hub.volunteer_hub_backend;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
@EnableAsync
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
public class VolunteerHubBackendApplication {

	public static void main(String[] args) {
		// Fix Windows timezone issue: Asia/Saigon is not recognized by PostgreSQL
		// Set JVM timezone to Asia/Ho_Chi_Minh before any database connection
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
		SpringApplication.run(VolunteerHubBackendApplication.class, args);
	}

	@PostConstruct
	public void init() {
		// Ensure timezone is set correctly after Spring context initialization
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
	}

}
