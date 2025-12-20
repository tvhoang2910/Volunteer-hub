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

    Optional<Registration> findByEventIdAndVolunteerId(UUID eventId, UUID volunteerId);

    long countByEventIdAndRegistrationStatus(UUID eventId, RegistrationStatus registrationStatus);

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
}
