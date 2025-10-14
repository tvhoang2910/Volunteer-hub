package vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility class để tạo secure random tokens cho password recovery và các mục
 * đích bảo mật khác.
 */
public class TokenUtil {

    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * Tạo một token ngẫu nhiên an toàn với độ dài byte được chỉ định.
     * Token được encode thành URL-safe base64 string.
     *
     * @param bytesLength số byte random (khuyến nghị >= 32 bytes)
     * @return URL-safe base64 encoded token
     */
    public static String generateSecureToken(int bytesLength) {
        if (bytesLength < 16) {
            throw new IllegalArgumentException("Token length should be at least 16 bytes for security");
        }

        byte[] randomBytes = new byte[bytesLength];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Tạo token password recovery với 32 bytes (256 bits) entropy.
     * Kết quả là ~43 ký tự URL-safe string.
     *
     * @return secure random token
     */
    public static String generatePasswordResetToken() {
        return generateSecureToken(32);
    }
}
