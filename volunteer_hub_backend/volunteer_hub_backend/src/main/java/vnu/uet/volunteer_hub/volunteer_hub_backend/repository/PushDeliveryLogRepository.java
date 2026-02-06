package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PushDeliveryLog;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PushDeliveryLogRepository extends JpaRepository<PushDeliveryLog, UUID> {

    /**
     * Lấy log gửi push của user
     */
    Page<PushDeliveryLog> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * Tìm log theo status
     */
    List<PushDeliveryLog> findByStatus(PushDeliveryLog.PushDeliveryStatus status);

    /**
     * Tìm log theo endpoint
     */
    Page<PushDeliveryLog> findByEndpointOrderByCreatedAtDesc(String endpoint, Pageable pageable);

    /**
     * Tìm failed delivery cần retry
     */
    @Query("SELECT l FROM PushDeliveryLog l WHERE l.status = 'FAILED' AND l.retryCount < 3 AND l.createdAt < :cutoffTime")
    List<PushDeliveryLog> findFailedDeliveriesForRetry(LocalDateTime cutoffTime);

    /**
     * Tìm invalid subscriptions để cleanup
     */
    List<PushDeliveryLog> findByStatusAndEndpoint(PushDeliveryLog.PushDeliveryStatus status, String endpoint);
}
