package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.List;
import java.util.UUID;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardStatsDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.LeaderboardResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.TrendingEventDTO;

public interface DashboardService {
    List<TrendingEventDTO> getTrendingEvents(int limit);

    DashboardStatsDTO getDashboardStats();

    DashboardDTO buildDashboard();

    /**
     * Get leaderboard by metric (hours, events, score).
     * 
     * @param metric    one of: "hours", "events", "score"
     * @param timeframe one of: "all", "month", "year"
     * @param limit     max entries to return (default 50)
     * @param viewerId  optional viewer ID to compute viewer's rank
     * @return LeaderboardResponseDTO with sorted entries and viewer's rank
     */
    LeaderboardResponseDTO getLeaderboard(String metric, String timeframe, int limit, UUID viewerId);

    /**
     * Refresh leaderboard cache (called by scheduler after events complete).
     */
    void refreshLeaderboardCache();
}
