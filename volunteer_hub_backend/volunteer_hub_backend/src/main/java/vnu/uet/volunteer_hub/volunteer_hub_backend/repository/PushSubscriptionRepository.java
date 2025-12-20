package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PushSubscription;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, UUID> {

    /**
     * Tìm subscription theo userId và endpoint
     */
    Optional<PushSubscription> findByUserIdAndEndpoint(UUID userId, String endpoint);

    /**
     * Tìm subscription theo endpoint
     */
    Optional<PushSubscription> findByEndpoint(String endpoint);

    /**
     * Lấy danh sách subscription của user
     */
    List<PushSubscription> findByUserId(UUID userId);

    /**
     * Lấy danh sách subscription của user với phân trang
     */
    Page<PushSubscription> findByUserId(UUID userId, Pageable pageable);
}
