package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

public interface RateLimitService {
    boolean checkForgotPasswordRateLimit(String identifier);

    /**
     * Kiểm tra rate limit cho login endpoint để chống brute-force.
     * 
     * @param identifier IP hoặc email
     * @return true nếu được phép, false nếu vượt quá giới hạn
     */
    boolean checkLoginRateLimit(String identifier);

    void resetRateLimit(String identifier);

    /**
     * Reset rate limit cho login.
     * 
     * @param identifier IP hoặc email
     */
    void resetLoginRateLimit(String identifier);
}
