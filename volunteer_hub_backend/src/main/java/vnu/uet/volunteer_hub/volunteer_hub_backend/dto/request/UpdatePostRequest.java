package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating a post.
 * 
 * TODO (Future):
 * - Add field for updating eventId if needed
 * - Add field for updating visibility/status
 * - Add validation for content length
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdatePostRequest {

    @NotBlank(message = "Content cannot be blank")
    private String content;

    /**
     * Danh sách URL ảnh đính kèm (optional)
     */
    private List<String> imageUrls;

}
