package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LeaderboardResponseDTO {
    private List<LeaderboardEntryDTO> entries;
    private Integer viewerRank;
    private String metric;
    private String timeframe;
}
