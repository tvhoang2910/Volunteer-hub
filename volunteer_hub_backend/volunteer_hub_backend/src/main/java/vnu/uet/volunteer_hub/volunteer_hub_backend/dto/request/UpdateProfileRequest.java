package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Update profile request DTO.
 * Dùng cho PUT /api/users/profile endpoint.
 * Client có thể cập nhật name.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateProfileRequest {

    /**
     * Tên mới của user (optional)
     */
    private String name;

    /**
     * Email mới của user (optional)
     * Lưu ý: Email phải unique trong hệ thống
     */
    private String email;

    /**
     * Avatar URL (optional)
     */
    private String avatarUrl;
}
