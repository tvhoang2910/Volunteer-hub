package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Registration;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.RegistrationStatus;

public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

        boolean existsByEventIdAndVolunteerId(UUID eventId, UUID volunteerId);

        /**
         * Find registrations by event and volunteer.
         * Returns List to handle potential duplicates gracefully.
         * Use findFirstByEventIdAndVolunteerIdOrderByCreatedAtDesc for single result.
         */
        List<Registration> findByEventIdAndVolunteerId(UUID eventId, UUID volunteerId);

        /**
         * Find the most recent registration for an event and volunteer.
         * Prefer this over findByEventIdAndVolunteerId when expecting single result.
         */
        Optional<Registration> findFirstByEventIdAndVolunteerIdOrderByCreatedAtDesc(UUID eventId, UUID volunteerId);

        long countByEventIdAndRegistrationStatus(UUID eventId, RegistrationStatus registrationStatus);

        /**
         * Count unique volunteers registered in a list of events.
         * Uses DISTINCT to ensure a user is counted only once even if they joined
         * multiple events.
         */
        @Query("SELECT COUNT(DISTINCT r.volunteer.id) FROM Registration r WHERE r.event.id IN :eventIds")
        long countDistinctVolunteersByEventIdIn(@Param("eventIds") List<UUID> eventIds);

        @Query("SELECT COUNT(r) FROM Registration r WHERE r.volunteer.id = :volunteerId AND r.registrationStatus IN :statuses")
        long countByVolunteerIdAndRegistrationStatusIn(@Param("volunteerId") UUID volunteerId,
                        @Param("statuses") List<RegistrationStatus> statuses);

        /**
         * Tìm tất cả registrations của một volunteer (user).
         * Dùng để lấy danh sách sự kiện đã tham gia.
         * 
         * @param volunteerId ID của volunteer (user)
         * @return Danh sách registrations
         */
        List<Registration> findByVolunteerId(UUID volunteerId);

        /**
         * Batch fetch registrations for multiple events by a volunteer.
         * Used to fix N+1 problem when checking visibility of multiple posts.
         * Eager loads event and volunteer to avoid lazy loading.
         * 
         * @param eventIds    List of event IDs
         * @param volunteerId ID của volunteer (user)
         * @return Danh sách registrations
         */
        @EntityGraph(attributePaths = { "event", "volunteer" })
        @Query("SELECT r FROM Registration r WHERE r.event.id IN :eventIds AND r.volunteer.id = :volunteerId")
        List<Registration> findByEventIdInAndVolunteerId(@Param("eventIds") List<UUID> eventIds,
                        @Param("volunteerId") UUID volunteerId);

        /**
         * Find all completed registrations with event and volunteer eagerly loaded.
         * Used to fix N+1 problem in leaderboard computation.
         * 
         * @param status Registration status to filter by
         * @return Danh sách registrations with event and volunteer loaded
         */
        @EntityGraph(attributePaths = { "event", "volunteer" })
        @Query("SELECT r FROM Registration r WHERE r.registrationStatus = :status")
        List<Registration> findAllByRegistrationStatusWithEventAndVolunteer(@Param("status") RegistrationStatus status);
}
