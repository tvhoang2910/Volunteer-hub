package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils.JwtUtil;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * JWT Authentication Filter.
 * Intercept mỗi request để validate JWT token và set authentication.
 * Extends OncePerRequestFilter để đảm bảo filter chỉ chạy một lần per request.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = parseJwt(request);

            logger.debug("[DEBUG] JWT from request: " + (jwt != null ? "found" : "not found"));

            if (jwt != null && jwtUtil.validateToken(jwt)) {
                String userId = jwtUtil.getUserIdFromToken(jwt);
                String email = jwtUtil.getEmailFromToken(jwt);
                String role = jwtUtil.getRoleFromToken(jwt);

                logger.debug("JWT validated for user: {}, userId: {}, role: {}", email, userId, role);
                System.out
                        .println("[DEBUG] JWT validated - userId: " + userId + ", email: " + email + ", role: " + role);

                // Tạo authorities từ role
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role));

                // Tạo authentication token với userId là principal
                // Principal có thể là userId (UUID string) để dễ dàng truy cập trong controller
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        UUID.fromString(userId), // principal là UUID
                        null, // credentials không cần thiết sau khi authenticated
                        authorities);

                // Set thêm details (có thể hữu ích cho logging/auditing)
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set authentication vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
                System.out.println("[DEBUG] Authentication set in SecurityContext");
            } else {
                System.out.println("[DEBUG] JWT not valid or not found");
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
            System.out.println("[DEBUG] Exception in JwtAuthenticationFilter: " + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Parse JWT token từ Authorization header hoặc cookies.
     * Header format: "Bearer <token>"
     * Cookie name: "jwt_token"
     * 
     * @param request HTTP request
     * @return JWT token string hoặc null nếu không có/không hợp lệ
     */
    private String parseJwt(HttpServletRequest request) {
        // First, try to get JWT from Authorization header
        String headerAuth = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith(BEARER_PREFIX)) {
            return headerAuth.substring(BEARER_PREFIX.length());
        }

        // If not found in header, try to get from cookies
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("jwt_token".equals(cookie.getName())) {
                    String token = cookie.getValue();
                    if (StringUtils.hasText(token)) {
                        return token;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Không filter các public endpoints (optional optimization).
     * NOTE: We should NOT skip JWT validation for endpoints that may need
     * authentication info even if they're publicly accessible.
     * The SecurityConfig already handles authorization - this filter should
     * still run to extract user info from valid tokens.
     */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath();

        // These auth endpoints require authentication - DO NOT skip
        if (path.equals("/api/auth/change-password")) {
            return false;
        }

        // Skip JWT validation only for truly public endpoints that never need user info
        return path.startsWith("/api/auth/") ||
                path.startsWith("/api/dashboard/") ||
                path.startsWith("/ui/") ||
                path.startsWith("/oauth2/") ||
                path.startsWith("/login/oauth2/");
    }
}
