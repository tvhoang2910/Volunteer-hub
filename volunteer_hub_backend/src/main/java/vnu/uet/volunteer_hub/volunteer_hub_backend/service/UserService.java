package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import org.springframework.security.core.Authentication;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;

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

    void lockUserById(UUID id);

    void unlockUserById(UUID id);

    UUID getViewerIdFromAuthentication(Authentication auth);
}
