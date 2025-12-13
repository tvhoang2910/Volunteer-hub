package vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums;

/**
 * Trạng thái đơn đăng ký tình nguyện
 * 
 * PENDING: Chờ duyệt (mặc định khi user đăng ký)
 * APPROVED: Đã được admin duyệt (user có thể check-in)
 * REJECTED: Bị từ chối bởi admin
 * WITHDRAWN: User tự hủy đăng ký
 * CHECKED_IN: User đã check-in tại sự kiện
 * COMPLETED: Admin xác nhận hoàn thành sự kiện
 */
public enum RegistrationStatus {
    PENDING,
    APPROVED,
    REJECTED,
    WITHDRAWN,
    CHECKED_IN,
    COMPLETED
}
