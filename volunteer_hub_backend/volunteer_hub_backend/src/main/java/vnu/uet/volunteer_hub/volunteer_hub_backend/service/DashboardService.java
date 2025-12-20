package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.List;
import java.util.UUID;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardStatsDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.LeaderboardResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ManagerStatsDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.TrendingEventDTO;

public interface DashboardService {
    List<TrendingEventDTO> getTrendingEvents(int limit);

    DashboardStatsDTO getDashboardStats();

    /**
     * Get manager-specific dashboard stats.
     * Counts only events created by the manager, unique members in those events,
     * and posts in those events.
     * 
     * @param managerId the ID of the manager (creator of events)
     * @return ManagerStatsDTO with manager-specific counts
     */
    ManagerStatsDTO getManagerDashboardStats(UUID managerId);

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
