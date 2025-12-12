package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardStatsDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.LeaderboardResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.DashboardService;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardAPI {

    private final DashboardService dashboardService;

    /**
     * Get public dashboard: top 5 posts, trending events, and stats.
     * Accessible to all authenticated users (volunteer, manager, admin).
     */
    @GetMapping
    // @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDashboard() {
        DashboardDTO dashboard = dashboardService.buildDashboard();
        return ResponseEntity.ok(ResponseDTO.<DashboardDTO>builder()
                .message("Dashboard data retrieved successfully")
                .data(dashboard)
                .build());
    }

    /**
     * Get personal dashboard stats: posts count, events participated, volunteer
     * hours, etc.
     * GET /api/dashboard/stats?userId=<uuid> (admin can query others)
     * Or just /api/dashboard/stats (returns authenticated user stats)
     */
    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getStats(@PathVariable UUID userId) {
        try {
            // [TEST MODE] If userId provided, return that user's stats
            // Otherwise, get from JWT token (SecurityContextHolder)
            DashboardStatsDTO stats = dashboardService.getDashboardStats();
            return ResponseEntity.ok(ResponseDTO.builder()
                    .message("Dashboard stats retrieved successfully")
                    .data(stats)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.builder()
                            .message("Failed to retrieve dashboard stats")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Get leaderboard by metric.
     * GET
     * /api/dashboard/leaderboard?metric=hours&timeframe=all&limit=50&viewerId=<uuid>
     * Metrics: hours, events, score (default: score)
     * Timeframe: all, month, year (default: all)
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard(
            @RequestParam(required = false, defaultValue = "score") String metric,
            @RequestParam(required = false, defaultValue = "all") String timeframe,
            @RequestParam(required = false, defaultValue = "50") int limit,
            @RequestParam(required = false) UUID viewerId) {
        try {
            // [TEST MODE] viewerId passed as query param
            LeaderboardResponseDTO leaderboard = dashboardService.getLeaderboard(metric, timeframe, limit, viewerId);
            return ResponseEntity.ok(ResponseDTO.<LeaderboardResponseDTO>builder()
                    .message("Leaderboard retrieved successfully")
                    .data(leaderboard)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.builder()
                            .message("Failed to retrieve leaderboard")
                            .detail(e.getMessage())
                            .build());
        }
    }
}
/*
 * # Get leaderboard by hours
 * curl "http://localhost:8080/api/dashboard/leaderboard?metric=hours&limit=10"
 * 
 * # Get leaderboard by events
 * curl "http://localhost:8080/api/dashboard/leaderboard?metric=events"
 * 
 * # Get leaderboard with viewer rank
 * curl
 * "http://localhost:8080/api/dashboard/leaderboard?metric=score&viewerId=<uuid>"
 * 
 * # Get dashboard stats
 * curl "http://localhost:8080/api/dashboard/stats"
 */

/*
 * Tham số (query params)
 * 
 * metric (String, optional) — chỉ số để sắp xếp. Giá trị hợp lệ:
 * "hours": xếp theo tổng giờ tình nguyện (tính từ các registration đã hoàn
 * thành và thời lượng event)
 * "events": xếp theo số sự kiện đã tham gia (completed registrations)
 * "score": xếp theo công thức score (mặc định)
 * Mặc định: "score"
 * timeframe (String, optional) — phạm vi thời gian (hiện API nhận "all" |
 * "month" | "year"). Lưu ý: ở code hiện tại timeframe được truyền nhưng chưa
 * thực hiện lọc theo thời gian (hiện dùng toàn bộ dữ liệu).
 * Mặc định: "all"
 * limit (int, optional) — số hàng tối đa trả về. Mặc định 50.
 * viewerId (UUID, optional) — nếu truyền UUID của người xem, API sẽ tìm rank
 * của người đó trong danh sách đã tính và trả viewerRank (số thứ hạng). Nếu
 * không truyền thì viewerRank = null.
 */