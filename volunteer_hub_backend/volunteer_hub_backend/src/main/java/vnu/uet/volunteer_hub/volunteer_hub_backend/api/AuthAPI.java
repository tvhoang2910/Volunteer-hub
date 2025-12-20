package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.ForgotPasswordRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.ResetPasswordRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.LoginRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.LoginResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils.JwtUtil;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils.TokenUtil;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EmailService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.RateLimitService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.RecoveryCodeService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationManager;

/**
 * REST API endpoints cho authentication và password recovery.
 * Security improvements:
 * - JWT-based stateless authentication
 * - Không tiết lộ thông tin user enumeration
 * - Sử dụng secure random token thay vì mã số ngắn
 * - Async email sending để không block request
 * - Single-use tokens với TTL
 * - Rate limiting để chống abuse
 */
@RestController
@RequestMapping("/api/auth")
public class AuthAPI {
    private static final Logger logger = LoggerFactory.getLogger(AuthAPI.class);
    private final UserService userService;
    private final EmailService emailService;
    private final RecoveryCodeService recoveryCodeService;
    private final RateLimitService rateLimitService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs;

    public AuthAPI(UserService userService, EmailService emailService,
            RecoveryCodeService recoveryCodeService, RateLimitService rateLimitService,
            AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userService = userService;
        this.emailService = emailService;
        this.recoveryCodeService = recoveryCodeService;
        this.rateLimitService = rateLimitService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegistrationRequest registrationRequest,
            BindingResult bindingResult) {

        // Xử lý validation
        ResponseEntity<?> errorResponse1 = getErrorResponse(bindingResult);
        if (errorResponse1 != null)
            return errorResponse1;

        // Xử lý đăng ký
        try {
            logger.info("Registering user: {}", registrationRequest.getEmail());
            userService.registerUser(registrationRequest);
            logger.info("User registered successfully: {}", registrationRequest.getEmail());

            ResponseDTO<RegistrationRequest> successResponse = ResponseDTO.<RegistrationRequest>builder()
                    .message("User created successfully")
                    .data(registrationRequest)
                    .build();

            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            logger.error("Error registering user: {}", registrationRequest.getEmail(), e);
            ResponseDTO<Void> errorResponse = ResponseDTO.<Void>builder()
                    .message("Error creating user")
                    .detail(e.getMessage())
                    .build();

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
            BindingResult bindingResult, HttpServletRequest httpRequest) {
        ResponseEntity<?> errorResponse = getErrorResponse(bindingResult);
        if (errorResponse != null)
            return errorResponse;

        String clientIP = getClientIP(httpRequest);
        String rateLimitKey = clientIP + ":" + request.getEmail();

        // Check rate limit (chống brute-force)
        if (!rateLimitService.checkLoginRateLimit(rateLimitKey)) {
            logger.warn("🔒 Login rate limit exceeded for IP: {}, email: {}", clientIP, request.getEmail());
            ResponseDTO<Void> rateLimitResponse = ResponseDTO.<Void>builder()
                    .message("Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.")
                    .build();
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(rateLimitResponse);
        }

        try {
            // Authenticate user với Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            // Lấy user details sau khi authenticate thành công
            User user = userService.findByEmail(request.getEmail());
            if (user == null) {
                throw new RuntimeException("User not found after authentication");
            }

            // Lấy role (lấy role đầu tiên nếu có nhiều roles)
            String role = user.getRoles().stream()
                    .findFirst()
                    .map(Role::getRoleName)
                    .orElse("VOLUNTEER");

            // Generate JWT token
            String token = jwtUtil.generateToken(
                    user.getId().toString(),
                    user.getEmail(),
                    role);

            // Reset rate limit sau khi login thành công
            rateLimitService.resetLoginRateLimit(rateLimitKey);

            logger.info("✅ User logged in successfully: {} from IP: {}", user.getEmail(), clientIP);

            // Build response với token
            LoginResponse loginResponse = LoginResponse.builder()
                    .accessToken(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpirationMs)
                    .userId(user.getId().toString())
                    .email(user.getEmail())
                    .role(role)
                    .displayName(user.getName())
                    .build();

            ResponseDTO<LoginResponse> successResponse = ResponseDTO.<LoginResponse>builder()
                    .message("Login successful")
                    .data(loginResponse)
                    .build();

            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            logger.warn("❌ Login failed for email: {} from IP: {}", request.getEmail(), clientIP);
            ResponseDTO<Void> errorResponse1 = ResponseDTO.<Void>builder()
                    .message("Invalid email or password")
                    .build();
            return ResponseEntity.status(401).body(errorResponse1);
        }
    }

    /**
     * Lấy client IP - hỗ trợ proxy/load balancer
     */
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        return request.getRemoteAddr();
    }

