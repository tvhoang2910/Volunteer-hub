package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho báo cáo thống kê của sự kiện.
 * Dùng cho GET /api/events/{eventId}/report endpoint.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EventReportDTO {

    private UUID eventId;
    private String eventTitle;

    /**
     * Tiến độ sự kiện (% tình nguyện viên hoàn thành)
     */
    private int progress;

    /**
     * Tổng giờ đóng góp của tất cả tình nguyện viên
     */
    private double totalContributionHours;

    /**
     * Điểm hài lòng trung bình (N/A nếu chưa có đánh giá)
     */
    private String satisfactionScore;

    /**
     * Số sự cố được báo cáo
     */
    private int incidentCount;

    /**
     * Tổng số tình nguyện viên đã được duyệt
     */
    private int totalApprovedVolunteers;

    /**
     * Số tình nguyện viên đã check-in
     */
    private int checkedInCount;

    /**
     * Số tình nguyện viên đã hoàn thành
     */
    private int completedCount;

    /**
     * Số tình nguyện viên chưa hoàn thành (đã duyệt nhưng chưa hoàn thành)
     */
    private int incompleteCount;

    /**
     * Số tình nguyện viên vắng mặt (đã duyệt nhưng không check-in sau khi event kết thúc)
     */
    private int absentCount;

    /**
     * Danh sách điểm nhấn gần đây
     */
    private List<String> highlights;

    /**
     * Danh sách tình nguyện viên với thống kê chi tiết
     */
    private List<VolunteerReportDTO> volunteers;

    /**
     * DTO cho thông tin tình nguyện viên trong báo cáo
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class VolunteerReportDTO {
        private UUID id;
        private String name;
        private String email;
        private String avatarUrl;
        private String role;
        private double contributionHours;
        private String status; // "completed", "incomplete", "absent", "participating"
        private String registrationStatus;
    }
}
