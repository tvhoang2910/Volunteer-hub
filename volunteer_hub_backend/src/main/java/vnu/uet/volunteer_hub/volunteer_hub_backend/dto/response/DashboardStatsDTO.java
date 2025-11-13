package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalEvents;
    private long approvedEvents;
    private long pendingEvents;
    private long totalVolunteers;
    private long totalRegistrations;
    private long newEventsThisWeek;
    private long newPostsThisWeek;
}
