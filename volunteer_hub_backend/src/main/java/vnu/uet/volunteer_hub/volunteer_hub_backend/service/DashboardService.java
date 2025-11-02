package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.List;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardStatsDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.TrendingEventDTO;

public interface DashboardService {
    List<TrendingEventDTO> getTrendingEvents(int limit);

    DashboardStatsDTO getDashboardStats();

    DashboardDTO buildDashboard();
}