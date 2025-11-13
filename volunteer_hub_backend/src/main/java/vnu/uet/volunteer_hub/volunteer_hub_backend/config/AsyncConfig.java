package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Configuration để enable asynchronous method execution trong Spring.
 * Sử dụng cho các tác vụ như gửi email, logging, notifications.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Tạo ThreadPoolTaskExecutor để xử lý các @Async methods.
     * 
     * @return configured executor
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}
