package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PasswordResetToken;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils.TokenUtil;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PasswordResetTokenRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PasswordResetTokenService;

@Service
public class PasswordResetTokenServiceImpl implements PasswordResetTokenService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetTokenService.class);
    private static final int DEFAULT_RANDOM_BYTES = 48; // 384 bits ~ good for reset token

    private final PasswordResetTokenRepository repository;
    private final long ttlMinutes;

    public PasswordResetTokenServiceImpl(PasswordResetTokenRepository repository,
            @Value("${password-reset.token.ttl-minutes:15}") long ttlMinutes) {
        this.repository = repository;
        this.ttlMinutes = ttlMinutes;
    }

    @Override
    @Transactional
    public String createTokenForUser(User user) {
        Objects.requireNonNull(user, "user cannot be null");

        invalidateActiveTokens(user);

        String rawToken = TokenUtil.generateSecureToken(DEFAULT_RANDOM_BYTES);
        String tokenHash = hashToken(rawToken);

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setTokenHash(tokenHash);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(ttlMinutes));
        token.setUsed(false);

        repository.save(token);
        logger.info("Created password reset token for userId={}", user.getId());

        return rawToken;
    }

    @Override
    public Optional<PasswordResetToken> validateRawToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        String tokenHash = hashToken(rawToken);
        LocalDateTime now = LocalDateTime.now();

        return repository.findByTokenHash(tokenHash)
                .filter(t -> t.isActive(now));
    }

    @Override
    @Transactional
    public void markTokenUsed(PasswordResetToken token) {
        if (token == null) {
            return;
        }
        token.setUsed(true);
        token.setUsedAt(LocalDateTime.now());
        repository.save(token);
        logger.info("Marked password reset token as used for userId={}", token.getUser().getId());
    }

    @Override
    @Transactional
    public void invalidateActiveTokens(User user) {
        if (user == null) {
            return;
        }
        List<PasswordResetToken> activeTokens = repository.findByUserAndUsedIsFalse(user);
        if (activeTokens.isEmpty()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        for (PasswordResetToken token : activeTokens) {
            if (token.isActive(now)) {
                token.setUsed(true);
                token.setUsedAt(now);
            }
        }
        repository.saveAll(activeTokens);
        logger.info("Invalidated {} active password reset tokens for userId={}", activeTokens.size(), user.getId());
    }

    @Override
    public long getTtlMinutes() {
        return ttlMinutes;
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
