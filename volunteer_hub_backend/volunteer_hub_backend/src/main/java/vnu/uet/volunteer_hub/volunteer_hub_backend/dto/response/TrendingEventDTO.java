package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import java.util.UUID;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrendingEventDTO {
    private UUID eventId;
    private String title;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime createdAt;
    private String creatorName;
    private int registrationCount;
    private int postCount;
    private String approvalStatus;
    private double trendingScore;
}
