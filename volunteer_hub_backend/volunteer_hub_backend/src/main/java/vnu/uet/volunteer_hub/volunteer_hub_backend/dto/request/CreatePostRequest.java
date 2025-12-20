package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreatePostRequest {

    @NotNull(message = "Event ID cannot be null")
    private UUID eventId;

    @NotBlank(message = "Content cannot be blank")
    private String content;

    /**
     * Danh sách URL ảnh đính kèm (optional)
     */
    private List<String> imageUrls;
}
