package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import org.hibernate.annotations.Comment;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.NotificationType;

/**
 * Entity đại diện cho thông báo gửi đến user
 */
@Getter
@Setter
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_user_id", columnList = "user_id"),
        @Index(name = "idx_notifications_user_isread", columnList = "user_id,is_read"),
        @Index(name = "idx_notifications_created_at", columnList = "created_at DESC"),
        @Index(name = "idx_notifications_event_id", columnList = "event_id")
})
@AttributeOverride(name = "id", column = @Column(name = "notification_id", nullable = false, updatable = false))
@Comment("Bảng quản lý thông báo gửi đến user")
public class Notification extends BaseEntity {

    @Comment("ID của user nhận thông báo")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;

    @Comment("ID của sự kiện liên quan (null nếu không liên quan sự kiện)")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Comment("Tiêu đề thông báo")
    @Column(name = "title", nullable = false)
    private String title;

    @Comment("Nội dung chi tiết thông báo")
    @Column(name = "body", columnDefinition = "TEXT", nullable = false)
    private String body;

    @Comment("Loại thông báo và ý nghĩa: REGISTRATION_SUBMITTED: User đã nộp đơn đăng ký; REGISTRATION_CONFIRMED: Admin đã phê duyệt đơn đăng ký; REGISTRATION_REJECTED: Admin từ chối đơn đăng ký; COMPLETION_MARKED: Admin xác nhận user hoàn thành sự kiện; EVENT_CREATED_PENDING: Sự kiện mới được tạo, chờ admin duyệt; EVENT_APPROVED: Sự kiện được admin phê duyệt; EVENT_REJECTED: Sự kiện bị admin từ chối; EVENT_UPDATED: Organizer cập nhật thông tin sự kiện; NEW_POST: Có bài viết mới trong sự kiện; NEW_COMMENT: Có bình luận mới trên bài viết; ACCOUNT_LOCKED: Tài khoản bị khóa; ACCOUNT_UNLOCKED: Tài khoản được mở khóa; SYSTEM_ANNOUNCEMENT: Thông báo hệ thống; DATA_EXPORT_READY: Dữ liệu export đã sẵn sàng")
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", length = 100, nullable = false)
    private NotificationType notificationType;

    @Comment("Trạng thái đã đọc (true = đã đọc, false = chưa đọc)")
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = Boolean.FALSE;

    @PrePersist
    public void prePersist() {
        if (isRead == null) {
            isRead = Boolean.FALSE;
        }
    }
}
