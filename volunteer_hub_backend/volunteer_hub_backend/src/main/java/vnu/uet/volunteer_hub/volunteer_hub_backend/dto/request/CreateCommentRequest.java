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

    /**
     * TODO [TEST MODE]: Sau khi test xong, xóa field này.
     * userId được thêm để test dễ hơn, thay vì lấy từ Authentication.
     */
    private UUID userId;
}
