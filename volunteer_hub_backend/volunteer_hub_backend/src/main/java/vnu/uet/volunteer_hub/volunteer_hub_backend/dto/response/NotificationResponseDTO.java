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
public class NotificationResponseDTO {
    private UUID notificationId;
    private UUID recipientId;
    private UUID eventId;

    private String title;
    private String body;
    private String notificationType;

    private Boolean isRead;
    private LocalDateTime createdAt;
}
