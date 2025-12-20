// package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.boot.ApplicationArguments;
// import org.springframework.boot.ApplicationRunner;
// import org.springframework.boot.autoconfigure.condition.ConditionalOnProper;
// import
// org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
// import org.springframework.context.annotation.Profile;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;
// import org.springframework.transaction.annotation.Transactional;

// import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RoleRepository;
// import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;

// /**
// * DEV-ONLY default data seeder.
// *
// * - Creates default roles if missing.
// * - Creates a few default accounts (admin/manager/volunteer) if missing.
// * - Passwords are stored as BCrypt hashes via PasswordEncoder.
// * - Idempotent: does not duplicate usty;
// import org.springframework.context.annotation.Profile;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;
// import org.springframework.transaction.annotation.Transactional;

// import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
// import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;ers.
// */
// @Profile("dev")
// @Component
// @ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true",
// matchIfMissing = false)
// public class DevDataSeeder implements ApplicationRunner {

// private static final Logger logger =
// LoggerFactory.getLogger(DevDataSeeder.class);

// private final UserRepository userRepository;
// private final RoleRepository roleRepository;
// private final PasswordEncoder passwordEncoder;

// @Value("${app.seed.default-password:P@ssw0rd}")
// private String defaultPassword;

// @Value("${app.seed.admin.email:admin@example.com}")
// private String adminEmail;

// @Value("${app.seed.admin.name:Admin User}")
// private String adminName;

// @Value("${app.seed.manager.email:manager@example.com}")
// private String managerEmail;

// @Value("${app.seed.manager.name:Manager User}")
// private String managerName;

// @Value("${app.seed.volunteer.email:volunteer@example.com}")
// private String volunteerEmail;

// @Value("${app.seed.volunteer.name:Volunteer User}")
// private String volunteerName;

// public DevDataSeeder(UserRepository userRepository, RoleRepository
// roleRepository, PasswordEncoder passwordEncoder) {
// this.userRepository = userRepository;
// this.roleRepository = roleRepository;
// this.passwordEncoder = passwordEncoder;
// }

// @Override
// @Transactional
// public void run(ApplicationArguments args) {
// ensureRole("VOLUNTEER", "Tình nguyện viên");
// ensureRole("MANAGER", "Quản lý sự kiện");
// ensureRole("ADMIN", "Quản trị viên");

// seedUserIfMissing(adminEmail, adminName, defaultPassword, "ADMIN");
// seedUserIfMissing(managerEmail, managerName, defaultPassword, "MANAGER");
// seedUserIfMissing(volunteerEmail, volunteerName, defaultPassword,
// "VOLUNTEER");

// logger.info("✅ Dev seed completed (app.seed.enabled=true)");
// }

// private void ensureRole(String roleName, String description) {
// roleRepository.findByRoleName(roleName).orElseGet(() -> {
// Role role = new Role();
// role.setRoleName(roleName);
// role.setDescription(description);
// Role saved = roleRepository.save(role);
// logger.info("Seeded missing role: {}", roleName);
// return saved;
// });
// }

// private void seedUserIfMissing(String emailRaw, String nameRaw, String
// plainPassword, String roleName) {
// String email = emailRaw == null ? null : emailRaw.trim().toLowerCase();
// if (email == null || email.isBlank()) {
// return;
// }

// boolean exists = userRepository.existsByEmailIgnoreCase(email);
// if (exists) {
// return;
// }

// Role role = roleRepository.findByRoleName(roleName)
// .orElseThrow(() -> new IllegalStateException("Role not found: " + roleName));

// User user = new User();
// user.setEmail(email);
// user.setName((nameRaw == null || nameRaw.isBlank()) ? roleName : nameRaw);
// user.setIsActive(Boolean.TRUE);
// user.setPassword(passwordEncoder.encode(plainPassword));
// user.getRoles().add(role);

// userRepository.save(user);
// logger.info("Seeded user: {} with role {}", email, roleName);
// }
// }
