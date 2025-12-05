package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Value("${app.oauth2.success-redirect-url}")
    private String successRedirectUrl;

    public OAuth2AuthenticationSuccessHandler(
            JwtTokenProvider jwtTokenProvider,
            UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        String email = authentication.getName(); // ALWAYS available

        User user = userRepository.findByEmailIgnoreCaseWithRoleOptional(email)
                .orElse(null);

        if (user == null) {
            response.sendRedirect(successRedirectUrl + "?error=user_not_found");
            return;
        }

        // Generate JWT token using standard JwtTokenProvider
        String token = jwtTokenProvider.generateToken(user);

        String encoded = URLEncoder.encode(token, StandardCharsets.UTF_8);
        String redirectUrl = successRedirectUrl + "?token=" + encoded;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
