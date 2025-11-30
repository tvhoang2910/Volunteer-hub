package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PasswordResetToken;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    List<PasswordResetToken> findByUserAndUsedIsFalse(User user);
}
