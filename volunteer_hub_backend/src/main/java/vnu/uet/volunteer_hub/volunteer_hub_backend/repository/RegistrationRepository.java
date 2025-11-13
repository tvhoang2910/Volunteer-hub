package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Registration;

public interface RegistrationRepository extends JpaRepository<Registration, UUID> {

    boolean existsByEventIdAndVolunteerId(UUID eventId, UUID volunteerId);
}
