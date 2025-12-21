package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import java.util.HashSet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RoleRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;

/**
 * DEV-only bootstrapper to ensure there is at least one ADMIN account.
 *
 * Why:
 * - When no admin exists, the system cannot approve admin requests / manage
 * users.
 * - This makes local dev setups reproducible after merges.
 *
 * Security:
 * - Uses a BCrypt hash (not plaintext) configured via properties.
 * - Only runs in the 'dev' profile and when explicitly enabled.
 */
@Profile("dev")
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.bootstrap.admin.enabled", havingValue = "true")
public class DevAdminBootstrapper implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevAdminBootstrapper.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Value("${app.bootstrap.admin.email:}")
    private String email;

    @Value("${app.bootstrap.admin.name:Dev Admin}")
    private String name;

    @Value("${app.bootstrap.admin.password-hash:}")
    private String passwordHash;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        if (normalizedEmail.isBlank()) {
            log.warn("DevAdminBootstrapper enabled but app.bootstrap.admin.email is blank; skipping.");
            return;
        }
        if (passwordHash == null || passwordHash.trim().isBlank()) {
            log.warn("DevAdminBootstrapper enabled but app.bootstrap.admin.password-hash is blank; skipping.");
            return;
        }

        Role adminRole = roleRepository.findByRoleName("ADMIN").orElseGet(() -> {
            Role r = new Role();
            r.setRoleName("ADMIN");
            r.setDescription("Quản trị viên");
            Role saved = roleRepository.save(r);
            log.info("Seeded missing role: ADMIN");
            return saved;
        });

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElseGet(() -> {
            User u = new User();
            u.setEmail(normalizedEmail);
            u.setName((name == null || name.isBlank()) ? "Admin" : name);
            u.setIsActive(Boolean.TRUE);
            u.setPassword(passwordHash);
            u.setRoles(new HashSet<>());
            u.getRoles().add(adminRole);
            User saved = userRepository.save(u);
            log.info("Seeded DEV admin user: {}", normalizedEmail);
            return saved;
        });

        boolean changed = false;

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            user.setIsActive(Boolean.TRUE);
            changed = true;
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            user.setPassword(passwordHash);
            changed = true;
        }

        if (user.getRoles() == null) {
            user.setRoles(new HashSet<>());
            changed = true;
        }

        if (user.getRoles().stream().noneMatch(r -> r != null && "ADMIN".equalsIgnoreCase(r.getRoleName()))) {
            user.getRoles().add(adminRole);
            changed = true;
        }

        if (changed) {
            userRepository.save(user);
            log.info("Updated existing user {} to ensure ADMIN role + active status.", normalizedEmail);
        } else {
            log.info("DEV admin bootstrap OK: user {} already present.", normalizedEmail);
        }
    }
}
