package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.*;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Registration;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.RegistrationStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.EventRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RegistrationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.DashboardService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.TopPostsCacheService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {
    private final PostRepository postRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final TopPostsCacheService topPostsCacheService;
    private final RedisTemplate<String, Object> redisTemplate;

    public DashboardServiceImpl(PostRepository postRepository, EventRepository eventRepository,
            RegistrationRepository registrationRepository, UserRepository userRepository,
            TopPostsCacheService topPostsCacheService, RedisTemplate<String, Object> redisTemplate) {
        this.postRepository = postRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.topPostsCacheService = topPostsCacheService;
        this.redisTemplate = redisTemplate;
    }

    /**
     * Get trending events: approved events sorted by registration + post count +
     * recency.
     */
    @Transactional(readOnly = true)
    public List<TrendingEventDTO> getTrendingEvents(int limit) {
        return eventRepository.findAll().stream()
                .filter(e -> e.getAdminApprovalStatus() == EventApprovalStatus.APPROVED)
                .map(this::mapToTrendingEventDTO)
                .sorted((a, b) -> Double.compare(b.getTrendingScore(), a.getTrendingScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get dashboard stats: totals and weekly counts.
     */
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long totalEvents = eventRepository.count();
        long approvedEvents = eventRepository.findAll().stream()
                .filter(e -> e.getAdminApprovalStatus() == EventApprovalStatus.APPROVED)
                .count();
        long pendingEvents = eventRepository.findAll().stream()
                .filter(e -> e.getAdminApprovalStatus() == EventApprovalStatus.PENDING)
                .count();
        long totalVolunteers = userRepository.count();
        long totalRegistrations = registrationRepository.count();

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long newEventsThisWeek = eventRepository.findAll().stream()
                .filter(e -> e.getCreatedAt() != null && e.getCreatedAt().isAfter(sevenDaysAgo))
                .count();
        long newPostsThisWeek = postRepository.findAll().stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(sevenDaysAgo))
                .count();

        return DashboardStatsDTO.builder()
                .totalEvents(totalEvents)
                .approvedEvents(approvedEvents)
                .pendingEvents(pendingEvents)
                .totalVolunteers(totalVolunteers)
                .totalRegistrations(totalRegistrations)
                .newEventsThisWeek(newEventsThisWeek)
                .newPostsThisWeek(newPostsThisWeek)
                .build();
    }

    /**
     * Get complete dashboard: top posts + trending events + stats.
     */
    @Transactional(readOnly = true)
    public DashboardDTO buildDashboard() {
        List<ScoredPostDTO> topPosts = topPostsCacheService.getTopPostsCached(5);
        List<TrendingEventDTO> trendingEvents = getTrendingEvents(5);
        DashboardStatsDTO stats = getDashboardStats();

        return DashboardDTO.builder()
                .topPosts(topPosts)
                .trendingEvents(trendingEvents)
                .stats(stats)
                .build();
    }

    /**
     * Get leaderboard sorted by metric (hours, events, score).
     * Computes volunteer hours from completed registrations.
     */
    @Override
    @Transactional(readOnly = true)
    public LeaderboardResponseDTO getLeaderboard(String metric, String timeframe, int limit, UUID viewerId) {
        // Fetch all users with completed registrations
        List<User> users = userRepository.findAll();

        // Build leaderboard entries
        List<LeaderboardEntryDTO> entries = users.stream()
                .map(user -> {
                    // Get completed registrations
                    List<Registration> completedRegs = registrationRepository.findAll().stream()
                            .filter(r -> r.getVolunteer().getId().equals(user.getId())
                                    && r.getRegistrationStatus() == RegistrationStatus.COMPLETED)
                            .toList();

                    // Calculate volunteer hours (sum of event durations)
                    double volunteerHours = completedRegs.stream()
                            .mapToDouble(r -> {
                                Event event = r.getEvent();
                                if (event != null && event.getEndTime() != null
                                        && event.getStartTime() != null) {
                                    long minutes = java.time.temporal.ChronoUnit.MINUTES
                                            .between(
                                                    event.getStartTime(),
                                                    event.getEndTime());
                                    return minutes / 60.0; // Convert to hours
                                }
                                return 0.0;
                            }).sum();

                    // Count events participated
                    int eventsParticipated = completedRegs.size();

                    // Compute score: hours * 10 + events * 50
                    int score = (int) (volunteerHours * 10 + eventsParticipated * 50);

                    return LeaderboardEntryDTO.builder()
                            .userId(user.getId())
                            .name(user.getName())
                            .avatarUrl(null) // TODO: add avatar field to User
                            .volunteerHours(volunteerHours)
                            .eventsParticipated(eventsParticipated)
                            .score(score)
                            .metric(metric)
                            .build();
                })
                .sorted((LeaderboardEntryDTO a, LeaderboardEntryDTO b) -> {
                    if ("hours".equalsIgnoreCase(metric)) {
                        return Double.compare(b.getVolunteerHours(), a.getVolunteerHours());
                    } else if ("events".equalsIgnoreCase(metric)) {
                        return Integer.compare(b.getEventsParticipated(),
                                a.getEventsParticipated());
                    } else { // score
                        return Integer.compare(b.getScore(), a.getScore());
                    }
                })
                .limit(limit)
                .collect(Collectors.toList());

        // Add ranks
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        // Find viewer's rank if viewerId provided
        Integer viewerRank = null;
        if (viewerId != null) {
            for (LeaderboardEntryDTO entry : entries) {
                if (entry.getUserId().equals(viewerId)) {
                    viewerRank = entry.getRank();
                    break;
                }
            }
        }

        return LeaderboardResponseDTO.builder()
                .entries(entries)
                .viewerRank(viewerRank)
                .metric(metric)
                .timeframe(timeframe)
                .build();
    }

    /**
     * Refresh leaderboard cache (called by scheduler).
     * For now, just precompute top entries for common metrics.
     */
    @Override
    @Transactional
    public void refreshLeaderboardCache() {
        // Precompute top 50 for each metric and cache in Redis
        LeaderboardResponseDTO topByHours = getLeaderboard("hours", "all", 50, null);
        LeaderboardResponseDTO topByEvents = getLeaderboard("events", "all", 50, null);
        LeaderboardResponseDTO topByScore = getLeaderboard("score", "all", 50, null);

        // Store in Redis with TTL
        redisTemplate.opsForValue().set("leaderboard:hours", topByHours, java.time.Duration.ofHours(1));
        redisTemplate.opsForValue().set("leaderboard:events", topByEvents, java.time.Duration.ofHours(1));
        redisTemplate.opsForValue().set("leaderboard:score", topByScore, java.time.Duration.ofHours(1));
    }

    // Helper: map Event to TrendingEventDTO
    private TrendingEventDTO mapToTrendingEventDTO(Event event) {
        int registrationCount = event.getRegistrations() == null ? 0 : event.getRegistrations().size();
        int postCount = event.getPosts() == null ? 0 : event.getPosts().size();

        // Trending score = registration count + (post count × 2) + recency bonus
        double trendingScore = registrationCount + (postCount * 2.0);

        // Add recency bonus: newer events get higher score
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        if (event.getCreatedAt() != null && event.getCreatedAt().isAfter(sevenDaysAgo)) {
            trendingScore += 10.0; // Bonus for new events
        }

        return TrendingEventDTO.builder()
                .eventId(event.getId())
                .title(event.getTitle())
                .location(event.getLocation())
                .startTime(event.getStartTime())
                .createdAt(event.getCreatedAt())
                .creatorName(event.getCreatedBy() == null ? "" : event.getCreatedBy().getName())
                .registrationCount(registrationCount)
                .postCount(postCount)
                .approvalStatus(event.getAdminApprovalStatus() == null ? ""
                        : event.getAdminApprovalStatus().name())
                .trendingScore(trendingScore)
                .build();
    }
}
