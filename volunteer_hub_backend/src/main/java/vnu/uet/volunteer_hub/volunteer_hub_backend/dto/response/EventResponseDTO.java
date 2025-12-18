package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import java.util.UUID;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event response DTO cho portfolio tình nguyện của user.
 * Dùng cho GET /api/users/{userId}/events endpoint.
 * Chứa thông tin sự kiện và trạng thái đăng ký của user.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventResponseDTO {

    private UUID eventId;

    private String title;

    private String description;

    private String location;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer maxVolunteers;

    private String thumbnailUrl;

    /**
     * Tên người tạo sự kiện
     */
    private String createdByName;

    /**
     * Trạng thái đăng ký của user cho sự kiện này
     * (PENDING, APPROVED, REJECTED, COMPLETED)
     */
    private String registrationStatus;

    /**
     * Ngày đăng ký
     */
    private LocalDateTime registeredAt;

    /**
     * Liệu tình nguyện viên đã hoàn thành sự kiện hay chưa
     */
    private Boolean isCompleted;

    /**
     * Ghi chú hoàn thành (nếu có)
     */
    private String completionNotes;

    /**
     * Trạng thái duyệt sự kiện từ admin
     * (PENDING, APPROVED, REJECTED)
     */
    private String adminApprovalStatus;

    private LocalDateTime createdAt;
}
