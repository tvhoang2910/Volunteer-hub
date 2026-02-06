package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class PostAutocompleteDTO {
    private UUID postId;

    private String content;

    public PostAutocompleteDTO(UUID postId, String content) {
        this.content = content;
        this.postId = postId;
    }
}
