package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidateResetTokenRequest {

    @NotBlank(message = "Token không được để trống")
    private String token;
}
