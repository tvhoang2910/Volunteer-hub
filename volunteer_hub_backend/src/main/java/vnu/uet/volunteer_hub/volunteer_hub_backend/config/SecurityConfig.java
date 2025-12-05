package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final CustomOAuth2UserService customOAuth2UserService;   // ⭐ THÊM DÒNG NÀY
    private final ClientRegistrationRepository clientRegistrationRepository;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers(
                        "/ui/**",
                        "/api/auth/**",
                        "/api/dashboard/**",
                        "/api/events",
                        "/api/posts/visible",
                        "/api/posts/{postId}",
                        "/api/posts/**",
                        "/api/comments/**",
                        "/api/users/**",
                        "/oauth2/**",
                        "/login/oauth2/**",
                        "/error"
                ).permitAll()

                .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()

                .requestMatchers("/api/admin/**").permitAll()

                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write(
                        "{\"data\":null,\"message\":\"Unauthorized\",\"detail\":\"Authentication required.\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write(
                        "{\"data\":null,\"message\":\"Forbidden\",\"detail\":\"Access denied.\"}");
                })
            )

            // ⭐ SỬA PHẦN NÀY ĐỂ DÙNG CUSTOM OAUTH2 USER SERVICE
                .oauth2Login(oauth2 -> {
                // Register custom AuthorizationRequestResolver to add prompt/select_account
                OAuth2AuthorizationRequestResolver resolver =
                    new vnu.uet.volunteer_hub.volunteer_hub_backend.config.CustomAuthorizationRequestResolver(
                        clientRegistrationRepository, "/oauth2/authorization");

                oauth2.authorizationEndpoint(endpoint -> endpoint.authorizationRequestResolver(resolver))
                      .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                      .successHandler(oAuth2AuthenticationSuccessHandler);
                });

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:8080"
        ));

        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
