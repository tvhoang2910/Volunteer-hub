package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.ReactionType;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostDetailResponse {

    private UUID postId;
    private UUID eventId;
    private String eventTitle;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int commentCount;
    private int reactionCount;
    private AuthorSummaryDTO author;
    private EventSummaryDTO event;
    private boolean isLikedByViewer;
    private ReactionType viewerReactionType;
}
