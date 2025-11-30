package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO cho viec reset password dang token (stateless).
 */
@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Token khong duoc de trong")
    private String token;

    @JsonAlias("password")
    @NotBlank(message = "Mat khau khong duoc de trong")
    @Size(min = 8, message = "Mat khau phai co it nhat 8 ky tu")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}:;\"',.<>?/\\\\|\\[\\]~`]).{8,}$",
            message = "Mat khau phai chua it nhat 1 chu hoa, 1 so va 1 ky tu dac biet")
    private String newPassword;

    // Optional: support confirm password when client sends it
    private String confirmPassword;
}
