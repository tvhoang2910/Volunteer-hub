package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import org.springframework.security.core.Authentication;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateProfileRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.UserProfileResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;

import java.util.List;
import java.util.UUID;

public interface UserService {
    void registerUser(RegistrationRequest registrationRequest);

    boolean existsByEmail(String email);

    /**
     * Tìm user theo email (case-insensitive).
     * 
     * @param email email của user
     * @return User entity hoặc null nếu không tìm thấy
     */
    User findByEmail(String email);

    void updatePassword(String email, String newPassword);

    void lockUserById(UUID userId);

    void unlockUserById(UUID userId);

    UUID getViewerIdFromAuthentication(Authentication auth);

    /**
     * Tìm user theo ID (entity-level).
     */
    User findUserById(UUID userId);

    /**
     * Cập nhật thông tin profile của user (entity-level).
     */
    User updateUserProfile(UUID userId, String name, String email);

    /**
     * Cập nhật avatar URL của user.
     */
    void updateUserAvatar(UUID userId, String avatarUrl);

    // --- Service methods that return DTOs (mapping happens in service layer) ---
    UserProfileResponse getUserProfile(UUID userId);

    UserProfileResponse updateUserProfile(UUID userId, UpdateProfileRequest request);

    List<EventResponseDTO> getUserEvents(UUID userId);
}