    private ResponseEntity<?> getErrorResponse(BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getFieldErrors().stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();

            ResponseDTO<List<String>> errorResponse = ResponseDTO.<List<String>>builder()
                    .message("Validation failed")
                    .data(errors)
                    .build();

            return ResponseEntity.badRequest().body(errorResponse);
        }
        return null;
    }

    /**
     * Endpoint để request password reset.
     * <p>
     * Security features:
     * - Không tiết lộ thông tin email có tồn tại hay không (generic response)
     * - Tạo secure random token (32 bytes = 256 bits entropy)
     * - Gửi email async để không block request
     * - Token có TTL (mặc định 15 phút)
     * - Rate limiting (max 3 requests/hour per email)
     * 
     * @param request chứa email
     * @return generic success response
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String email = request.getEmail();

        logger.info("📧 Received password reset request for email: {}", email);

        // Check rate limit (3 requests per hour per email)
        if (!rateLimitService.checkForgotPasswordRateLimit(email)) {
            logger.warn("❌ Rate limit exceeded for email: {}", email);
            // Vẫn trả về generic message để không leak thông tin
            ResponseDTO<Void> response = ResponseDTO.<Void>builder()
                    .message("Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.")
                    .build();
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
        }

        // Luôn trả về response success để tránh user enumeration
        // Chỉ gửi email thực sự nếu user tồn tại
        try {
            if (userService.existsByEmail(email)) {
                // Invalidate old token nếu có (cho phép user request lại)
                recoveryCodeService.invalidateByEmail(email);

                // Tạo secure random token
                String resetToken = TokenUtil.generatePasswordResetToken();

                // Lưu token vào Redis với TTL
                recoveryCodeService.storeRecoveryCode(email, resetToken);
                logger.info("✅ Created password reset token for email: {}", email);

                // Gửi email async (không block request)
                emailService.sendPasswordResetEmail(email, resetToken);
            } else {
                logger.debug("Email not found in system: {}", email);
                // Không reveal email không tồn tại - vẫn trả về success
            }

            // Generic response (không phân biệt email có tồn tại hay không)
            ResponseDTO<Void> successResponse = ResponseDTO.<Void>builder()
                    .message("Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu.")
                    .build();

            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            logger.error("❌ Error processing password reset request: {}", e.getMessage(), e);

            // Vẫn trả về generic success để không leak thông tin
            ResponseDTO<Void> successResponse = ResponseDTO.<Void>builder()
                    .message("Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu.")
                    .build();

            return ResponseEntity.ok(successResponse);
        }
    }

    /**
     * Endpoint để reset password sử dụng token (stateless approach).
     * <p>
     * Flow:
     * 1. User nhận email với link chứa token
     * 2. Frontend mở link và hiển thị form reset password
     * 3. User nhập password mới và confirm
     * 4. Frontend gửi request này kèm token + password
     * <p>
     * Security features:
     * - Stateless (không dùng session)
     * - Token single-use (tự động xóa sau validate)
     * - Password validation (strength rules)
     * - Confirm password matching
     * 
     * @param request chứa token, password, confirmPassword
     * @return success/error response
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request,
            BindingResult bindingResult) {

        ResponseEntity<?> errorResponse1 = getErrorResponse(bindingResult);
        if (errorResponse1 != null)
            return errorResponse1;

        String token = request.getToken();
        String newPassword = request.getPassword();
        String confirmPassword = request.getConfirmPassword();

        logger.info("🔐 Received password reset request");

        // Validate password confirmation
        if (!newPassword.equals(confirmPassword)) {
            logger.warn("❌ Password confirmation does not match");
            ResponseDTO<Void> errorResponse = ResponseDTO.<Void>builder()
                    .message("Mật khẩu xác nhận không khớp")
                    .build();
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            // Validate token và lấy email (token sẽ bị xóa - single use)
            String email = recoveryCodeService.isValidRecoveryCode(token);

            if (email == null) {
                logger.warn("❌ Invalid or expired token");
                ResponseDTO<Void> errorResponse = ResponseDTO.<Void>builder()
                        .message("Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu khôi phục mật khẩu lại.")
                        .build();
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // Update password
            userService.updatePassword(email, newPassword);
            logger.info("✅ Password updated successfully for email: {}", email);

            ResponseDTO<Void> successResponse = ResponseDTO.<Void>builder()
                    .message("Mật khẩu đã được cập nhật thành công")
                    .build();
            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            logger.error("❌ Error resetting password: {}", e.getMessage(), e);
            ResponseDTO<Void> errorResponse = ResponseDTO.<Void>builder()
                    .message("Lỗi khi cập nhật mật khẩu")
                    .detail(e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Đổi mật khẩu cho user đã đăng nhập.
     * POST /api/auth/change-password
     * 
     * Yêu cầu: User phải đã đăng nhập (có JWT token hợp lệ)
     * 
     * @param request chứa currentPassword, newPassword, confirmPassword
     * @return success/error response
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.ChangePasswordRequest request,
            BindingResult bindingResult) {

        ResponseEntity<?> errorResponse = getErrorResponse(bindingResult);
        if (errorResponse != null)
            return errorResponse;

        // Validate password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            logger.warn("❌ Password confirmation does not match");
            return ResponseEntity.badRequest().body(ResponseDTO.<Void>builder()
                    .message("Mật khẩu xác nhận không khớp")
                    .build());
        }

        try {
            // Get userId from JWT token
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseDTO.<Void>builder()
                        .message("Unauthorized - Invalid token")
                        .build());
            }

            // Change password
            userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
            logger.info("✅ Password changed successfully for userId: {}", userId);

            return ResponseEntity.ok(ResponseDTO.<Void>builder()
                    .message("Mật khẩu đã được thay đổi thành công")
                    .build());

        } catch (IllegalArgumentException e) {
            logger.warn("❌ Change password failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDTO.<Void>builder()
                    .message(e.getMessage())
                    .build());
        } catch (Exception e) {
            logger.error("❌ Error changing password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ResponseDTO.<Void>builder()
                    .message("Lỗi khi thay đổi mật khẩu")
                    .detail(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // Với JWT stateless, logout được xử lý ở client side
        // Client chỉ cần xóa token khỏi storage
        // Server-side logout có thể implement blacklist token nếu cần (sử dụng Redis)

        // Xóa session nếu có (cho backwards compatibility)
        try {
            if (request.getSession(false) != null) {
                request.getSession(false).invalidate();
            }

            Cookie cookie = new Cookie("JSESSIONID", null);
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            cookie.setMaxAge(0);
            response.addCookie(cookie);

            ResponseDTO<Void> success = ResponseDTO.<Void>builder()
                    .message("Logout successful. Please remove the JWT token from client storage.")
                    .build();
            return ResponseEntity.ok(success);
        } catch (Exception e) {
            ResponseDTO<Void> error = ResponseDTO.<Void>builder()
                    .message("Error during logout")
                    .detail(e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                ResponseDTO<Void> unauthorized = ResponseDTO.<Void>builder()
                        .message("Not authenticated")
                        .build();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(unauthorized);
            }

            // Build user info từ JWT authentication
            Map<String, Object> info = new HashMap<>();

            // Principal là UUID (được set trong JwtAuthenticationFilter)
            Object principal = auth.getPrincipal();
            if (principal instanceof UUID) {
                info.put("id", principal.toString());
            } else {
                // Fallback cho session-based auth hoặc OAuth
                UUID id = userService.getViewerIdFromAuthentication(auth);
                info.put("id", id != null ? id.toString() : null);
            }

            // Roles từ authorities
            info.put("roles", auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority).toList());

            // Nếu cần thêm thông tin chi tiết, có thể load từ database
            // Nhưng để giảm database calls, chỉ trả về thông tin từ token

            ResponseDTO<Map<String, Object>> resp = ResponseDTO.<Map<String, Object>>builder()
                    .message("Current user retrieved")
                    .data(info)
                    .build();
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            ResponseDTO<Void> error = ResponseDTO.<Void>builder()
                    .message("Unable to retrieve current user")
                    .detail(e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(error);
        }
    }
}
