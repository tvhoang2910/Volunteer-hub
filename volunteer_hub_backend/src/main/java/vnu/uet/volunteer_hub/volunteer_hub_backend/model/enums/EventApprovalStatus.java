package vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums;

/**
 * Trạng thái duyệt sự kiện bởi admin
 * 
 * PENDING: Chờ admin duyệt (mặc định khi tạo sự kiện)
 * APPROVED: Đã được admin phê duyệt (hiển thị công khai)
 * REJECTED: Bị admin từ chối
 */
public enum EventApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED
}
