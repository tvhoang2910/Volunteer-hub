package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;
import nl.martijndwars.webpush.Notification;
import org.apache.http.HttpResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.WebPushPayload;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PushDeliveryLog;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PushSubscription;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PushDeliveryLogRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PushSubscriptionRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PushService;

import java.security.GeneralSecurityException;
import java.security.Security;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;

/**
 * Implementation của PushService
 * Gửi Web Push notification, retry, cleanup, và logging
 *
 * Lưu ý: Cần cấu hình VAPID keys trong application.properties:
 * push.vapid.public-key=...
 * push.vapid.private-key=...
 * push.vapid.subject=mailto:admin@example.com
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PushServiceImpl implements PushService {

    private final PushDeliveryLogRepository pushDeliveryLogRepository;
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final ObjectMapper objectMapper;

    @Value("${push.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${push.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${push.vapid.subject:mailto:admin@volunteerHub.vn}")
    private String vapidSubject;

    @Value("${push.max-retries:3}")
    private int maxRetries;

    private nl.martijndwars.webpush.PushService pushService;

    // Static block to register BouncyCastle security provider
    static {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    @PostConstruct
    public void init() throws GeneralSecurityException {
        if (vapidPublicKey != null && !vapidPublicKey.isEmpty() &&
                vapidPrivateKey != null && !vapidPrivateKey.isEmpty()) {
            pushService = new nl.martijndwars.webpush.PushService(
                    vapidPublicKey,
                    vapidPrivateKey,
                    vapidSubject);
            log.info("Web Push service initialized successfully with VAPID keys");
        } else {
            log.warn("VAPID keys not configured. Web Push will not work.");
        }
    }

    /**
     * Gửi push tới một subscription (synchronous)
     * Logic:
     * 1. Kiểm tra subscription hợp lệ
     * 2. Tạo Notification object từ library web-push
     * 3. Gửi notification
     * 4. Xử lý response (200/201=success, 410=cleanup, 429=rate-limit, 5xx=retry)
     * 5. Lưu log delivery
     */
    @Override
    @Transactional
    public boolean sendPush(PushSubscription subscription, WebPushPayload payload) {
        log.debug("Sending push to subscription: {}", subscription.getEndpoint());

        if (pushService == null) {
            log.error("PushService not initialized. Check VAPID configuration.");
            return false;
        }

        try {
            // Validate subscription
            if (subscription == null || subscription.getEndpoint() == null) {
                log.warn("Invalid subscription provided");
                return false;
            }

            // Create payload JSON
            String payloadJson = objectMapper.writeValueAsString(payload);

            // Construct Notification
            Notification notification = new Notification(
                    subscription.getEndpoint(),
                    subscription.getP256dh(),
                    subscription.getAuth(),
                    payloadJson);

            // Send notification
            HttpResponse response = pushService.send(notification);
            int statusCode = response.getStatusLine().getStatusCode();

            log.info("Push sent to endpoint: {}. Status: {}", subscription.getEndpoint(), statusCode);

            PushDeliveryLog.PushDeliveryStatus status;
            if (statusCode >= 200 && statusCode < 300) {
                status = PushDeliveryLog.PushDeliveryStatus.SUCCESS;
            } else if (statusCode == 410) { // Gone
                status = PushDeliveryLog.PushDeliveryStatus.INVALID_SUBSCRIPTION;
            } else if (statusCode == 429) { // Too Many Requests
                status = PushDeliveryLog.PushDeliveryStatus.RATE_LIMITED;
            } else {
                status = PushDeliveryLog.PushDeliveryStatus.FAILED;
            }

            PushDeliveryLog deliveryLog = PushDeliveryLog.builder()
                    .userId(subscription.getUser().getId().toString())
                    .endpoint(subscription.getEndpoint())
                    .payload(payloadJson)
                    .status(status)
                    .httpStatusCode(statusCode)
                    .retryCount(0)
                    .build();

            pushDeliveryLogRepository.save(deliveryLog);

            return statusCode >= 200 && statusCode < 300;

        } catch (Exception e) {
            log.error("Failed to send push", e);

            // Log failure
            try {
                PushDeliveryLog deliveryLog = PushDeliveryLog.builder()
                        .userId(subscription.getUser().getId().toString())
                        .endpoint(subscription.getEndpoint())
                        .status(PushDeliveryLog.PushDeliveryStatus.FAILED)
                        .errorMessage(e.getMessage())
                        .retryCount(0)
                        .build();
                pushDeliveryLogRepository.save(deliveryLog);
            } catch (Exception logEx) {
                log.error("Failed to log push delivery error", logEx);
            }

            return false;
        }
    }

    /**
     * Gửi push không đồng bộ (async)
     */
    @Override
    @Async
    public Future<Boolean> sendPushAsync(PushSubscription subscription, WebPushPayload payload) {
        boolean result = sendPush(subscription, payload);
        return CompletableFuture.completedFuture(result);
    }

    /**
     * Gửi push batch (đồng bộ)
     * Gửi từng cái theo thứ tự, log mỗi cái riêng
     */
    @Override
    @Transactional
    public int sendPushBatch(List<PushSubscription> subscriptions, WebPushPayload payload) {
        log.info("Sending batch push to {} subscriptions", subscriptions.size());

        int successCount = 0;
        for (PushSubscription subscription : subscriptions) {
            if (sendPush(subscription, payload)) {
                successCount++;
            }
        }

        log.info("Batch push completed: {} successful out of {}", successCount, subscriptions.size());
        return successCount;
    }

    /**
     * Gửi push batch không đồng bộ
     */
    @Override
    @Async
    public Future<Integer> sendPushBatchAsync(List<PushSubscription> subscriptions, WebPushPayload payload) {
        int result = sendPushBatch(subscriptions, payload);
        return CompletableFuture.completedFuture(result);
    }

    /**
     * Retry gửi push thất bại
     * Tìm log có status FAILED, retryCount < maxRetries
     * Lấy subscription từ endpoint, thử gửi lại
     * Nếu thành công -> update log status SUCCESS
     * Nếu thất bại -> increment retryCount
     */
    @Override
    @Transactional
    public int retryFailedDeliveries() {
        log.info("Retrying failed deliveries...");

        // Tìm delivery failures từ 1 giờ trước đó
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(1);
        List<PushDeliveryLog> failedLogs = pushDeliveryLogRepository.findFailedDeliveriesForRetry(cutoffTime);

        if (failedLogs.isEmpty()) {
            log.debug("No failed deliveries to retry");
            return 0;
        }

        int retrySuccessCount = 0;

        for (PushDeliveryLog failedLog : failedLogs) {
            try {
                // Find subscription by endpoint
                PushSubscription subscription = pushSubscriptionRepository
                        .findByEndpoint(failedLog.getEndpoint())
                        .orElse(null);

                if (subscription == null) {
                    log.warn("Subscription not found for endpoint: {}", failedLog.getEndpoint());
                    continue;
                }

                // Try to send again
                // Reconstruct payload from log (nếu cần, hoặc gửi payload mới)
                WebPushPayload payload = WebPushPayload.builder()
                        .title("Retry: " + failedLog.getNotificationId())
                        .body("Previous delivery failed, retrying...")
                        .build();

                boolean success = sendPush(subscription, payload);

                if (success) {
                    failedLog.setStatus(PushDeliveryLog.PushDeliveryStatus.SUCCESS);
                    retrySuccessCount++;
                    log.info("Retry successful for endpoint: {}", failedLog.getEndpoint());
                } else {
                    failedLog.setRetryCount(failedLog.getRetryCount() + 1);
                    log.warn("Retry failed, increment count to: {}", failedLog.getRetryCount());
                }

                pushDeliveryLogRepository.save(failedLog);

            } catch (Exception e) {
                log.error("Error retrying delivery for endpoint: {}", failedLog.getEndpoint(), e);
            }
        }

        log.info("Retry completed: {} successful", retrySuccessCount);
        return retrySuccessCount;
    }

    /**
     * Cleanup subscription không hợp lệ (410 Gone)
     * Tìm log có status INVALID_SUBSCRIPTION
     * Xóa endpoint và subscription liên quan
     */
    @Override
    @Transactional
    public int cleanupInvalidSubscriptions() {
        log.info("Cleaning up invalid subscriptions...");

        List<PushDeliveryLog> invalidLogs = pushDeliveryLogRepository
                .findByStatus(PushDeliveryLog.PushDeliveryStatus.INVALID_SUBSCRIPTION);

        if (invalidLogs.isEmpty()) {
            log.debug("No invalid subscriptions to cleanup");
            return 0;
        }

        int cleanupCount = 0;

        for (PushDeliveryLog invalidLog : invalidLogs) {
            try {
                // Find subscription
                PushSubscription subscription = pushSubscriptionRepository
                        .findByEndpoint(invalidLog.getEndpoint())
                        .orElse(null);

                if (subscription != null) {
                    pushSubscriptionRepository.delete(subscription);
                    cleanupCount++;
                    log.info("Deleted invalid subscription for endpoint: {}", invalidLog.getEndpoint());
                }

            } catch (Exception e) {
                log.error("Error cleaning up subscription for endpoint: {}", invalidLog.getEndpoint(), e);
            }
        }

        log.info("Cleanup completed: {} subscriptions deleted", cleanupCount);
        return cleanupCount;
    }

    /**
     * Lấy thống kê delivery
     */
    @Override
    @Transactional(readOnly = true)
    public PushDeliveryStats getDeliveryStats() {
        long totalSent = pushDeliveryLogRepository.count();
        long successCount = pushDeliveryLogRepository.count(); // TODO: Add status filter query
        long failedCount = 0;
        long invalidCount = 0;
        long rateLimitedCount = 0;
        long networkErrorCount = 0;

        // TODO: Implement proper counting using @Query methods in repository
        // Đơn giản hoá: đếm từng status
        successCount = pushDeliveryLogRepository.findByStatus(PushDeliveryLog.PushDeliveryStatus.SUCCESS).size();
        failedCount = pushDeliveryLogRepository.findByStatus(PushDeliveryLog.PushDeliveryStatus.FAILED).size();
        invalidCount = pushDeliveryLogRepository.findByStatus(PushDeliveryLog.PushDeliveryStatus.INVALID_SUBSCRIPTION)
                .size();
        rateLimitedCount = pushDeliveryLogRepository.findByStatus(PushDeliveryLog.PushDeliveryStatus.RATE_LIMITED)
                .size();
        networkErrorCount = pushDeliveryLogRepository.findByStatus(PushDeliveryLog.PushDeliveryStatus.NETWORK_ERROR)
                .size();

        return new PushDeliveryStats(
                totalSent,
                successCount,
                failedCount,
                invalidCount,
                rateLimitedCount,
                networkErrorCount);
    }

    /**
     * Helper: Generate VAPID headers
     * TODO: Implement JWT signing với VAPID keys
     */
    private Map<String, String> generateVAPIDHeaders(PushSubscription subscription) {
        Map<String, String> headers = new HashMap<>();
        // TODO: Sign và add VAPID Authorization header
        // headers.put("Authorization", "vapid t=" + jwtToken + ", k=" +
        // vapidPublicKey);
        // headers.put("Crypto-Key", "p256ecdsa=" + vapidPublicKey);
        return headers;
    }
}
