package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.BroadcastNotificationRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.PushSubscriptionRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.NotificationResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.UnreadCountResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.NotificationService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PushService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Controller xử lý các API về Notification
 * Tuân thủ 3-Layer Architecture: chỉ xử lý HTTP request/response
 * Toàn bộ business logic nằm ở NotificationService
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationAPI {

    private final NotificationService notificationService;
    private final PushService pushService;
    private final UserService userService;

    @Value("${push.vapid.public-key:}")
    private String vapidPublicKey;

    /**
     * GET /api/notifications
     * Lấy danh sách thông báo của user hiện tại
     * Phân trang, sort theo ngày mới nhất
     */
    @GetMapping
    public ResponseEntity<ResponseDTO<Page<NotificationResponseDTO>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Boolean isRead) { // TODO: Remove after auth, get from SecurityContext
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);
            log.debug("GET /api/notifications - userId: {}, page: {}, limit: {}, isRead: {}",
                    userId, page, limit, isRead);

            // TODO: Sau khi có authentication, lấy userId từ SecurityContext

            Page<NotificationResponseDTO> result = notificationService.getNotifications(userId, isRead,
                    page, limit);

            return ResponseEntity.ok(
                    ResponseDTO.<Page<NotificationResponseDTO>>builder()
                            .data(result)
                            .message("Get notifications successfully")
                            .build());

        } catch (IllegalArgumentException e) {
            log.error("Invalid input for get notifications: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseDTO.<Page<NotificationResponseDTO>>builder()
                            .message("Invalid input: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to get notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<Page<NotificationResponseDTO>>builder()
                            .message("Failed to get notifications")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * GET /api/notifications/unread-count
     * Đếm số lượng thông báo chưa đọc (isRead = false)
     * Tối ưu query đếm
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ResponseDTO<UnreadCountResponseDTO>> getUnreadCount() { // TODO: Remove after auth
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);
            log.debug("GET /api/notifications/unread-count - userId: {}", userId);

            // TODO: Get from SecurityContext after auth
            Long count = notificationService.getUnreadCount(userId);

            UnreadCountResponseDTO response = UnreadCountResponseDTO.builder()
                    .unreadCount(count)
                    .build();

            return ResponseEntity.ok(
                    ResponseDTO.<UnreadCountResponseDTO>builder()
                            .data(response)
                            .message("Get unread count successfully")
                            .build());

        } catch (Exception e) {
            log.error("Failed to get unread count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<UnreadCountResponseDTO>builder()
                            .message("Failed to get unread count")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * PUT /api/notifications/{id}/read
     * Đánh dấu 1 thông báo là đã đọc
     * Kiểm tra ownership trước khi update
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ResponseDTO<String>> markAsRead(
            @PathVariable UUID id) { // TODO: Remove after auth
        try {
            log.debug("PUT /api/notifications/{}/read", id);

            // TODO: Get from SecurityContext after auth
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);
            notificationService.markAsRead(id, userId);

            return ResponseEntity.ok(
                    ResponseDTO.<String>builder()
                            .data("Notification marked as read successfully")
                            .message("Success")
                            .build());

        } catch (RuntimeException e) {
            log.error("Failed to mark notification as read: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseDTO.<String>builder()
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to mark notification as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<String>builder()
                            .message("Failed to mark notification as read")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * PUT /api/notifications/read-all
     * Đánh dấu TẤT CẢ thông báo của user là đã đọc
     * Batch update
     */
    @PutMapping("/read-all")
    public ResponseEntity<ResponseDTO<String>> markAllAsRead() { // TODO: Remove after auth
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);
            log.debug("PUT /api/notifications/read-all - userId: {}", userId);

            // TODO: Get from SecurityContext after auth
            int updatedCount = notificationService.markAllAsRead(userId);

            return ResponseEntity.ok(
                    ResponseDTO.<String>builder()
                            .data(updatedCount + " notifications marked as read")
                            .message("All notifications marked as read successfully")
                            .build());

        } catch (Exception e) {
            log.error("Failed to mark all notifications as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<String>builder()
                            .message("Failed to mark all notifications as read")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * DELETE /api/notifications/{id}
     * Xóa (hard delete) 1 thông báo
     * Kiểm tra ownership trước khi xóa
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO<String>> deleteNotification(
            @PathVariable UUID id) { // TODO: Remove after auth
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);
            log.debug("DELETE /api/notifications/{} - userId: {}", id, userId);

            // TODO: Get from SecurityContext after auth
            notificationService.deleteNotification(id, userId);

            return ResponseEntity.ok(
                    ResponseDTO.<String>builder()
                            .data("Notification deleted successfully")
                            .message("Success")
                            .build());

        } catch (RuntimeException e) {
            log.error("Failed to delete notification: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ResponseDTO.<String>builder()
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to delete notification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<String>builder()
                            .message("Failed to delete notification")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * DELETE /api/notifications/all
     * Xóa tất cả thông báo của user
     * Batch delete
     */
    @DeleteMapping("/all")
    public ResponseEntity<ResponseDTO<String>> deleteAllNotifications() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);
            log.debug("DELETE /api/notifications/all - userId: {}", userId);

            // TODO: Get from SecurityContext after auth
            int deletedCount = notificationService.deleteAllNotifications(userId);

            return ResponseEntity.ok(
                    ResponseDTO.<String>builder()
                            .data(deletedCount + " notifications deleted")
                            .message("All notifications deleted successfully")
                            .build());

        } catch (Exception e) {
            log.error("Failed to delete all notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<String>builder()
                            .message("Failed to delete all notifications")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * POST /api/notifications/subscription
     * Lưu subscription Web Push cho user
     * Input: endpoint, p256dh, auth keys
     */
    @PostMapping("/subscription")
    public ResponseEntity<ResponseDTO<String>> saveSubscription(
            @Valid @RequestBody PushSubscriptionRequest request,
            @RequestParam UUID userId) { // TODO: Remove after auth, get from SecurityContext
        try {
            log.debug("POST /api/notifications/subscription - userId: {}", userId);

            // TODO: Get from SecurityContext after auth
            // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // UUID userId = userService.getViewerIdFromAuthentication(auth);

            notificationService.saveSubscription(request, userId);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ResponseDTO.<String>builder()
                            .data("Subscription saved successfully")
                            .message("Success")
                            .build());

        } catch (IllegalArgumentException e) {
            log.error("Invalid subscription request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseDTO.<String>builder()
                            .message("Invalid input: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to save subscription", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<String>builder()
                            .message("Failed to save subscription")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * POST /api/notifications/broadcast (Admin only)
     * Gửi thông báo đến danh sách user hoặc toàn bộ
     * Input: title, content, targetUserIds (array) hoặc sendToAll (boolean)
     * Sử dụng async queue để không block request
     */
    // @PreAuthorize("hasRole('ADMIN')") // TODO: Enable after auth setup
    @PostMapping("/broadcast/{adminId}")
    public ResponseEntity<ResponseDTO<String>> broadcastNotification(
            @Valid @RequestBody BroadcastNotificationRequest request,
            @PathVariable UUID adminId) { // TODO: Remove after auth, get from SecurityContext
        try {
            log.info("POST /api/notifications/broadcast - adminId: {}", adminId);

            // TODO: Get adminId from SecurityContext after auth
            // TODO: Add @PreAuthorize("hasRole('ADMIN')") để kiểm tra quyền admin

            // Sử dụng async method để không block
            Future<Integer> future = notificationService.broadcastNotificationAsync(request, adminId);

            // Try to get a quick result so we can return enqueued count if available.
            try {
                int enqueuedCount = future.get(500, TimeUnit.MILLISECONDS);
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(
                        ResponseDTO.<String>builder()
                                .data(enqueuedCount
                                        + " notifications enqueued for processing")
                                .message("Broadcast notification request accepted")
                                .build());
            } catch (TimeoutException te) {
                // Not ready yet - still accepted
                log.debug("broadcastNotificationAsync did not return immediately, responding accepted without count");
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(
                        ResponseDTO.<String>builder()
                                .data("Broadcast request accepted and is being processed")
                                .message("Broadcast notification request accepted")
                                .build());
            } catch (InterruptedException | ExecutionException ex) {
                log.error("Failed to retrieve enqueued count", ex);
                return ResponseEntity.status(HttpStatus.ACCEPTED).body(
                        ResponseDTO.<String>builder()
                                .data("Broadcast request accepted (count unavailable)")
                                .message("Broadcast notification request accepted")
                                .build());
            }

        } catch (IllegalArgumentException e) {
            log.error("Invalid broadcast request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ResponseDTO.<String>builder()
                            .message("Invalid input: " + e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Failed to broadcast notification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<String>builder()
                            .message("Failed to broadcast notification")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * GET /api/notifications/vapid-public-key
     * Lấy VAPID public key để frontend subscribe push notifications
     * Trả về base64url encoded key
     */
    @GetMapping("/vapid-public-key")
    public ResponseEntity<String> getVapidPublicKey() {
        try {
            log.debug("GET /api/notifications/vapid-public-key");

            if (vapidPublicKey == null || vapidPublicKey.isEmpty()) {
                log.warn("VAPID public key not configured");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("VAPID public key not configured");
            }

            return ResponseEntity.ok(vapidPublicKey);

        } catch (Exception e) {
            log.error("Failed to get VAPID public key", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get VAPID public key");
        }
    }

    /**
     * GET /api/notifications/delivery/stats
     * Lấy thống kê delivery status (success, failed, invalid, rate-limited,
     * network-error)
     */
    @GetMapping("/delivery/stats")
    public ResponseEntity<ResponseDTO<PushService.PushDeliveryStats>> getDeliveryStats() {
        try {
            log.debug("GET /api/notifications/delivery/stats");

            PushService.PushDeliveryStats stats = pushService.getDeliveryStats();

            return ResponseEntity.ok(
                    ResponseDTO.<PushService.PushDeliveryStats>builder()
                            .data(stats)
                            .message("Get delivery stats successfully")
                            .build());

        } catch (Exception e) {
            log.error("Failed to get delivery stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<PushService.PushDeliveryStats>builder()
                            .message("Failed to get delivery stats")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * POST /api/notifications/delivery/retry
     * Retry gửi push thất bại (FAILED status, retryCount < 3)
     */
    @PostMapping("/delivery/retry")
    public ResponseEntity<ResponseDTO<String>> retryFailedDeliveries() {
        try {
            log.info("POST /api/notifications/delivery/retry");

            int retriedCount = pushService.retryFailedDeliveries();

            return ResponseEntity.ok(
                    ResponseDTO.<String>builder()
                            .data(retriedCount + " failed deliveries retried successfully")
                            .message("Retry completed")
                            .build());

        } catch (Exception e) {
            log.error("Failed to retry deliveries", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<String>builder()
                            .message("Failed to retry deliveries")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * POST /api/notifications/delivery/cleanup
     * Cleanup các subscription không hợp lệ (410 Gone status)
     * Xóa subscription khỏi DB
     */
    @PostMapping("/delivery/cleanup")
    public ResponseEntity<ResponseDTO<String>> cleanupInvalidSubscriptions() {
        try {
            log.info("POST /api/notifications/delivery/cleanup");

            int cleanedCount = pushService.cleanupInvalidSubscriptions();

            return ResponseEntity.ok(
                    ResponseDTO.<String>builder()
                            .data(cleanedCount + " invalid subscriptions cleaned up")
                            .message("Cleanup completed")
                            .build());

        } catch (Exception e) {
            log.error("Failed to cleanup subscriptions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ResponseDTO.<String>builder()
                            .message("Failed to cleanup subscriptions")
                            .detail(e.getMessage())
                            .build());
        }
    }

}
