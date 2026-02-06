package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.ManagerRoleRequest;

public interface ManagerRoleRequestRepository extends JpaRepository<ManagerRoleRequest, UUID> {

    Optional<ManagerRoleRequest> findFirstByRequestedBy_IdAndStatusOrderByCreatedAtDesc(UUID requestedById,
            String status);

    List<ManagerRoleRequest> findByStatusOrderByCreatedAtDesc(String status);

    /**
     * Find all requests by status with requestedBy User eagerly fetched
     */
    @Query("SELECT r FROM ManagerRoleRequest r LEFT JOIN FETCH r.requestedBy WHERE r.status = :status ORDER BY r.createdAt DESC")
    List<ManagerRoleRequest> findByStatusWithRequestedBy(@Param("status") String status);
}
