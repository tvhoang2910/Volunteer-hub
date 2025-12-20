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
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Notification;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PushSubscription;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.NotificationType;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.NotificationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PushSubscriptionRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.NotificationService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PushService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.WebPushPayload;

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
    private final PushService pushService;

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
            } else if (request.getTargetRoles() != null && !request.getTargetRoles().isEmpty()) {
                // Gửi cho users theo role
                log.debug("Broadcasting to users with roles: {} (async)", request.getTargetRoles());
                recipients = userRepository.findActiveUsersByRoleNames(request.getTargetRoles());

                if (recipients.isEmpty()) {
                    log.warn("No active users found with specified roles: {}", request.getTargetRoles());
                    return CompletableFuture.completedFuture(0);
                }
                log.debug("Found {} users with specified roles", recipients.size());
            } else if (request.getTargetUserIds() != null && !request.getTargetUserIds().isEmpty()) {
                // Gửi cho danh sách user cụ thể
                log.debug("Broadcasting to {} specific users (async)", request.getTargetUserIds().size());
                recipients = userRepository.findAllById(request.getTargetUserIds());

                if (recipients.isEmpty()) {
                    throw new IllegalArgumentException("No valid users found from targetUserIds");
                }

                if (recipients.size() < request.getTargetUserIds().size()) {
                    log.warn("Some users from targetUserIds were not found. Expected: {}, Found: {}",
                            request.getTargetUserIds().size(), recipients.size());
                }
            } else {
                throw new IllegalArgumentException("Must specify either sendToAll=true, targetRoles, or targetUserIds");
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

            // Send Web Push to all recipients who have subscriptions
            sendWebPushToRecipients(recipients, request.getTitle(), request.getContent());

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

    // ==================== EVENT-BASED NOTIFICATION HELPERS ====================

    /**
     * Tạo notification chung với đầy đủ thông tin
     */
    @Override
    @Transactional
    public void createNotification(User recipient, Event event, String title, String body,
            NotificationType notificationType) {
        log.debug("Creating notification for user: {}, type: {}", recipient.getId(), notificationType);

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setEvent(event);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setNotificationType(notificationType);
        notification.setIsRead(false);

        notificationRepository.save(notification);
        log.info("Created notification for user: {}, type: {}", recipient.getId(), notificationType);
    }

    /**
     * Thông báo cho Manager khi có volunteer mới đăng ký sự kiện
     */
    @Override
    @Transactional
    public void notifyNewRegistration(Event event, User volunteer) {
        User manager = event.getCreatedBy();
        if (manager == null) {
            log.warn("Event {} has no creator, skipping notification", event.getId());
            return;
        }

        String title = "Đăng ký mới: " + event.getTitle();
        String body = String.format("Tình nguyện viên %s đã đăng ký tham gia sự kiện \"%s\". Vui lòng xem xét và phê duyệt.",
                volunteer.getName(), event.getTitle());

        createNotification(manager, event, title, body, NotificationType.REGISTRATION_SUBMITTED);
    }

    /**
     * Thông báo cho Volunteer khi đăng ký được duyệt
     */
    @Override
    @Transactional
    public void notifyRegistrationApproved(Event event, User volunteer) {
        String title = "Đăng ký được duyệt: " + event.getTitle();
        String body = String.format("Chúc mừng! Đơn đăng ký của bạn cho sự kiện \"%s\" đã được phê duyệt. Hãy chuẩn bị tham gia nhé!",
                event.getTitle());

        createNotification(volunteer, event, title, body, NotificationType.REGISTRATION_CONFIRMED);
    }

    /**
     * Thông báo cho Volunteer khi đăng ký bị từ chối
     */
    @Override
    @Transactional
    public void notifyRegistrationRejected(Event event, User volunteer) {
        String title = "Đăng ký bị từ chối: " + event.getTitle();
        String body = String.format("Rất tiếc, đơn đăng ký của bạn cho sự kiện \"%s\" không được phê duyệt. Bạn có thể tham gia các sự kiện khác.",
                event.getTitle());

        createNotification(volunteer, event, title, body, NotificationType.REGISTRATION_REJECTED);
    }

    /**
     * Thông báo cho Volunteer khi hoàn thành sự kiện
     */
    @Override
    @Transactional
    public void notifyRegistrationCompleted(Event event, User volunteer) {
        String title = "Hoàn thành sự kiện: " + event.getTitle();
        String body = String.format("Cảm ơn bạn đã tham gia và hoàn thành sự kiện \"%s\". Đóng góp của bạn rất có ý nghĩa!",
                event.getTitle());

        createNotification(volunteer, event, title, body, NotificationType.COMPLETION_MARKED);
    }

    // ==================== WEB PUSH HELPERS ====================

    /**
     * Gửi Web Push notifications cho danh sách recipients
     * Tìm tất cả subscriptions của mỗi user và gửi push
     */
    private void sendWebPushToRecipients(List<User> recipients, String title, String content) {
        log.info("[WebPush] ====== BẮT ĐẦU GỬI WEB PUSH ======");
        log.info("[WebPush] Số recipients: {}", recipients.size());
        
        int pushCount = 0;
        int usersWithSubscription = 0;
        
        for (User recipient : recipients) {
            // Lấy tất cả subscriptions của user
            List<PushSubscription> subscriptions = pushSubscriptionRepository.findByUserId(recipient.getId());
            
            log.info("[WebPush] User {} ({}) có {} subscriptions", 
                    recipient.getName(), recipient.getId(), subscriptions.size());
            
            if (subscriptions.isEmpty()) {
                continue;
            }
            
            usersWithSubscription++;
            
            // Tạo payload
            WebPushPayload payload = WebPushPayload.builder()
                    .title(title)
                    .body(content)
                    .icon("/logo192.png")
                    .badge("/badge.png")
                    .tag("broadcast-" + System.currentTimeMillis())
                    .build();
            
            // Gửi push tới tất cả devices của user
            for (PushSubscription subscription : subscriptions) {
                try {
                    log.info("[WebPush] Gửi push tới endpoint: {}...", 
                            subscription.getEndpoint().substring(0, Math.min(50, subscription.getEndpoint().length())));
                    pushService.sendPushAsync(subscription, payload);
                    pushCount++;
                } catch (Exception e) {
                    log.error("[WebPush] Lỗi gửi push tới subscription {}: {}", 
                            subscription.getId(), e.getMessage());
                }
            }
        }
        
        log.info("[WebPush] ====== KẾT THÚC GỬI WEB PUSH ======");
        log.info("[WebPush] Tổng: {} users có subscription, {} push đã gửi", usersWithSubscription, pushCount);
    }

    /**
     * Gửi Web Push notification cho một user cụ thể
     */
    private void sendWebPushToUser(User recipient, String title, String body) {
        List<PushSubscription> subscriptions = pushSubscriptionRepository.findByUserId(recipient.getId());
        
        if (subscriptions.isEmpty()) {
            log.debug("No push subscriptions for user: {}", recipient.getId());
            return;
        }
        
        WebPushPayload payload = WebPushPayload.builder()
                .title(title)
                .body(body)
                .icon("/logo192.png")
                .badge("/badge.png")
                .tag("notification-" + System.currentTimeMillis())
                .build();
        
        for (PushSubscription subscription : subscriptions) {
            try {
                pushService.sendPushAsync(subscription, payload);
            } catch (Exception e) {
                log.error("Failed to send push: {}", e.getMessage());
            }
        }
    }
}
