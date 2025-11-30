package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO cho việc reset password dùng token (stateless).
 */
@Getter
@Setter
public class ResetPasswordRequest {

    @NotBlank(message = "Token không được để trống")
    private String token;

    @JsonAlias("password")
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}:;\"',.<>?/\\\\|\\[\\]~`]).{8,}$", message = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt")
    private String newPassword;

    // Optional: support confirm password when client sends it
    private String confirmPassword;
}
