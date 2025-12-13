package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CheckInResponseDTO {
    private String registrationId;
    private String eventTitle;
    private String userName;
    private Boolean isCheckedIn;
    private String message;
}
