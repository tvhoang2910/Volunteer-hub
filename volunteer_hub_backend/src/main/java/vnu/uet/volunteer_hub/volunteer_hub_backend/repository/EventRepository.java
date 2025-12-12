package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

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

    @Query(value = "SELECT * FROM events e WHERE e.title ILIKE CONCAT('%', :keyword, '%') ORDER BY similarity(e.title, :keyword) DESC", nativeQuery = true)
    List<Event> searchByTitle(@Param("keyword") String keyword);

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
