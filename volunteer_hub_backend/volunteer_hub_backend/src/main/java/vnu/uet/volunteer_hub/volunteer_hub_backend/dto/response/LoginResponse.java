package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO cho login endpoint.
 * Chứa JWT token và thông tin user cơ bản.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    /**
     * JWT access token.
     * Client sử dụng token này trong header "Authorization: Bearer <token>"
     */
    private String accessToken;

    /**
     * Token type - luôn là "Bearer"
     */
    @Builder.Default
    private String tokenType = "Bearer";

    /**
     * Thời gian token hết hạn (milliseconds)
     */
    private Long expiresIn;

    /**
     * User ID (UUID string)
     */
    private String userId;

    /**
     * Email của user
     */
    private String email;

    /**
     * Role của user (VOLUNTEER, ORGANIZER, ADMIN)
     */
    private String role;

    /**
     * Tên hiển thị của user
     */
    private String displayName;
}
