package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "password_resets", indexes = {
        @Index(name = "idx_password_resets_token_hash", columnList = "token_hash", unique = true),
        @Index(name = "idx_password_resets_user", columnList = "user_id")
})
@AttributeOverride(name = "id", column = @Column(name = "id", nullable = false, updatable = false))
public class PasswordResetToken extends BaseEntity {

    // EAGER to avoid LazyInitializationException in controller when loading user email
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false, length = 128, unique = true)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used", nullable = false)
    private boolean used = false;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    public boolean isExpired(LocalDateTime now) {
        return expiresAt != null && expiresAt.isBefore(now);
    }

    public boolean isActive(LocalDateTime now) {
        return !used && !isExpired(now);
    }
}
