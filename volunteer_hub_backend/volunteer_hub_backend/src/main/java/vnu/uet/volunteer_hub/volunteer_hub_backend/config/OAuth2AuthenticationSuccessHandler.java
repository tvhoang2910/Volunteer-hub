package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils.JwtUtil;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;

import java.io.IOException;

/**
 * Custom OAuth2 Success Handler để generate JWT token sau khi đăng nhập Google
 * thành công.
 * Token sẽ được truyền về frontend qua URL parameter.
 */
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.oauth2.redirect-path:/oauth2/callback}")
    private String oauth2RedirectPath;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect.");
            return;
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null) {
            logger.error("Email not found in OAuth2 user attributes");
            response.sendRedirect(frontendUrl + "/login?error=email_not_found");
            return;
        }

        try {
            // Tìm user trong database
            User user = userRepository.findByEmailIgnoreCaseWithRoleOptional(email)
                    .orElse(null);

            if (user == null) {
                logger.error("User not found in database after OAuth2 login: {}", email);
                response.sendRedirect(frontendUrl + "/login?error=user_not_found");
                return;
            }

            // Lấy role của user
            String role = user.getRoles().stream()
                    .findFirst()
                    .map(r -> r.getRoleName())
                    .orElse("VOLUNTEER");

            // Generate JWT token
            String token = jwtUtil.generateToken(
                    user.getId().toString(),
                    user.getEmail(),
                    role);

            logger.info("✅ OAuth2 login successful for user: {}", email);

            // Set JWT token in HttpOnly, Secure cookie (SameSite via header)
            jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("jwt_token", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(true); // Chỉ gửi qua HTTPS
            cookie.setPath("/");
            cookie.setMaxAge(24 * 60 * 60); // 24 hours
            response.addCookie(cookie);

            // Thêm SameSite=Lax qua header (Servlet API không hỗ trợ SameSite trực tiếp)
            response.setHeader("Set-Cookie",
                    String.format("jwt_token=%s; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=%d",
                            token, 24 * 60 * 60));

            // Redirect to frontend with token
            String redirectUrl = frontendUrl + oauth2RedirectPath + "?token=" + token;
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);

        } catch (Exception e) {
            logger.error("Error during OAuth2 authentication success handling: {}", e.getMessage(), e);
            response.sendRedirect(frontendUrl + "/login?error=authentication_failed");
        }
    }
}
