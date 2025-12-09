package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Registration;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.RegistrationStatus;

public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    boolean existsByEventIdAndVolunteerId(UUID eventId, UUID volunteerId);

    Optional<Registration> findByEventIdAndVolunteerId(UUID eventId, UUID volunteerId);

    long countByEventIdAndRegistrationStatus(UUID eventId, RegistrationStatus registrationStatus);
}
