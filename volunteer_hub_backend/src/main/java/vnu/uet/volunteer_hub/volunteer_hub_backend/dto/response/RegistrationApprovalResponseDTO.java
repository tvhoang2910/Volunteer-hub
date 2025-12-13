package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RegistrationApprovalResponseDTO {
    private String registrationId;
    private String userId;
    private String userName;
    private String eventTitle;
    private String registrationStatus;
    private String message;
}
