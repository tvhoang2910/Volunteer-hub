package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationCompletionRequest {
    private String completionNotes;
}
