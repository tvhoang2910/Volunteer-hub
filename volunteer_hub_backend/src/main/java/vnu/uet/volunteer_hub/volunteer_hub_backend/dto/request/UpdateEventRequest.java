package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho request cập nhật sự kiện
 * Tất cả các field đều optional để cho phép cập nhật từng phần
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEventRequest {

    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    private String title;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    @Size(max = 500, message = "Địa điểm không được vượt quá 500 ký tự")
    private String location;

    @Future(message = "Thời gian bắt đầu phải ở tương lai")
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Positive(message = "Số lượng tình nguyện viên phải là số dương")
    private Integer maxVolunteers;

    private String thumbnailUrl;
}
