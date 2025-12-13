package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ParticipantResponseDTO {
    private UUID userId;
    private String userName;
    private String email;
    private String registrationStatus;
    private LocalDateTime registeredAt;
    private Boolean isCompleted;
    private Boolean isWithdrawn;
}
