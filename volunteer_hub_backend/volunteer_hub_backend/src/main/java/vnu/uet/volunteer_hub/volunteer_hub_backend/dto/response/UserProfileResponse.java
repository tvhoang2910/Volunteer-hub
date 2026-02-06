package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import java.util.UUID;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User profile response DTO.
 * Dùng cho GET /api/users/{userId} endpoint.
 * Chứa thông tin cá nhân của user.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserProfileResponse {
    private UUID userId;

    private String name;

    private String email;

    private String avatarUrl;

    private Boolean isActive;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
