package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import vnu.uet.volunteer_hub.volunteer_hub_backend.config.JwtTokenProvider;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.ForgotPasswordRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.LoginRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.ResetPasswordRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.ValidateResetTokenRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PasswordResetToken;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EmailService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PasswordResetTokenService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.RateLimitService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthAPI {
    private static final Logger logger = LoggerFactory.getLogger(AuthAPI.class);

    private final UserService userService;
    private final EmailService emailService;
    private final PasswordResetTokenService passwordResetTokenService;
    private final RateLimitService rateLimitService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthAPI(UserService userService, EmailService emailService,
            PasswordResetTokenService passwordResetTokenService, RateLimitService rateLimitService,
            AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.emailService = emailService;
        this.passwordResetTokenService = passwordResetTokenService;
        this.rateLimitService = rateLimitService;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegistrationRequest registrationRequest,
            BindingResult bindingResult) {

        ResponseEntity<?> errorResponse = getErrorResponse(bindingResult);
        if (errorResponse != null) {
            return errorResponse;
        }

        try {
            logger.info("Registering user: {}", registrationRequest.getEmail());
            userService.registerUser(registrationRequest);

            ResponseDTO<RegistrationRequest> successResponse = ResponseDTO.<RegistrationRequest>builder()
                    .message("User created successfully")
                    .data(registrationRequest)
                    .build();

            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            logger.error("Error registering user: {}", registrationRequest.getEmail(), e);
            ResponseDTO<Void> err = ResponseDTO.<Void>builder()
                    .message("Error creating user")
                    .detail(e.getMessage())
                    .build();

            return ResponseEntity.status(500).body(err);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, BindingResult bindingResult) {
        ResponseEntity<?> errorResponse = getErrorResponse(bindingResult);
        if (errorResponse != null) {
            return errorResponse;
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtTokenProvider.generateToken(userDetails);

            Map<String, Object> payload = new HashMap<>();
            payload.put("token", token);

            ResponseDTO<Map<String, Object>> successResponse = ResponseDTO.<Map<String, Object>>builder()
                    .message("Login successful")
                    .data(payload)
                    .build();
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            ResponseDTO<Void> err = ResponseDTO.<Void>builder()
                    .message("Invalid email or password")
                    .build();
            return ResponseEntity.status(401).body(err);
        }
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
     * Step 1: request forgot password (generic response).
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String email = request.getEmail();
        String genericMessage = "Vui long kiem tra email neu ton tai";

        logger.info("Received password reset request for email={}", email);

        if (!rateLimitService.checkForgotPasswordRateLimit(email)) {
            ResponseDTO<Void> response = ResponseDTO.<Void>builder()
                    .message("Ban da yeu cau qua nhieu lan. Vui long thu lai sau.")
                    .build();
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
        }

        try {
            userService.findByEmail(email).ifPresent(user -> {
                String rawToken = passwordResetTokenService.createTokenForUser(user);
                emailService.sendPasswordResetEmail(user.getEmail(), rawToken,
                        passwordResetTokenService.getTtlMinutes());
            });

            return ResponseEntity.ok(ResponseDTO.<Void>builder()
                    .message(genericMessage)
                    .build());

        } catch (Exception e) {
            logger.error("Error processing password reset request for {}: {}", email, e.getMessage(), e);
            return ResponseEntity.ok(ResponseDTO.<Void>builder()
                    .message(genericMessage)
                    .build());
        }
    }

    /**
     * Step 4: validate reset token without consuming it.
     */
    @PostMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@Valid @RequestBody ValidateResetTokenRequest request) {
        boolean valid = passwordResetTokenService.validateRawToken(request.getToken()).isPresent();
        if (!valid) {
            ResponseDTO<Void> errorResponse = ResponseDTO.<Void>builder()
                    .message("Token khong hop le hoac da het han")
                    .build();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        ResponseDTO<Map<String, String>> success = ResponseDTO.<Map<String, String>>builder()
                .message("allow")
                .data(Map.of("status", "allow"))
                .build();
        return ResponseEntity.ok(success);
    }

    /**
     * Step 5: consume token and reset password.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request,
            BindingResult bindingResult) {

        ResponseEntity<?> errorResponse = getErrorResponse(bindingResult);
        if (errorResponse != null) {
            return errorResponse;
        }

        String tokenValue = request.getToken();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (confirmPassword != null && !confirmPassword.isBlank() && !newPassword.equals(confirmPassword)) {
            ResponseDTO<Void> err = ResponseDTO.<Void>builder()
                    .message("Mat khau xac nhan khong khop")
                    .build();
            return ResponseEntity.badRequest().body(err);
        }

        try {
            PasswordResetToken token = passwordResetTokenService.validateRawToken(tokenValue)
                    .orElse(null);

            if (token == null) {
                ResponseDTO<Void> err = ResponseDTO.<Void>builder()
                        .message("Token khong hop le hoac da het han. Vui long yeu cau lai.")
                        .build();
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
            }

            String email = token.getUser().getEmail();
            userService.updatePassword(email, newPassword);
            passwordResetTokenService.markTokenUsed(token);

            ResponseDTO<Void> successResponse = ResponseDTO.<Void>builder()
                    .message("Dat lai mat khau thanh cong")
                    .build();
            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            logger.error("Error resetting password: {}", e.getMessage(), e);
            ResponseDTO<Void> err = ResponseDTO.<Void>builder()
                    .message("Loi khi cap nhat mat khau")
                    .detail(e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(err);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
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
                    .message("Logout successful")
                    .build();
            return ResponseEntity.ok(success);
        } catch (Exception e) {
            ResponseDTO<Void> err = ResponseDTO.<Void>builder()
                    .message("Error during logout")
                    .detail(e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(err);
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

            Map<String, Object> info = new HashMap<>();
            info.put("email", auth.getName());
            java.util.UUID id = userService.getViewerIdFromAuthentication(auth);
            info.put("id", id);
            info.put("roles", auth.getAuthorities().stream()
                    .map(a -> a.getAuthority()).toList());

            ResponseDTO<Map<String, Object>> resp = ResponseDTO.<Map<String, Object>>builder()
                    .message("Current user retrieved")
                    .data(info)
                    .build();
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            ResponseDTO<Void> err = ResponseDTO.<Void>builder()
                    .message("Unable to retrieve current user")
                    .detail(e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(err);
        }
    }
}
