package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentResponse {
    private UUID id;
    private String content;
    private UUID userId;
    private String userName;
    private UUID postId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
