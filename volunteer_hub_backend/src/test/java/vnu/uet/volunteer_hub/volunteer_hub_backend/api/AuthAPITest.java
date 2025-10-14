package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.ForgotPasswordRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.ResetPasswordRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EmailService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.RateLimitService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.RecoveryCodeService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

@WebMvcTest(AuthAPI.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("AuthAPI Integration Tests")
class AuthAPITest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private EmailService emailService;

    @MockBean
    private RecoveryCodeService recoveryCodeService;

    @MockBean
    private RateLimitService rateLimitService;

    @Test
    @DisplayName("Should return generic success message for forgot password with existing email")
    void shouldReturnGenericSuccessForExistingEmail() throws Exception {
        // Given
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("existing@example.com");

        when(rateLimitService.checkForgotPasswordRateLimit(anyString())).thenReturn(true);
        when(userService.existsByEmail(anyString())).thenReturn(true);
        doNothing().when(recoveryCodeService).invalidateByEmail(anyString());
        doNothing().when(recoveryCodeService).storeRecoveryCode(anyString(), anyString());
        doNothing().when(emailService).sendPasswordResetEmail(anyString(), anyString());

        // When & Then
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu."));

        verify(emailService).sendPasswordResetEmail(eq("existing@example.com"), anyString());
    }

    @Test
    @DisplayName("Should return generic success message for forgot password with non-existing email")
    void shouldReturnGenericSuccessForNonExistingEmail() throws Exception {
        // Given
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("nonexisting@example.com");

        when(rateLimitService.checkForgotPasswordRateLimit(anyString())).thenReturn(true);
        when(userService.existsByEmail(anyString())).thenReturn(false);

        // When & Then
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu."));

        // Should not send email
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    @DisplayName("Should return 429 when rate limit exceeded")
    void shouldReturn429WhenRateLimitExceeded() throws Exception {
        // Given
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        when(rateLimitService.checkForgotPasswordRateLimit(anyString())).thenReturn(false);

        // When & Then
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.message").value("Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau."));

        verify(userService, never()).existsByEmail(anyString());
    }

    @Test
    @DisplayName("Should return 400 for invalid email format")
    void shouldReturn400ForInvalidEmailFormat() throws Exception {
        // Given
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("invalid-email");

        // When & Then
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should reset password with valid token")
    void shouldResetPasswordWithValidToken() throws Exception {
        // Given
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setPassword("NewPassword123!");
        request.setConfirmPassword("NewPassword123!");

        when(recoveryCodeService.isValidRecoveryCode("valid-token"))
                .thenReturn("user@example.com");
        doNothing().when(userService).updatePassword(anyString(), anyString());

        // When & Then
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Mật khẩu đã được cập nhật thành công"));

        verify(userService).updatePassword(eq("user@example.com"), eq("NewPassword123!"));
    }

    @Test
    @DisplayName("Should return 400 for invalid token")
    void shouldReturn400ForInvalidToken() throws Exception {
        // Given
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("invalid-token");
        request.setPassword("NewPassword123!");
        request.setConfirmPassword("NewPassword123!");

        when(recoveryCodeService.isValidRecoveryCode("invalid-token"))
                .thenReturn(null);

        // When & Then
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu khôi phục mật khẩu lại."));

        verify(userService, never()).updatePassword(anyString(), anyString());
    }

    @Test
    @DisplayName("Should return 400 when password confirmation does not match")
    void shouldReturn400WhenPasswordConfirmationDoesNotMatch() throws Exception {
        // Given
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setPassword("NewPassword123!");
        request.setConfirmPassword("DifferentPassword123!");

        // When & Then
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Mật khẩu xác nhận không khớp"));

        verify(recoveryCodeService, never()).isValidRecoveryCode(anyString());
    }

    @Test
    @DisplayName("Should return 400 for weak password")
    void shouldReturn400ForWeakPassword() throws Exception {
        // Given
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setPassword("weak");
        request.setConfirmPassword("weak");

        // When & Then
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
