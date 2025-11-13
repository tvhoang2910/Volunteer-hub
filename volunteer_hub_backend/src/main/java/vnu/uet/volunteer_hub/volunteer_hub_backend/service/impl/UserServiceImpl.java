package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.BaseEntity;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RoleRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void registerUser(RegistrationRequest registrationRequest) {
        if (userRepository.existsByEmailIgnoreCase(registrationRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists!");
        }
        if (!registrationRequest.getPassword().equals(registrationRequest.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu và xác nhận mật khẩu không khớp!");
        }
        if (registrationRequest.getName() == null || registrationRequest.getName().isBlank()) {
            throw new IllegalArgumentException("Họ tên không được để trống!");
        }
        User user = new User();
        user.setEmail(registrationRequest.getEmail().toLowerCase());
        user.setName(registrationRequest.getName());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));

        Role userRole = roleRepository.findByRoleName("VOLUNTEER")
                .orElseThrow(() -> new RuntimeException("VOLUNTEER role not found in the database"));
        user.getRoles().add(userRole);

        logger.info("Attempting to save user: {}", user.getEmail());
        userRepository.save(user);
        logger.info("User saved successfully: {}", user.getEmail());
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmailIgnoreCase(email);

    }

    @Override
    public void updatePassword(String email, String newPassword) {
        try {
            logger.debug("Attempting to update password for email: {}", email);

            User user = userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            String encodedPassword = passwordEncoder.encode(newPassword);
            logger.debug("Encoded new password for user: {}", user.getEmail());

            user.setPassword(encodedPassword);
            userRepository.save(user);

            logger.info("Password updated successfully for user: {}", email);
        } catch (Exception e) {
            logger.error("Error updating password for email {}: {}", email, e.getMessage(), e);
            throw e; // Re-throw để rollback transaction
        }
    }

    @Override
    public void lockUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found"));
        user.setIsActive(Boolean.FALSE);
        userRepository.save(user);
    }

    @Override
    public void unlockUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found"));
        user.setIsActive(Boolean.TRUE);
        userRepository.save(user);
    }

    @Override
    public UUID getViewerIdFromAuthentication(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            return null;
        }
        return userRepository.findByEmailIgnoreCase(auth.getName())
                .map(BaseEntity::getId)
                .orElse(null);
    }
}