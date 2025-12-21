package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventAutocompleteDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;

public interface EventRepository extends JpaRepository<Event, UUID> {
    List<Event> findAllByAdminApprovalStatusAndIsArchived(EventApprovalStatus status, Boolean isArchived);

    List<Event> findAllByCreatedBy_Id(UUID userId);

    @Query("SELECT e FROM Event e LEFT JOIN FETCH e.createdBy ORDER BY e.createdAt DESC")
    List<Event> findAllWithCreator();

    /**
     * Find all approved events created by a specific user (manager).
     */
    List<Event> findAllByCreatedBy_IdAndAdminApprovalStatus(UUID userId, EventApprovalStatus status);

    /**
     * Find all events with creator, registrations and posts eagerly loaded.
     * Use for dashboard trending calculation to avoid N+1.
     */
    @Query("SELECT DISTINCT e FROM Event e " +
            "LEFT JOIN FETCH e.createdBy " +
            "LEFT JOIN FETCH e.registrations " +
            "LEFT JOIN FETCH e.posts")
    List<Event> findAllWithCreatorAndStats();

    /**
     * Count events by approval status (efficient single query).
     */
    long countByAdminApprovalStatus(EventApprovalStatus status);

    /**
     * Count events created after a specific date.
     */
    @Query("SELECT COUNT(e) FROM Event e WHERE e.createdAt > :since")
    long countEventsCreatedAfter(@Param("since") LocalDateTime since);

    @Query("SELECT e FROM Event e WHERE " +
            "(:searchQuery IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :searchQuery, '%')) " +
            "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :searchQuery, '%'))) " +
            "AND (:fromDate IS NULL OR e.startTime >= :fromDate) " +
            "AND (:toDate IS NULL OR e.endTime <= :toDate) " +
            "AND (:status IS NULL OR e.adminApprovalStatus = :status) " +
            "AND e.isArchived = false " +
            "ORDER BY e.startTime DESC")
    List<Event> findEventsWithFilters(
            @Param("searchQuery") String searchQuery,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("status") EventApprovalStatus status);

    @Query(value = """
            SELECT e.event_id as eventId, e.title
            FROM events e
            WHERE e.title ILIKE CONCAT(:keyword, '%')
               OR e.title ILIKE CONCAT('%', :keyword, '%')
               OR e.title % :keyword
            ORDER BY similarity(e.title, :keyword) DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<EventAutocompleteDTO> autocompleteTitle(@Param("keyword") String keyword,
            @Param("limit") int limit);
}