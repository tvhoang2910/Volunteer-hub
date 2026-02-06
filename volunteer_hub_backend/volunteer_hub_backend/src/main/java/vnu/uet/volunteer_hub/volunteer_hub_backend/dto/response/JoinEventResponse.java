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
public class JoinEventResponse {
    private UUID registrationId;
    private UUID eventId;
    private UUID userId;
    private String eventTitle;
    private String registrationStatus;
    private String message;
}
