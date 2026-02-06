package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/**
 * Entity lưu trữ log gửi Web Push notification
 * Dùng để tracking delivery status, retry, và debug
 */
@Getter
@Setter
@Entity
@Table(name = "push_delivery_logs", indexes = {
        @Index(name = "idx_user_id", columnList = "user_id"),
        @Index(name = "idx_endpoint", columnList = "endpoint"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_created_at", columnList = "created_at")
})
@AttributeOverride(name = "id", column = @Column(name = "log_id", nullable = false, updatable = false))
@Comment("Bảng lưu log gửi Web Push notification cho user")
@AllArgsConstructor
@Builder
public class PushDeliveryLog extends BaseEntity {

    @Comment("ID của user nhận push")
    @Column(name = "user_id", nullable = false)
    private String userId;

    @Comment("Endpoint URL nhận push")
    @Column(name = "endpoint", nullable = false, length = 500)
    private String endpoint;

    @Comment("ID của notification gửi")
    @Column(name = "notification_id")
    private String notificationId;

    @Comment("HTTP Status code từ push service (200, 410, 429, v.v.)")
    @Column(name = "http_status_code")
    private Integer httpStatusCode;

    @Comment("Trạng thái delivery: SUCCESS, FAILED, INVALID_SUBSCRIPTION, RATE_LIMITED, NETWORK_ERROR")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PushDeliveryStatus status;

    @Comment("Chi tiết lỗi nếu có")
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Comment("Số lần thử gửi (retry count)")
    @Builder.Default
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Comment("Request body gửi (payload)")
    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    public PushDeliveryLog() {
    }

    public enum PushDeliveryStatus {
        PENDING, // Chờ gửi
        SUCCESS, // Gửi thành công (HTTP 201)
        FAILED, // Gửi thất bại (5xx)
        INVALID_SUBSCRIPTION, // Endpoint không hợp lệ (410 Gone)
        RATE_LIMITED, // Bị giới hạn tốc độ (429)
        NETWORK_ERROR, // Lỗi kết nối
        MALFORMED_PAYLOAD // Payload không hợp lệ (400)
    }
}
