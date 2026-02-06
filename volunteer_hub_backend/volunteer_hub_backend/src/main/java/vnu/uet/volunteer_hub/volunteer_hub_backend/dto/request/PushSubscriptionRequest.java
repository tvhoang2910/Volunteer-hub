package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request lưu subscription Web Push
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PushSubscriptionRequest {

    @NotBlank(message = "Endpoint không được để trống")
    private String endpoint;

    @NotBlank(message = "P256dh key không được để trống")
    private String p256dh;

    @NotBlank(message = "Auth key không được để trống")
    private String auth;
}
