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
    private static final Logger auditLogger = LoggerFactory.getLogger("AUDIT");

    private final StringRedisTemplate redisTemplate;

    @Value("${rate-limit.forgot-password.max-attempts:3}")
    private int forgotPasswordMaxAttempts;

    @Value("${rate-limit.forgot-password.window-minutes:60}")
    private long forgotPasswordWindowMinutes;

    @Value("${rate-limit.login.max-attempts:5}")
    private int loginMaxAttempts;

    @Value("${rate-limit.login.window-minutes:15}")
    private long loginWindowMinutes;

    @Value("${rate-limit.login.lockout-minutes:30}")
    private long loginLockoutMinutes;

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
     * Kiểm tra rate limit cho login endpoint để chống brute-force.
     * Khi vượt quá giới hạn, lockout trong khoảng thời gian dài hơn.
     * 
     * @param identifier IP hoặc email
     * @return true nếu được phép, false nếu vượt quá giới hạn
     */
    @Override
    public boolean checkLoginRateLimit(String identifier) {
        String lockoutKey = "rate-limit:login:lockout:" + identifier;

        // Kiểm tra xem có đang bị lockout không
        String lockoutValue = redisTemplate.opsForValue().get(lockoutKey);
        if (lockoutValue != null) {
            auditLogger.warn("🔒 LOGIN_BLOCKED | Identifier: {} | Reason: Lockout active", identifier);
            return false;
        }

        String key = "rate-limit:login:" + identifier;
        boolean allowed = checkRateLimit(key, loginMaxAttempts, Duration.ofMinutes(loginWindowMinutes));

        if (!allowed) {
            // Khi vượt quá limit, set lockout
            redisTemplate.opsForValue().set(lockoutKey, "locked", Duration.ofMinutes(loginLockoutMinutes));
            auditLogger.warn("🔒 LOGIN_LOCKOUT | Identifier: {} | Duration: {} minutes", identifier,
                    loginLockoutMinutes);
        }

        return allowed;
    }

    /**
     * Reset rate limit cho login.
     * Gọi sau khi login thành công để clear counter.
     * 
     * @param identifier IP hoặc email
     */
    @Override
    public void resetLoginRateLimit(String identifier) {
        String key = "rate-limit:login:" + identifier;
        String lockoutKey = "rate-limit:login:lockout:" + identifier;
        redisTemplate.delete(key);
        redisTemplate.delete(lockoutKey);
        logger.debug("Reset login rate limit for identifier: {}", identifier);
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
