package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardDTO {
    private List<ScoredPostDTO> topPosts;
    private List<TrendingEventDTO> trendingEvents;
    private DashboardStatsDTO stats;
}
