package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import java.util.Map;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RoleRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;


/**
 * DEV-ONLY utilities.
 *
 * Intentionally gated by:
 * - Spring profile: dev
 * - config flag: app.security.dev.enable-bootstrap-admin=true
 * - request source: localhost only
 */
@Profile("dev")
@RestController
@RequestMapping("/api/dev")
public class DevAPI {


    private static final Logger logger = LoggerFactory.getLogger(DevAPI.class);


    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;


    @Value("${app.security.dev.enable-bootstrap-admin:false}")
    private boolean enableBootstrapAdmin;


    public DevAPI(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @PostMapping("/bootstrap-admin")
    public ResponseEntity<?> bootstrapAdmin(@Valid @RequestBody BootstrapAdminRequest body, HttpServletRequest request) {
        if (!enableBootstrapAdmin) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.<Void>builder().message("Not found").build());
        }


        String remoteAddr = request.getRemoteAddr();
        if (!isLocalhost(remoteAddr)) {
            logger.warn("Blocked /api/dev/bootstrap-admin from remoteAddr={}", remoteAddr);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ResponseDTO.<Void>builder().message("Forbidden").detail("Localhost only").build());
        }


        String email = body.getEmail().trim().toLowerCase();
        String password = body.getPassword();


        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    User created = new User();
                    created.setEmail(email);
                    created.setName(body.getName() == null || body.getName().isBlank() ? "Dev Admin" : body.getName());
                    created.setIsActive(Boolean.TRUE);
                    return created;
                });


        if (user.getName() == null || user.getName().isBlank()) {
            user.setName(body.getName() == null || body.getName().isBlank() ? "Dev Admin" : body.getName());
        }


        user.setIsActive(Boolean.TRUE);
        user.setPassword(passwordEncoder.encode(password));


        Role adminRole = roleRepository.findByRoleName("ADMIN")
                .orElseThrow(() -> new RuntimeException("ADMIN role not found"));
        user.getRoles().add(adminRole);


        userRepository.save(user);


        return ResponseEntity.ok(ResponseDTO.<Map<String, Object>>builder()
                .message("Bootstrap admin success")
                .data(Map.of(
                        "userId", user.getId() == null ? null : user.getId().toString(),
                        "email", user.getEmail(),
                        "roles", user.getRoles().stream().map(Role::getRoleName).toList()))
                .build());
    }


    private boolean isLocalhost(String remoteAddr) {
        if (remoteAddr == null) {
            return false;
        }
        return "127.0.0.1".equals(remoteAddr)
                || "::1".equals(remoteAddr)
                || "0:0:0:0:0:0:0:1".equals(remoteAddr);
    }


    @Getter
    @Setter
    public static class BootstrapAdminRequest {
        @NotBlank
        private String email;


        @NotBlank
        private String password;


        private String name;
    }
}
