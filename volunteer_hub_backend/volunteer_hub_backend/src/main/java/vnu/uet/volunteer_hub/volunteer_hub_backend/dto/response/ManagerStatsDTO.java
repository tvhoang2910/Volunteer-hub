package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for manager-specific dashboard statistics.
 * Contains counts for only events created by the current manager.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagerStatsDTO {
    /**
     * Total number of approved events created by this manager.
     */
    private long totalEvents;
    
    /**
     * Total number of unique members registered in manager's approved events.
     * A user is counted once even if they joined multiple events.
     */
    private long totalMembers;
    
    /**
     * Total number of posts in manager's approved events.
     */
    private long totalPosts;
}
