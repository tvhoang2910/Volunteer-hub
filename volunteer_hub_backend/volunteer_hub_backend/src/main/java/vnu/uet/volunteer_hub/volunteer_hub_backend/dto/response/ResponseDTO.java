package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ResponseDTO<T> {
    private T data;
    private String message;
    private String detail;

    // Static factory methods (tùy chọn)
    public static <T> ResponseDTO<T> success(T data, String message) {
        return ResponseDTO.<T>builder()
                .data(data)
                .message(message)
                .build();
    }

    public static <T> ResponseDTO<T> error(String message, String detail) {
        return ResponseDTO.<T>builder()
                .message(message)
                .detail(detail)
                .build();
    }
}