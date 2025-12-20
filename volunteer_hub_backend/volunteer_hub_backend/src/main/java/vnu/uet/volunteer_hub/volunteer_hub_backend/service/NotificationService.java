package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.UUID;
import java.util.concurrent.Future;

import org.springframework.data.domain.Page;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.BroadcastNotificationRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.PushSubscriptionRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.NotificationResponseDTO;

/**
 * Service interface cho business logic của Notification
 * Chứa tất cả các method xử lý logic nghiệp vụ
 */
public interface NotificationService {

    /**
     * Lấy danh sách thông báo của user với phân trang và filter
     * 
     * @param recipientId ID của user
     * @param isRead      Filter theo trạng thái đã đọc (null = lấy tất cả)
     * @param page        Số trang (bắt đầu từ 0)
     * @param size        Số lượng item mỗi trang
     * @return Page chứa danh sách NotificationResponseDTO
     */
    Page<NotificationResponseDTO> getNotifications(UUID recipientId, Boolean isRead, int page, int size);

    /**
     * Đếm số lượng thông báo chưa đọc của user
     * 
     * @param userId ID của user
     * @return Số lượng thông báo chưa đọc
     */
    Long getUnreadCount(UUID userId);

    /**
     * Đánh dấu 1 thông báo là đã đọc
     * Kiểm tra quyền sở hữu trước khi update
     * 
     * @param notificationId ID của notification
     * @param userId         ID của user
     * @throws RuntimeException nếu không tìm thấy hoặc không có quyền
     */
    void markAsRead(UUID notificationId, UUID userId);

    /**
     * Đánh dấu TẤT CẢ thông báo của user là đã đọc
     * Sử dụng batch update cho hiệu năng
     * 
     * @param userId ID của user
     * @return Số lượng notification được đánh dấu
     */
    int markAllAsRead(UUID userId);

    /**
     * Xóa 1 thông báo (hard delete)
     * Kiểm tra quyền sở hữu trước khi xóa
     * 
     * @param notificationId ID của notification
     * @param userId         ID của user
     * @throws RuntimeException nếu không tìm thấy hoặc không có quyền
     */
    void deleteNotification(UUID notificationId, UUID userId);

    /**
     * Xóa tất cả thông báo của user (hard delete)
     * 
     * @param userId ID của user
     * @return Số lượng notification bị xóa
     */
    int deleteAllNotifications(UUID userId);

    /**
     * Gửi thông báo broadcast đến nhiều user một cách bất đồng bộ (Admin only)
     * Không block request, enqueue vào queue để xử lý sau
     * 
     * @param request Chứa title, content, targetUserIds hoặc sendToAll
     * @param adminId ID của admin thực hiện action
     * @return Future chứa số lượng notification được enqueue
     * @throws IllegalArgumentException nếu dữ liệu không hợp lệ
     */
    Future<Integer> broadcastNotificationAsync(BroadcastNotificationRequest request, UUID adminId);

    /**
     * Lưu subscription Web Push của user
     * 
     * @param request Chứa endpoint, p256dh, auth keys
     * @param userId  ID của user
     * @throws IllegalArgumentException nếu dữ liệu không hợp lệ
     */
    void saveSubscription(PushSubscriptionRequest request, UUID userId);
}
