package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.BroadcastNotificationRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.PushSubscriptionRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.NotificationResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Notification;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PushSubscription;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.NotificationType;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.NotificationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PushSubscriptionRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.NotificationService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;

/**
 * Implementation của NotificationService
 * Chứa toàn bộ business logic xử lý thông báo
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PushSubscriptionRepository pushSubscriptionRepository;

    /**
     * Lấy danh sách thông báo với phân trang, sort theo ngày mới nhất
     */
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDTO> getNotifications(UUID recipientId, Boolean isRead, int page, int size) {
        log.debug("Getting notifications for user: {}, isRead: {}, page: {}, size: {}",
                recipientId, isRead, page, size);

        // Validate input
        if (page < 0 || size <= 0) {
            throw new IllegalArgumentException("Page must be >= 0 and size must be > 0");
        }

        // Sort theo createdAt giảm dần (mới nhất lên đầu)
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Notification> notifications;
        if (isRead == null) {
            notifications = notificationRepository.findByRecipientId(recipientId, pageable);
        } else {
            notifications = notificationRepository.findByRecipientIdAndIsRead(recipientId, isRead, pageable);
        }

        log.debug("Found {} notifications for user: {}", notifications.getTotalElements(), recipientId);
        return notifications.map(this::toDto);
    }

    /**
     * Đếm số lượng thông báo chưa đọc (isRead = false)
     * Tối ưu query bằng countBy thay vì findAll
     */
    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(UUID userId) {
        log.debug("Getting unread count for user: {}", userId);

        Long count = notificationRepository.countByRecipientIdAndIsRead(userId, false);

        log.debug("Unread count for user {}: {}", userId, count);
        return count;
    }

    /**
     * Đánh dấu 1 thông báo là đã đọc
     * Kiểm tra quyền sở hữu trước khi update
     */
    @Override
    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        log.debug("Marking notification {} as read by user: {}", notificationId, userId);

        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, userId)
                .orElseThrow(() -> {
                    log.error("Notification {} not found or user {} doesn't have permission",
                            notificationId, userId);
                    return new RuntimeException("Notification not found or you don't have permission");
                });

        // Chỉ update nếu chưa đọc (tránh update không cần thiết)
        if (!notification.getIsRead()) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
            log.info("Notification {} marked as read by user: {}", notificationId, userId);
        } else {
            log.debug("Notification {} already marked as read", notificationId);
        }
    }

    /**
     * Đánh dấu TẤT CẢ thông báo của user là đã đọc
     * Sử dụng batch update để tối ưu hiệu năng
     */
    @Override
    @Transactional
    public int markAllAsRead(UUID userId) {
        log.debug("Marking all notifications as read for user: {}", userId);

        int updatedCount = notificationRepository.markAllAsReadByRecipientId(userId);

        log.info("Marked {} notifications as read for user: {}", updatedCount, userId);
        return updatedCount;
    }

    /**
     * Xóa 1 thông báo (hard delete)
     * Kiểm tra quyền sở hữu trước khi xóa
     */
    @Override
    @Transactional
    public void deleteNotification(UUID notificationId, UUID userId) {
        log.debug("Deleting notification {} by user: {}", notificationId, userId);

        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, userId)
                .orElseThrow(() -> {
                    log.error("Notification {} not found or user {} doesn't have permission",
                            notificationId, userId);
                    return new RuntimeException("Notification not found or you don't have permission");
                });

        notificationRepository.delete(notification);
        log.info("Notification {} deleted by user: {}", notificationId, userId);
    }

    /**
     * Xóa tất cả thông báo của user (hard delete)
     * Sử dụng batch delete để tối ưu
     */
    @Override
    @Transactional
    public int deleteAllNotifications(UUID userId) {
        log.debug("Deleting all notifications for user: {}", userId);

        int deletedCount = notificationRepository.deleteAllByRecipientId(userId);

        log.info("Deleted {} notifications for user: {}", deletedCount, userId);
        return deletedCount;
    }

    /**
     * Gửi thông báo broadcast một cách bất đồng bộ (Admin only)
     * Sử dụng @Async để không block request
     * Enqueue vào queue và xử lý trong background
     */
    @Override
    @Async
    @Transactional
    public Future<Integer> broadcastNotificationAsync(BroadcastNotificationRequest request, UUID adminId) {
        log.info("Broadcasting notification asynchronously by admin: {}", adminId);

        try {
            // Validate request
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Title cannot be empty");
            }
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                throw new IllegalArgumentException("Content cannot be empty");
            }

            List<User> recipients;

            if (Boolean.TRUE.equals(request.getSendToAll())) {
                // Gửi cho tất cả user active trong hệ thống
                log.debug("Broadcasting to all active users (async)");
                recipients = userRepository.findByIsActive(true);

                if (recipients.isEmpty()) {
                    log.warn("No active users found to send notification");
                    return CompletableFuture.completedFuture(0);
                }
            } else {
                // Gửi cho danh sách user cụ thể
                if (request.getTargetUserIds() == null || request.getTargetUserIds().isEmpty()) {
                    throw new IllegalArgumentException("targetUserIds cannot be empty when sendToAll is false");
                }

                log.debug("Broadcasting to {} specific users (async)", request.getTargetUserIds().size());
                recipients = userRepository.findAllById(request.getTargetUserIds());

                if (recipients.isEmpty()) {
                    throw new IllegalArgumentException("No valid users found from targetUserIds");
                }

                if (recipients.size() < request.getTargetUserIds().size()) {
                    log.warn("Some users from targetUserIds were not found. Expected: {}, Found: {}",
                            request.getTargetUserIds().size(), recipients.size());
                }
            }

            // Tạo notification cho từng recipient
            List<Notification> notifications = new ArrayList<>();
            for (User recipient : recipients) {
                Notification notification = new Notification();
                notification.setRecipient(recipient);
                notification.setTitle(request.getTitle());
                notification.setBody(request.getContent());
                notification.setNotificationType(NotificationType.SYSTEM_ANNOUNCEMENT);
                notification.setIsRead(false);
                notifications.add(notification);
            }

            // Batch save để tối ưu (trong background)
            List<Notification> savedNotifications = notificationRepository.saveAll(notifications);

            log.info("Successfully broadcasted {} notifications asynchronously by admin: {}",
                    savedNotifications.size(), adminId);

            // TODO: Implement actual Web Push sending logic here
            // For each recipient, look up their push subscriptions and send via Web Push
            // API

            return CompletableFuture.completedFuture(savedNotifications.size());
        } catch (Exception e) {
            log.error("Failed to broadcast notifications asynchronously", e);
            throw e;
        }
    }

    /**
     * Lưu subscription Web Push của user
     * Nếu subscription đã tồn tại (cùng userId và endpoint), cập nhật keys
     */
    @Override
    @Transactional
    public void saveSubscription(PushSubscriptionRequest request, UUID userId) {
        log.debug("Saving push subscription for user: {}", userId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        // Validate request
        if (request.getEndpoint() == null || request.getEndpoint().trim().isEmpty()) {
            throw new IllegalArgumentException("Endpoint cannot be empty");
        }
        if (request.getP256dh() == null || request.getP256dh().trim().isEmpty()) {
            throw new IllegalArgumentException("P256dh key cannot be empty");
        }
        if (request.getAuth() == null || request.getAuth().trim().isEmpty()) {
            throw new IllegalArgumentException("Auth key cannot be empty");
        }

        // Check if subscription already exists
        Optional<PushSubscription> existingSubscription = pushSubscriptionRepository.findByUserIdAndEndpoint(userId,
                request.getEndpoint());

        if (existingSubscription.isPresent()) {
            // Update existing subscription
            PushSubscription subscription = existingSubscription.get();
            subscription.setP256dh(request.getP256dh());
            subscription.setAuth(request.getAuth());
            pushSubscriptionRepository.save(subscription);
            log.info("Updated existing push subscription for user: {}", userId);
        } else {
            // Create new subscription
            PushSubscription subscription = new PushSubscription();
            subscription.setUser(user);
            subscription.setEndpoint(request.getEndpoint());
            subscription.setP256dh(request.getP256dh());
            subscription.setAuth(request.getAuth());
            pushSubscriptionRepository.save(subscription);
            log.info("Created new push subscription for user: {}", userId);
        }
    }

    /**
     * Helper method: Convert Entity sang DTO
     * Tách biệt logic mapping để dễ maintain
     */
    private NotificationResponseDTO toDto(Notification notification) {
        return NotificationResponseDTO.builder()
                .notificationId(notification.getId())
                .recipientId(notification.getRecipient() != null ? notification.getRecipient().getId() : null)
                .eventId(notification.getEvent() != null ? notification.getEvent().getId() : null)
                .title(notification.getTitle())
                .body(notification.getBody())
                .notificationType(notification.getNotificationType() != null
                        ? notification.getNotificationType().name()
                        : null)
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
