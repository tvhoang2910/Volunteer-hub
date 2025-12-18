package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.UserRoleType;

@Setter
@Getter
public class RegistrationRequest {

    @NotBlank(message = "Email khong duoc de trong")
    @Email(message = "Email khong hop le")
    private String email;

    @NotBlank(message = "Mat khau khong duoc de trong")
    @Size(min = 8, message = "Mat khau phai co it nhat 8 ky tu")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}:;\"',.<>?/\\\\|\\[\\]~`]).{8,}$", message = "Mat khau phai chua it nhat 1 chu hoa, 1 chu so va 1 ky tu dac biet")
    private String password;

    @NotBlank(message = "Xac nhan mat khau khong duoc de trong")
    private String confirmPassword;

    @NotBlank(message = "Ho va ten khong duoc de trong")
    private String name;

    @Pattern(
            regexp = "^(volunteer|manager)$",
            flags = Pattern.Flag.CASE_INSENSITIVE,
            message = "Chi duoc dang ky vai tro VOLUNTEER hoac MANAGER")
    private String role = UserRoleType.VOLUNTEER.name();
}
