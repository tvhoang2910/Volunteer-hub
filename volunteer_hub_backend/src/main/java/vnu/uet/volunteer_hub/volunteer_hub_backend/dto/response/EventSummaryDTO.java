package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventSummaryDTO {
    private UUID id;
    private String title;
    private String location;
    private LocalDateTime startTime;
}
