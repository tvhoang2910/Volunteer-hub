package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import java.util.UUID;
import java.util.List;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ScoredPostDTO {
    private UUID postId;
    private UUID eventId;
    private String eventTitle;
    private String authorName;
    private String content;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private int commentCount;
    private int reactionCount;
    private double affinityScore;
    private double recencyFactor;
    private double totalScore;
    private AuthorSummaryDTO author;
    private EventSummaryDTO event;
    private Double personalizedScore;
}
