package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardAPI {

    private final DashboardService dashboardService;

    public DashboardAPI(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Get public dashboard: top 5 posts, trending events, and stats.
     * Accessible to all authenticated users (volunteer, manager, admin).
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getDashboard() {
        DashboardDTO dashboard = dashboardService.buildDashboard();
        return ResponseEntity.ok(ResponseDTO.<DashboardDTO>builder()
                .message("Dashboard data retrieved successfully")
                .data(dashboard)
                .build());
    }
}
