package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.Optional;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PasswordResetToken;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;

public interface PasswordResetTokenService {

    /**
     * Generate a single-use password reset token for the given user and persist its
     * hash.
     *
     * @param user user receiving the reset token
     * @return raw token value (to be emailed)
     */
    String createTokenForUser(User user);

    /**
     * Validate token without consuming it.
     *
     * @param rawToken token provided by client
     * @return optional PasswordResetToken if valid (exists, not expired, not used)
     */
    Optional<PasswordResetToken> validateRawToken(String rawToken);

    /**
     * Mark the given token as used (one-time).
     */
    void markTokenUsed(PasswordResetToken token);

    /**
     * Invalidate any existing active tokens for the user.
     */
    void invalidateActiveTokens(User user);

    /**
     * TTL (minutes) used when generating tokens.
     */
    long getTtlMinutes();
}
