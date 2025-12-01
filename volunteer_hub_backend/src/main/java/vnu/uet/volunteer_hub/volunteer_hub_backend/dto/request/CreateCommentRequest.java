package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateCommentRequest {
    @NotBlank(message = "Content cannot be empty")
    private String content;

    private UUID parentId;
}
