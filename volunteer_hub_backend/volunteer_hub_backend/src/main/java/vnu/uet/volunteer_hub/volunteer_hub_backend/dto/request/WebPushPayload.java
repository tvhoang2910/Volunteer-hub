package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload gửi trong Web Push message
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebPushPayload {
    private String title;
    private String body;
    private String icon;
    private String badge;
    private String tag;
    private String data; // JSON string hoặc liên kết đến resource
    private boolean requireInteraction;
}
