package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    // Allow frontend URL to be configured via property. Default to Next.js dev
    // server.
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Security Headers
                .headers(headers -> headers
                        // X-Frame-Options: chống clickjacking
                        .frameOptions(frame -> frame.sameOrigin())
                        // X-Content-Type-Options: chống MIME sniffing
                        .contentTypeOptions(content -> {
                        })
                        // X-XSS-Protection: chống XSS (legacy browsers)
                        .xssProtection(xss -> xss.headerValue(
                                org.springframework.security.web.header.writers.XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                        // Referrer-Policy
                        .referrerPolicy(referrer -> referrer.policy(
                                org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        // Content-Security-Policy
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'self'; " +
                                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; "
                                        +
                                        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; "
                                        +
                                        "font-src 'self' https://fonts.gstatic.com; "
                                        +
                                        "img-src 'self' data: https:; " +
                                        "connect-src 'self' " + frontendUrl
                                        + ";")))
                // Stateless session - không lưu session trên server
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Auth endpoints that require authentication - must be before permitAll
                        .requestMatchers(HttpMethod.POST, "/api/auth/change-password").authenticated()
                        // Public endpoints - không cần authentication
                        .requestMatchers(
                                "/ui/**",
                                "/api/auth/login",
                                "/api/auth/signup",
                                "/api/auth/verify-email",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/refresh",
                                "/api/dashboard/**",
                                "/api/events/**",
                                "/api/registrations/**",
                                "/api/posts/visible",
                                "/api/posts/{postId}",
                                "/api/posts",
                                "/api/posts/**",
                                "/api/comments/**",
                                "/api/users/**",
                                "/api/search/autocomplete/**",
                                "/api/users/profile/**",
                                "/api/notifications/**",
                                "/api/upload/**",
                                "/oauth2/**",
                                "/login/oauth2/**")
                        .permitAll()
                        // GET /api/posts - cho phép anonymous nhưng có thêm info nếu
                        // authenticated
                        .requestMatchers(HttpMethod.GET, "/api/posts")
                        .permitAll()
                        // Allow check-in endpoint for events without authentication
                        .requestMatchers(HttpMethod.POST, "/api/events/*/check-in").permitAll()
                        // Admin endpoints - yêu cầu role ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Tất cả các request khác cần authenticated (bao gồm POST /api/posts)
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write(
                                    "{\"data\":null,\"message\":\"Unauthorized\",\"detail\":\"Authentication required. Please provide a valid JWT token in the Authorization header.\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write(
                                    "{\"data\":null,\"message\":\"Forbidden\",\"detail\":\"You don't have permission to access this resource.\"}");
                        }))
                // Thêm JWT filter chỉ cho những endpoint cần authentication
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2AuthenticationSuccessHandler));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // frontendUrl may be a comma-separated list, e.g.
        // http://localhost:3000,https://example.com
        var origins = java.util.Arrays.stream(frontendUrl.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(
                java.util.List.of("Authorization", "Content-Type", "Accept", "Origin",
                        "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(java.util.List.of("Authorization"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}