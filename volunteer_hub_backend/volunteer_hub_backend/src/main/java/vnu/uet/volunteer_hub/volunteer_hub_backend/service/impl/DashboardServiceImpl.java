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
     * Uses optimized query to avoid N+1 problem.
     */
    @Transactional(readOnly = true)
    public List<TrendingEventDTO> getTrendingEvents(int limit) {
        // Use optimized query with JOIN FETCH to avoid N+1
        return eventRepository.findAllWithCreatorAndStats().stream()
                .filter(e -> e.getAdminApprovalStatus() == EventApprovalStatus.APPROVED)
                .map(this::mapToTrendingEventDTO)
                .sorted((a, b) -> Double.compare(b.getTrendingScore(), a.getTrendingScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get dashboard stats: totals and weekly counts.
     * Uses COUNT queries to avoid loading all entities into memory.
     */
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        // Use efficient COUNT queries instead of findAll().stream().filter().count()
        long totalEvents = eventRepository.count();
        long approvedEvents = eventRepository.countByAdminApprovalStatus(EventApprovalStatus.APPROVED);
        long pendingEvents = eventRepository.countByAdminApprovalStatus(EventApprovalStatus.PENDING);
        long totalVolunteers = userRepository.count();
        long totalRegistrations = registrationRepository.count();
        long totalPosts = postRepository.count();

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long newEventsThisWeek = eventRepository.countEventsCreatedAfter(sevenDaysAgo);
        long newPostsThisWeek = postRepository.countPostsCreatedAfter(sevenDaysAgo);

        return DashboardStatsDTO.builder()
                .totalEvents(totalEvents)
                .approvedEvents(approvedEvents)
                .pendingEvents(pendingEvents)
                .totalVolunteers(totalVolunteers)
                .totalRegistrations(totalRegistrations)
                .totalPosts(totalPosts)
                .newEventsThisWeek(newEventsThisWeek)
                .newPostsThisWeek(newPostsThisWeek)
                .build();
    }

    /**
     * Get manager-specific dashboard stats.
     * Counts only approved events created by this manager, unique members, and
     * posts.
     */
    @Override
    @Transactional(readOnly = true)
    public ManagerStatsDTO getManagerDashboardStats(UUID managerId) {
        // Get approved events created by this manager
        List<Event> managerApprovedEvents = eventRepository.findAllByCreatedBy_IdAndAdminApprovalStatus(
                managerId, EventApprovalStatus.APPROVED);

        long totalEvents = managerApprovedEvents.size();

        // If no approved events, return zeros
        if (totalEvents == 0) {
            return ManagerStatsDTO.builder()
                    .totalEvents(0)
                    .totalMembers(0)
                    .totalPosts(0)
                    .build();
        }

        // Get event IDs for querying members and posts
        List<UUID> eventIds = managerApprovedEvents.stream()
                .map(Event::getId)
                .collect(Collectors.toList());

        // Count unique volunteers registered in those events (no duplicates)
        long totalMembers = registrationRepository.countDistinctVolunteersByEventIdIn(eventIds);

        // Count posts in those events
        long totalPosts = postRepository.countPostsByEventIdIn(eventIds);

        return ManagerStatsDTO.builder()
                .totalEvents(totalEvents)
                .totalMembers(totalMembers)
                .totalPosts(totalPosts)
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
        // Fetch all completed registrations with event and volunteer in ONE query (fix
        // N+1)
        List<Registration> allCompletedRegs = registrationRepository
                .findAllByRegistrationStatusWithEventAndVolunteer(RegistrationStatus.COMPLETED);

        // Group registrations by user ID
        java.util.Map<UUID, List<Registration>> regsByUser = allCompletedRegs.stream()
                .collect(Collectors.groupingBy(r -> r.getVolunteer().getId()));

        // Fetch all users with roles eagerly loaded (fix N+1)
        List<User> users = userRepository.findAllWithRoles();

        // Build leaderboard entries
        List<LeaderboardEntryDTO> entries = users.stream()
                .map(user -> {
                    // Get completed registrations from pre-fetched map (no extra queries!)
                    List<Registration> completedRegs = regsByUser.getOrDefault(user.getId(), List.of());

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
                            .avatarUrl(user.getAvatarUrl())
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
