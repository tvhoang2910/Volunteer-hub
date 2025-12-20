package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Web MVC Configuration
 * Configures static resource handling for uploaded files
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /**
     * Configure resource handlers to serve static files from uploads directory
     * This allows access to uploaded images at /uploads/**
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path for uploads directory
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadLocation = "file:" + uploadPath.toString() + "/";

        // Serve uploaded files from uploads/ directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation)
                .setCachePeriod(3600); // Cache for 1 hour
    }
}
