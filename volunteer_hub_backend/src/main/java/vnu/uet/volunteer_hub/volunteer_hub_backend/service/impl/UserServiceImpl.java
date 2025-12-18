package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateProfileRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.UserProfileResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.BaseEntity;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Registration;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.RegistrationStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RegistrationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RoleRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final RegistrationRepository registrationRepository;

    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository,
            PasswordEncoder passwordEncoder, RegistrationRepository registrationRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.registrationRepository = registrationRepository;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
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
    public User findByEmail(String email) {
        return userRepository.findByEmailIgnoreCaseWithRoleOptional(email).orElse(null);
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
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof UUID) {
            return (UUID) principal;
        }

        if (auth.getName() == null) {
            return null;
        }
        return userRepository.findByEmailIgnoreCase(auth.getName())
                .map(BaseEntity::getId)
                .orElse(null);
    }

    @Override
    public User findUserById(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    @Override
    public User updateUserProfile(UUID userId, String name, String email) {
        User user = findUserById(userId);

        // Cập nhật name nếu có
        if (name != null && !name.isBlank()) {
            user.setName(name);
        }

        // Cập nhật email nếu có
        if (email != null && !email.isBlank()) {
            email = email.toLowerCase();
            // Kiểm tra email đã tồn tại chưa (ngoại trừ user hiện tại)
            if (!user.getEmail().equalsIgnoreCase(email) && userRepository.existsByEmailIgnoreCase(email)) {
                throw new IllegalArgumentException("Email already exists!");
            }
            user.setEmail(email);
        }

        return userRepository.save(user);
    }

    public void updateUserAvatar(UUID userId, String avatarUrl) {
        User user = findUserById(userId);
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }

    @Override
    public UserProfileResponse getUserProfile(UUID userId) {
        User user = findUserById(userId);
        return UserProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Override
    public UserProfileResponse updateUserProfile(UUID userId, UpdateProfileRequest request) {
        User updated = this.updateUserProfile(userId, request.getName(), request.getEmail());
        if (request.getAvatarUrl() != null) {
            updated.setAvatarUrl(request.getAvatarUrl());
            updated = userRepository.save(updated);
        }
        return UserProfileResponse.builder()
                .userId(updated.getId())
                .name(updated.getName())
                .email(updated.getEmail())
                .avatarUrl(updated.getAvatarUrl())
                .isActive(updated.getIsActive())
                .createdAt(updated.getCreatedAt())
                .updatedAt(updated.getUpdatedAt())
                .build();
    }

    @Override
    public List<EventResponseDTO> getUserEvents(UUID userId) {

        findUserById(userId);
        List<Registration> registrations = registrationRepository.findByVolunteerId(userId);
        return registrations.stream().map(registration -> {
            var event = registration.getEvent();
            return EventResponseDTO.builder()
                    .eventId(event.getId())
                    .title(event.getTitle())
                    .description(event.getDescription())
                    .location(event.getLocation())
                    .startTime(event.getStartTime())
                    .endTime(event.getEndTime())
                    .maxVolunteers(event.getMaxVolunteers())
                    .thumbnailUrl(event.getThumbnailUrl())
                    .createdByName(event.getCreatedBy() == null ? null : event.getCreatedBy().getName())
                    .registrationStatus(registration.getRegistrationStatus().toString())
                    .registeredAt(registration.getCreatedAt())
                    .isCompleted(registration.getRegistrationStatus() == RegistrationStatus.COMPLETED)
                    .completionNotes(registration.getCompletionNotes())
                    .adminApprovalStatus(event.getAdminApprovalStatus().toString())
                    .createdAt(event.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }
}