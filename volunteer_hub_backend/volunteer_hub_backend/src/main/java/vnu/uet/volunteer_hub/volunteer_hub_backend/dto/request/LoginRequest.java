package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO cho việc login bằng email và password.
 */
@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    /**
     * Optional: The role the user wants to login as.
     * If provided, the backend will verify that the user has at least this role.
     * Possible values: VOLUNTEER, MANAGER, ADMIN
     */
    private String role;
}