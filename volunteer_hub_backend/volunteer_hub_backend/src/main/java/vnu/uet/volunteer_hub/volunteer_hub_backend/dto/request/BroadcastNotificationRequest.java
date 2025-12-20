package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO cho request broadcast notification (Admin only)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BroadcastNotificationRequest {

    @NotBlank(message = "Title không được để trống")
    @Size(max = 200, message = "Title không được vượt quá 200 ký tự")
    private String title;

    @NotBlank(message = "Content không được để trống")
    @Size(max = 5000, message = "Content không được vượt quá 5000 ký tự")
    private String content;

    /**
     * Danh sách ID user cần gửi thông báo
     * Null hoặc empty nếu sendToAll = true
     */
    private List<UUID> targetUserIds;

    /**
     * Gửi đến tất cả user trong hệ thống
     * Mặc định = false
     */
    @Builder.Default
    private Boolean sendToAll = false;
}
