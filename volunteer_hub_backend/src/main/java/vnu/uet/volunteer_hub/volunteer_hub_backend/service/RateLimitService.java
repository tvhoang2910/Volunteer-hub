package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

public interface RateLimitService {
    boolean checkForgotPasswordRateLimit(String identifier);

    void resetRateLimit(String identifier);
}
