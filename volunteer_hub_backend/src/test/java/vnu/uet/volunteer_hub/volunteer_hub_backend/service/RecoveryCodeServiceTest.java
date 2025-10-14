package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils.TokenUtil;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecoveryCodeService Tests")
class RecoveryCodeServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private RecoveryCodeService recoveryCodeService;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_TOKEN = "test-token-123";
    private static final long TTL_MINUTES = 15;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        recoveryCodeService = new RecoveryCodeService(redisTemplate, TTL_MINUTES);
    }

    @Test
    @DisplayName("Should store recovery token successfully")
    void shouldStoreRecoveryToken() {
        // When
        recoveryCodeService.storeRecoveryCode(TEST_EMAIL, TEST_TOKEN);

        // Then
        verify(valueOperations).set(
                eq("pwd-reset:token:" + TEST_TOKEN),
                eq(TEST_EMAIL),
                eq(Duration.ofMinutes(TTL_MINUTES)));
        verify(valueOperations).set(
                eq("pwd-reset:email:" + TEST_EMAIL.toLowerCase()),
                eq(TEST_TOKEN),
                eq(Duration.ofMinutes(TTL_MINUTES)));
    }

    @Test
    @DisplayName("Should validate and consume valid token")
    void shouldValidateAndConsumeValidToken() {
        // Given
        when(valueOperations.get("pwd-reset:token:" + TEST_TOKEN))
                .thenReturn(TEST_EMAIL);

        // When
        String email = recoveryCodeService.isValidRecoveryCode(TEST_TOKEN);

        // Then
        assertEquals(TEST_EMAIL, email);
        verify(redisTemplate).delete("pwd-reset:token:" + TEST_TOKEN);
        verify(redisTemplate).delete("pwd-reset:email:" + TEST_EMAIL.toLowerCase());
    }

    @Test
    @DisplayName("Should return null for invalid token")
    void shouldReturnNullForInvalidToken() {
        // Given
        when(valueOperations.get(anyString())).thenReturn(null);

        // When
        String email = recoveryCodeService.isValidRecoveryCode(TEST_TOKEN);

        // Then
        assertNull(email);
        verify(redisTemplate, never()).delete(anyString());
    }

    @Test
    @DisplayName("Should return null for null or blank token")
    void shouldReturnNullForNullOrBlankToken() {
        assertNull(recoveryCodeService.isValidRecoveryCode(null));
        assertNull(recoveryCodeService.isValidRecoveryCode(""));
        assertNull(recoveryCodeService.isValidRecoveryCode("   "));
    }

    @Test
    @DisplayName("Should invalidate token by email")
    void shouldInvalidateTokenByEmail() {
        // Given
        when(valueOperations.get("pwd-reset:email:" + TEST_EMAIL.toLowerCase()))
                .thenReturn(TEST_TOKEN);

        // When
        recoveryCodeService.invalidateByEmail(TEST_EMAIL);

        // Then
        verify(redisTemplate).delete("pwd-reset:email:" + TEST_EMAIL.toLowerCase());
        verify(redisTemplate).delete("pwd-reset:token:" + TEST_TOKEN);
    }

    @Test
    @DisplayName("Should invalidate token by token value")
    void shouldInvalidateTokenByToken() {
        // Given
        when(valueOperations.get("pwd-reset:token:" + TEST_TOKEN))
                .thenReturn(TEST_EMAIL);

        // When
        recoveryCodeService.invalidateByToken(TEST_TOKEN);

        // Then
        verify(redisTemplate).delete("pwd-reset:token:" + TEST_TOKEN);
        verify(redisTemplate).delete("pwd-reset:email:" + TEST_EMAIL.toLowerCase());
    }

    @Test
    @DisplayName("Should handle case-insensitive email")
    void shouldHandleCaseInsensitiveEmail() {
        // Given
        String mixedCaseEmail = "Test@Example.COM";

        // When
        recoveryCodeService.storeRecoveryCode(mixedCaseEmail, TEST_TOKEN);

        // Then
        verify(valueOperations).set(
                eq("pwd-reset:email:test@example.com"),
                eq(TEST_TOKEN),
                any(Duration.class));
    }

    @Test
    @DisplayName("TokenUtil should generate secure tokens")
    void tokenUtilShouldGenerateSecureTokens() {
        // When
        String token1 = TokenUtil.generatePasswordResetToken();
        String token2 = TokenUtil.generatePasswordResetToken();

        // Then
        assertNotNull(token1);
        assertNotNull(token2);
        assertNotEquals(token1, token2, "Tokens should be unique");
        assertTrue(token1.length() > 40, "Token should be long enough");
        assertTrue(token2.length() > 40, "Token should be long enough");

        // URL-safe characters only
        assertTrue(token1.matches("[A-Za-z0-9_-]+"), "Token should be URL-safe");
        assertTrue(token2.matches("[A-Za-z0-9_-]+"), "Token should be URL-safe");
    }
}
