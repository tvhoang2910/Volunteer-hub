package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LeaderboardEntryDTO {
    private int rank;
    private UUID userId;
    private String name;
    private String avatarUrl;
    private Double volunteerHours;
    private Integer eventsParticipated;
    private Integer score;
    private String metric;
}
