package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseBootstrap {

    @Bean
    CommandLineRunner initDatabase(JdbcTemplate jdbc) {
        return args -> {

            // 1. Enable pg_trgm
            jdbc.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm");

            // 2. DROP acronym column safely if it exists (from old versions)
            jdbc.execute("""
                        ALTER TABLE users
                        DROP COLUMN IF EXISTS acronym
                    """);

            // 3. TRGM index — USERS (name)
            jdbc.execute("""
                        CREATE INDEX IF NOT EXISTS users_name_trgm_idx
                        ON users USING gin (name gin_trgm_ops)
                    """);

            // 4. TRGM index — POSTS (content)
            jdbc.execute("""
                        CREATE INDEX IF NOT EXISTS posts_content_trgm_idx
                        ON posts USING gin (content gin_trgm_ops)
                    """);

            // 5. TRGM index — EVENTS (title)
            jdbc.execute("""
                        CREATE INDEX IF NOT EXISTS events_title_trgm_idx
                        ON events USING gin (title gin_trgm_ops)
                    """);
        };
    }
}
