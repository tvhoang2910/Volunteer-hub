package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.ForgotPasswordRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.ResetPasswordRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils.TokenUtil;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EmailService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.RateLimitService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.RecoveryCodeService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

/**
 * REST API endpoints cho authentication và password recovery.
 * 
 * Security improvements:
 * - Không tiết lộ thông tin user enumeration
 * - Sử dụng secure random token thay vì mã số ngắn
 * - Async email sending để không block request
 * - Stateless password reset (không dùng session)
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

    public AuthAPI(UserService userService, EmailService emailService,
            RecoveryCodeService recoveryCodeService, RateLimitService rateLimitService) {
        this.userService = userService;
        this.emailService = emailService;
        this.recoveryCodeService = recoveryCodeService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegistrationRequest registrationRequest,
            BindingResult bindingResult) {

        // Xử lý validation
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

    /**
     * Endpoint để request password reset.
     * 
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
     * 
     * Flow:
     * 1. User nhận email với link chứa token
     * 2. Frontend mở link và hiển thị form reset password
     * 3. User nhập password mới và confirm
     * 4. Frontend gửi request này kèm token + password
     * 
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
}
