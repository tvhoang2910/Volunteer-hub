package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.LoginResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils.JwtUtil;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;

import java.util.Map;

/**
 * API endpoint hỗ trợ OAuth2 authentication flow.
 * Cung cấp endpoint để exchange OAuth2 code hoặc verify Google ID token.
 */
@RestController
@RequestMapping("/api/auth/oauth2")
public class OAuth2API {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2API.class);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    private final long jwtExpirationMs;

    public OAuth2API(JwtUtil jwtUtil, UserRepository userRepository,
            @Value("${security.jwt.expiration-ms}") long jwtExpirationMs) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.jwtExpirationMs = jwtExpirationMs;
    }

    /**
     * Endpoint để generate JWT token sau khi OAuth2 login thành công.
     * Frontend gọi endpoint này với email đã được verify từ Google.
     * 
     * LƯU Ý: Trong production, nên verify Google ID token thay vì chỉ nhận email.
     * Xem:
     * https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
     * 
     * @param request chứa email đã được authenticate từ Google
     * @return JWT token
     */
    @PostMapping("/token")
    public ResponseEntity<?> getTokenForOAuth2User(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    ResponseDTO.<Void>builder()
                            .message("Email is required")
                            .build());
        }

        try {
            // Tìm user trong database
            User user = userRepository.findByEmailIgnoreCaseWithRoleOptional(email)
                    .orElse(null);

            if (user == null) {
                logger.warn("OAuth2 token request for non-existent user: {}", email);
                return ResponseEntity.status(404).body(
                        ResponseDTO.<Void>builder()
                                .message("User not found. Please complete OAuth2 login first.")
                                .build());
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

            logger.info("✅ JWT token generated for OAuth2 user: {}", email);

            // Build response
            LoginResponse loginResponse = LoginResponse.builder()
                    .accessToken(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpirationMs)
                    .userId(user.getId().toString())
                    .email(user.getEmail())
                    .role(role)
                    .displayName(user.getName())
                    .build();

            return ResponseEntity.ok(
                    ResponseDTO.<LoginResponse>builder()
                            .message("Token generated successfully")
                            .data(loginResponse)
                            .build());

        } catch (Exception e) {
            logger.error("Error generating token for OAuth2 user: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                    ResponseDTO.<Void>builder()
                            .message("Error generating token")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Endpoint để kiểm tra OAuth2 provider URLs.
     * Useful cho frontend để biết redirect URL.
     */
    @GetMapping("/providers")
    public ResponseEntity<?> getOAuth2Providers() {
        return ResponseEntity.ok(
                ResponseDTO.<Map<String, String>>builder()
                        .message("OAuth2 providers")
                        .data(Map.of(
                                "google", "/oauth2/authorization/google",
                                "description", "Redirect user to this URL to initiate Google OAuth2 login"))
                        .build());
    }
}
