package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Global exception handler để:
 * - Không leak stack trace ra client
 * - Ghi log đầy đủ cho debugging
 * - Trả về response format thống nhất
 * - Audit logging cho security events
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final Logger auditLogger = LoggerFactory.getLogger("AUDIT");

    /**
     * Handle validation errors từ @Valid
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDTO<List<String>>> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());

        logger.warn("Validation failed for {} {} from IP {}: {}",
                request.getMethod(), request.getRequestURI(), getClientIP(request), errors);

        ResponseDTO<List<String>> response = ResponseDTO.<List<String>>builder()
                .message("Validation failed")
                .data(errors)
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handle constraint violations
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ResponseDTO<Void>> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {

        logger.warn("Constraint violation for {} {} from IP {}: {}",
                request.getMethod(), request.getRequestURI(), getClientIP(request), ex.getMessage());

        ResponseDTO<Void> response = ResponseDTO.<Void>builder()
                .message("Invalid request parameters")
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handle authentication failures - audit log với IP
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ResponseDTO<Void>> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {

        String ip = getClientIP(request);
        String uri = request.getRequestURI();

        // Audit log cho security monitoring
        auditLogger.warn("🔒 AUTH_FAILURE | IP: {} | URI: {} | Time: {} | Reason: {}",
                ip, uri, LocalDateTime.now(), ex.getMessage());

        ResponseDTO<Void> response = ResponseDTO.<Void>builder()
                .message("Authentication failed")
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Handle bad credentials - không tiết lộ user có tồn tại không
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ResponseDTO<Void>> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {

        String ip = getClientIP(request);

        auditLogger.warn("🔒 BAD_CREDENTIALS | IP: {} | URI: {} | Time: {}",
                ip, request.getRequestURI(), LocalDateTime.now());

        ResponseDTO<Void> response = ResponseDTO.<Void>builder()
                .message("Invalid email or password")
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Handle access denied - audit log
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseDTO<Void>> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {

        String ip = getClientIP(request);

        auditLogger.warn("🚫 ACCESS_DENIED | IP: {} | URI: {} | Time: {} | User-Agent: {}",
                ip, request.getRequestURI(), LocalDateTime.now(),
                request.getHeader("User-Agent"));

        ResponseDTO<Void> response = ResponseDTO.<Void>builder()
                .message("Access denied")
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Handle 404 Not Found
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ResponseDTO<Void>> handleNotFound(
            NoHandlerFoundException ex, HttpServletRequest request) {

        ResponseDTO<Void> response = ResponseDTO.<Void>builder()
                .message("Resource not found")
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handle IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ResponseDTO<Void>> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {

        logger.warn("Illegal argument for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());

        ResponseDTO<Void> response = ResponseDTO.<Void>builder()
                .message("Invalid request")
                .detail(ex.getMessage())
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handle all other exceptions - KHÔNG leak stack trace
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDTO<Void>> handleGenericException(
            Exception ex, HttpServletRequest request) {

        // Log full stack trace cho debugging
        logger.error("Unhandled exception for {} {} from IP {}",
                request.getMethod(), request.getRequestURI(), getClientIP(request), ex);

        // Trả về generic message - không tiết lộ internal error
        ResponseDTO<Void> response = ResponseDTO.<Void>builder()
                .message("An internal error occurred. Please try again later.")
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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
}
