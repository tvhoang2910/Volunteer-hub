package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.DashboardStatsDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.TrendingEventDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.EventRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RegistrationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.DashboardService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.TopPostsCacheService;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {
    private final PostRepository postRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final TopPostsCacheService topPostsCacheService;

    public DashboardServiceImpl(PostRepository postRepository, EventRepository eventRepository,
            RegistrationRepository registrationRepository, UserRepository userRepository,
            TopPostsCacheService topPostsCacheService) {
        this.postRepository = postRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.topPostsCacheService = topPostsCacheService;
    }

    /**
     * Get trending events: approved events sorted by registration + post count +
     * recency.
     */
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
