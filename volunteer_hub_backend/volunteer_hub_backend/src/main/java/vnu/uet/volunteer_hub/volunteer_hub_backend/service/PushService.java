package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.WebPushPayload;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PushSubscription;

import java.util.List;
import java.util.concurrent.Future;

/**
 * Service để xử lý gửi Web Push notification
 * Hỗ trợ gửi, retry, cleanup, và logging
 */
public interface PushService {

    /**
     * Gửi push tới một subscription
     * 
     * @param subscription Push subscription
     * @param payload      Nội dung push
     * @return true nếu gửi thành công, false nếu thất bại
     */
    boolean sendPush(PushSubscription subscription, WebPushPayload payload);

    /**
     * Gửi push không đồng bộ tới một subscription
     */
    Future<Boolean> sendPushAsync(PushSubscription subscription, WebPushPayload payload);

    /**
     * Gửi push tới nhiều subscriptions (batch)
     * 
     * @param subscriptions Danh sách subscriptions
     * @param payload       Nội dung push
     * @return Số lượng gửi thành công
     */
    int sendPushBatch(List<PushSubscription> subscriptions, WebPushPayload payload);

    /**
     * Gửi push batch không đồng bộ
     */
    Future<Integer> sendPushBatchAsync(List<PushSubscription> subscriptions, WebPushPayload payload);

    /**
     * Retry gửi push thất bại
     * Tìm các log có status FAILED và retryCount < 3, thử gửi lại
     * 
     * @return Số lượng thử lại thành công
     */
    int retryFailedDeliveries();

    /**
     * Cleanup subscription không hợp lệ
     * Xóa các subscription có status INVALID_SUBSCRIPTION (410 Gone)
     * 
     * @return Số lượng subscription bị xóa
     */
    int cleanupInvalidSubscriptions();

    /**
     * Lấy thống kê delivery
     */
    PushDeliveryStats getDeliveryStats();

    /**
     * Model thống kê delivery
     */
    record PushDeliveryStats(
            long totalSent,
            long successCount,
            long failedCount,
            long invalidSubscriptionCount,
            long rateLimitedCount,
            long networkErrorCount) {
    }
}
