package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import vnu.uet.volunteer_hub.volunteer_hub_backend.service.RateLimitService;

@Service
public class RateLimitServiceImpl implements RateLimitService {
    private static final Logger logger = LoggerFactory.getLogger(RateLimitServiceImpl.class);

    private final StringRedisTemplate redisTemplate;

    @Value("${rate-limit.forgot-password.max-attempts:3}")
    private int forgotPasswordMaxAttempts;

    @Value("${rate-limit.forgot-password.window-minutes:60}")
    private long forgotPasswordWindowMinutes;

    public RateLimitServiceImpl(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Kiểm tra và increment rate limit counter cho forgot password endpoint.
     * 
     * @param identifier identifier (email hoặc IP) để track
     * @return true nếu request được phép, false nếu đã vượt quá giới hạn
     */
    public boolean checkForgotPasswordRateLimit(String identifier) {
        String key = "rate-limit:forgot-password:" + identifier;
        return checkRateLimit(key, forgotPasswordMaxAttempts, Duration.ofMinutes(forgotPasswordWindowMinutes));
    }

    /**
     * Generic rate limit checker.
     * 
     * @param key         Redis key
     * @param maxAttempts số lần tối đa
     * @param window      thời gian window
     * @return true nếu allowed, false nếu exceeded
     */
    private boolean checkRateLimit(String key, int maxAttempts, Duration window) {
        try {
            String counterStr = redisTemplate.opsForValue().get(key);
            int currentCount = (counterStr == null) ? 0 : Integer.parseInt(counterStr);

            if (currentCount >= maxAttempts) {
                logger.warn("Rate limit exceeded for key: {}", key);
                return false;
            }

            // Increment counter
            if (counterStr == null) {
                // First attempt - set with TTL
                redisTemplate.opsForValue().set(key, "1", window);
            } else {
                // Increment existing counter
                redisTemplate.opsForValue().increment(key);
            }

            return true;

        } catch (Exception e) {
            logger.error("Error checking rate limit for key {}: {}", key, e.getMessage(), e);
            // Fail open - allow request nếu Redis có lỗi
            return true;
        }
    }

    /**
     * Reset rate limit cho một identifier (useful cho testing hoặc admin
     * operations).
     */
    public void resetRateLimit(String identifier) {
        String key = "rate-limit:forgot-password:" + identifier;
        redisTemplate.delete(key);
        logger.info("Reset rate limit for identifier: {}", identifier);
    }
}
