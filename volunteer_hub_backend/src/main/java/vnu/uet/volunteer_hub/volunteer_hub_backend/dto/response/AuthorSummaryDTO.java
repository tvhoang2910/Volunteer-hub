package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthorSummaryDTO {
    private UUID id;
    private String name;
    private String avatarUrl;
}
