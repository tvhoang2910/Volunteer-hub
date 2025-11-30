package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl.CustomOAuth2UserService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl.CustomUserDetailService;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailService customUserDetailService;

    @Value("${app.oauth2.success-redirect-url:http://localhost:3000/oauth/callback}")
    private String oauth2SuccessRedirectUrl;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CustomOAuth2UserService customOAuth2UserService,
                          JwtTokenProvider jwtTokenProvider,
                          CustomUserDetailService customUserDetailService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customOAuth2UserService = customOAuth2UserService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.customUserDetailService = customUserDetailService;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true);
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedOrigin("http://127.0.0.1:3000");
        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(authz -> authz
                    .requestMatchers("/api/auth/**").permitAll()

                    // Mở toàn bộ endpoint OAuth2
                    .requestMatchers("/oauth2/**").permitAll()
                    .requestMatchers("/login/**").permitAll()
                    .requestMatchers("/login/oauth2/**").permitAll()
                    .requestMatchers("/oauth2/authorization/**").permitAll()

                    .requestMatchers(HttpMethod.GET, "/api/posts/visible").permitAll()
                    .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write(
                        "{\"data\":null,\"message\":\"Unauthorized\",\"detail\":\"Authentication required\"}");
                })
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler((request, response, authentication) -> {
                    String username = authentication.getName();
                    var userDetails = customUserDetailService.loadUserByUsername(username);
                    String token = jwtTokenProvider.generateToken(userDetails);

                    String target = oauth2SuccessRedirectUrl
                            + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);

                    logger.info("OAuth2 login success for user={}, redirecting to {}", username, target);
                    response.sendRedirect(target);
                })
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
