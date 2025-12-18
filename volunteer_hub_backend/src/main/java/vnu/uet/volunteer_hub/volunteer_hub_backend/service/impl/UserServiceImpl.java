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
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.UserRoleType;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RegistrationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RoleRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

/**
 * UserServiceImpl
 * <p>
 * Xử lý toàn bộ nghiệp vụ liên quan đến người dùng:
 * đăng ký, quản lý hồ sơ, đổi mật khẩu, khoá/mở khoá tài khoản
 * và truy xuất danh sách sự kiện đã tham gia.
 * </p>
 */
@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger =
            LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final RegistrationRepository registrationRepository;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           RegistrationRepository registrationRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.registrationRepository = registrationRepository;
    }

    /* ============================================================
     * AUTH / REGISTRATION
     * ============================================================ */

    @Override
    public void registerUser(RegistrationRequest registrationRequest) {

        if (userRepository.existsByEmailIgnoreCase(registrationRequest.getEmail())) {
            throw new IllegalArgumentException("Email already exists!");
        }

        if (!registrationRequest.getPassword()
                .equals(registrationRequest.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp!");
        }

        if (registrationRequest.getName() == null
                || registrationRequest.getName().isBlank()) {
            throw new IllegalArgumentException("Họ tên không được để trống!");
        }

        UserRoleType requestedRole =
                UserRoleType.fromString(
                        registrationRequest.getRole() == null
                                ? UserRoleType.VOLUNTEER.name()
                                : registrationRequest.getRole());

        if (requestedRole == null) {
            throw new IllegalArgumentException("Vai trò không hợp lệ");
        }

        if (requestedRole == UserRoleType.ADMIN) {
            throw new IllegalArgumentException(
                    "Không được tự đăng ký vai trò ADMIN");
        }

        User user = new User();
        user.setEmail(registrationRequest.getEmail().toLowerCase());
        user.setName(registrationRequest.getName().trim());
        user.setPassword(passwordEncoder.encode(
                registrationRequest.getPassword()));
        user.setAccountType(requestedRole);

        String roleName =
                requestedRole == UserRoleType.MANAGER
                        ? "MANAGER"
                        : "VOLUNTEER";

        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() ->
                        new RuntimeException(
                                roleName + " role not found"));

        user.getRoles().add(role);

        logger.info("Saving new user: {}", user.getEmail());
        userRepository.save(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmailIgnoreCase(email);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository
                .findByEmailIgnoreCaseWithRoleOptional(email)
                .orElse(null);
    }

    /* ============================================================
     * PASSWORD / ACCOUNT STATUS
     * ============================================================ */

    @Override
    public void updatePassword(String email, String newPassword) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void lockUserById(UUID id) {
        User user = findUserById(id);
        user.setIsActive(Boolean.FALSE);
        userRepository.save(user);
    }

    @Override
    public void unlockUserById(UUID id) {
        User user = findUserById(id);
        user.setIsActive(Boolean.TRUE);
        userRepository.save(user);
    }

    /* ============================================================
     * AUTH CONTEXT
     * ============================================================ */

    @Override
    public UUID getViewerIdFromAuthentication(Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof UUID uuid) {
            return uuid;
        }

        if (auth.getName() == null) {
            return null;
        }

        return userRepository
                .findByEmailIgnoreCase(auth.getName())
                .map(BaseEntity::getId)
                .orElse(null);
    }

    /* ============================================================
     * PROFILE
     * ============================================================ */

    @Override
    public User findUserById(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("UserId cannot be null");
        }
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + userId));
    }

    @Override
    public User updateUserProfile(UUID userId,
                                  String name,
                                  String email) {

        User user = findUserById(userId);

        if (name != null && !name.isBlank()) {
            user.setName(name);
        }

        if (email != null && !email.isBlank()) {
            email = email.toLowerCase();
            if (!user.getEmail().equalsIgnoreCase(email)
                    && userRepository.existsByEmailIgnoreCase(email)) {
                throw new IllegalArgumentException("Email already exists!");
            }
            user.setEmail(email);
        }

        return userRepository.save(user);
    }

    @Override
    public UserProfileResponse getUserProfile(UUID userId) {
        User user = findUserById(userId);
        return UserProfileResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Override
    public UserProfileResponse updateUserProfile(UUID userId,
                                                 UpdateProfileRequest request) {

        User updated =
                updateUserProfile(
                        userId,
                        request.getName(),
                        request.getEmail());

        return UserProfileResponse.builder()
                .userId(updated.getId())
                .name(updated.getName())
                .email(updated.getEmail())
                .isActive(updated.getIsActive())
                .createdAt(updated.getCreatedAt())
                .updatedAt(updated.getUpdatedAt())
                .build();
    }

    /* ============================================================
     * USER EVENTS
     * ============================================================ */

    @Override
    public List<EventResponseDTO> getUserEvents(UUID userId) {

        findUserById(userId);

        List<Registration> registrations =
                registrationRepository.findByVolunteerId(userId);

        return registrations.stream()
                .map(registration -> {
                    var event = registration.getEvent();
                    return EventResponseDTO.builder()
                            .eventId(event.getId())
                            .title(event.getTitle())
                            .description(event.getDescription())
                            .location(event.getLocation())
                            .startTime(event.getStartTime())
                            .endTime(event.getEndTime())
                            .maxVolunteers(event.getMaxVolunteers())
                            .createdByName(
                                    event.getCreatedBy() == null
                                            ? null
                                            : event.getCreatedBy().getName())
                            .registrationStatus(
                                    registration.getRegistrationStatus().toString())
                            .registeredAt(registration.getCreatedAt())
                            .isCompleted(registration.getIsCompleted())
                            .completionNotes(
                                    registration.getCompletionNotes())
                            .adminApprovalStatus(
                                    event.getAdminApprovalStatus().toString())
                            .createdAt(event.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
