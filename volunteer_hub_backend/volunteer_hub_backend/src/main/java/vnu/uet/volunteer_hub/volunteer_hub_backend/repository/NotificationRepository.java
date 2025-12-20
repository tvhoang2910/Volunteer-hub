package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Notification;

/**
 * Repository để tương tác với bảng notifications
 * Chỉ chứa query methods, không có business logic
 */
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /**
     * Lấy danh sách thông báo của user với phân trang
     */
    Page<Notification> findByRecipientId(UUID recipientId, Pageable pageable);

    /**
     * Lấy danh sách thông báo của user theo trạng thái đã đọc với phân trang
     */
    Page<Notification> findByRecipientIdAndIsRead(UUID recipientId, Boolean isRead, Pageable pageable);

    /**
     * Đếm số lượng thông báo theo trạng thái đã đọc
     */
    Long countByRecipientIdAndIsRead(UUID recipientId, Boolean isRead);

    /**
     * Tìm thông báo theo ID và kiểm tra quyền sở hữu
     */
    Optional<Notification> findByIdAndRecipientId(UUID id, UUID recipientId);

    /**
     * Đánh dấu tất cả thông báo chưa đọc của user thành đã đọc
     * 
     * @return số lượng notification được update
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :recipientId AND n.isRead = false")
    int markAllAsReadByRecipientId(@Param("recipientId") UUID recipientId);

    /**
     * Xóa tất cả thông báo của user
     * 
     * @return số lượng notification bị xóa
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :recipientId")
    int deleteAllByRecipientId(@Param("recipientId") UUID recipientId);
}
