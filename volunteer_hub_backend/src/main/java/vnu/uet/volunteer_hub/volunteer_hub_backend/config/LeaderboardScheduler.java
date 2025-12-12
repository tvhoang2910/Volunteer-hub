package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.DashboardService;

/**
 * Scheduler to periodically refresh leaderboard cache.
 * Runs every hour to precompute top entries for leaderboard metrics.
 * Also triggered manually when an event completes.
 */
@Component
@EnableScheduling
@RequiredArgsConstructor
public class LeaderboardScheduler {

    private final DashboardService dashboardService;

    /**
     * Refresh leaderboard cache every hour.
     * Precomputes top entries for each metric (hours, events, score).
     */
    @Scheduled(fixedRateString = "${leaderboard.refresh-interval:3600000}") // Default: 1 hour (3600000 ms)
    public void refreshLeaderboardCache() {
        try {
            dashboardService.refreshLeaderboardCache();
            System.out.println("[LeaderboardScheduler] Leaderboard cache refreshed at " + System.currentTimeMillis());
        } catch (Exception e) {
            System.err.println("[LeaderboardScheduler] Error refreshing leaderboard: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Refresh leaderboard every day at 2 AM (02:00).
     * Useful for computing weekly/monthly leaderboards.
     */
    @Scheduled(cron = "0 0 2 * * *") // Every day at 2 AM
    public void dailyLeaderboardRefresh() {
        try {
            dashboardService.refreshLeaderboardCache();
            System.out.println("[LeaderboardScheduler] Daily leaderboard refresh completed");
        } catch (Exception e) {
            System.err.println("[LeaderboardScheduler] Error in daily refresh: " + e.getMessage());
        }
    }

    /**
     * Could be called manually from EventService when an event completes.
     * Example: After marking registration as completed in
     * EventService.completeEvent()
     */
    public void triggerLeaderboardUpdate() {
        refreshLeaderboardCache();
    }
}
