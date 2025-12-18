package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho request tạo sự kiện mới
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    private String title;

    @NotBlank(message = "Mô tả không được để trống")
    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    @NotBlank(message = "Địa điểm không được để trống")
    @Size(max = 500, message = "Địa điểm không được vượt quá 500 ký tự")
    private String location;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @Future(message = "Thời gian bắt đầu phải ở tương lai")
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endTime;

    @Positive(message = "Số lượng tình nguyện viên phải là số dương")
    private Integer maxVolunteers;

    private String thumbnailUrl;
}
