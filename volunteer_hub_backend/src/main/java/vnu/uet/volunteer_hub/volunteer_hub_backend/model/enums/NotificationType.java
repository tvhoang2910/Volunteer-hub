package vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums;

/**
 * Loại thông báo gửi đến user
 * 
 * REGISTRATION_SUBMITTED: User đã nộp đơn đăng ký
 * REGISTRATION_CONFIRMED: Admin đã duyệt đơn đăng ký
 * REGISTRATION_REJECTED: Admin từ chối đơn đăng ký
 * COMPLETION_MARKED: Admin xác nhận user hoàn thành sự kiện
 * EVENT_CREATED_PENDING: Sự kiện mới được tạo, chờ duyệt
 * EVENT_APPROVED: Sự kiện được admin phê duyệt
 * EVENT_REJECTED: Sự kiện bị admin từ chối
 * EVENT_UPDATED: Thông tin sự kiện được cập nhật
 * NEW_POST: Có bài viết mới trong sự kiện
 * NEW_COMMENT: Có comment mới trong bài viết
 * ACCOUNT_LOCKED: Tài khoản bị khóa
 * ACCOUNT_UNLOCKED: Tài khoản được mở khóa
 * SYSTEM_ANNOUNCEMENT: Thông báo hệ thống
 * DATA_EXPORT_READY: Dữ liệu export đã sẵn sàng
 */
public enum NotificationType {
    REGISTRATION_SUBMITTED,
    REGISTRATION_CONFIRMED,
    REGISTRATION_REJECTED,
    COMPLETION_MARKED,
    EVENT_CREATED_PENDING,
    EVENT_APPROVED,
    EVENT_REJECTED,
    EVENT_UPDATED,
    NEW_POST,
    NEW_COMMENT,
    ACCOUNT_LOCKED,
    ACCOUNT_UNLOCKED,
    SYSTEM_ANNOUNCEMENT,
    DATA_EXPORT_READY
}
