package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Registration;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.RegistrationStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.EventRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RegistrationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EventService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.JoinEventResponse;

@Service
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService postRankingService;

    public EventServiceImpl(EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            UserRepository userRepository,
            vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService postRankingService) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.postRankingService = postRankingService;
    }

    @Override
    public void approveEventStatus(UUID id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        event.setAdminApprovalStatus(EventApprovalStatus.APPROVED);
        eventRepository.save(event);
        // rebuild ranking as visibility of posts under this event may have changed
        try {
            postRankingService.rebuildRankingFromDatabase();
        } catch (Exception e) {
            // ignore failures; scheduled rebuild will pick up changes
        }
    }

    @Override
    public void rejectEventStatus(UUID id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        event.setAdminApprovalStatus(EventApprovalStatus.REJECTED);
        eventRepository.save(event);
        try {
            postRankingService.rebuildRankingFromDatabase();
        } catch (Exception e) {
            // ignore
        }
    }

    @Override
    @Transactional
    public void deleteEvent(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id " + id));
        eventRepository.delete(event);
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    public List<Event> getApprovedEvents() {
        return eventRepository.findAllByAdminApprovalStatusAndIsArchived(EventApprovalStatus.APPROVED, Boolean.FALSE);
    }

    @Override
    @Transactional
    public JoinEventResponse joinEvent(UUID eventId, UUID userId) {
        // Validate event exists
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        // Check if already registered
        if (registrationRepository.existsByEventIdAndVolunteerId(eventId, userId)) {
            throw new IllegalStateException("User is already registered for this event");
        }

        // Check if max volunteers reached
        if (event.getMaxVolunteers() != null && event.getMaxVolunteers() > 0) {
            long approvedCount = registrationRepository.countByEventIdAndRegistrationStatus(eventId,
                    RegistrationStatus.APPROVED);
            if (approvedCount >= event.getMaxVolunteers()) {
                throw new IllegalStateException("Event has reached maximum volunteer capacity");
            }
        }

        // Create registration (PENDING by default)
        Registration registration = new Registration();
        registration.setEvent(event);
        registration.setVolunteer(user);
        registration.setRegistrationStatus(RegistrationStatus.PENDING);
        registration.setIsCompleted(false);

        Registration savedRegistration = registrationRepository.save(registration);

        return JoinEventResponse.builder()
                .registrationId(savedRegistration.getId())
                .eventId(event.getId())
                .userId(user.getId())
                .eventTitle(event.getTitle())
                .registrationStatus(savedRegistration.getRegistrationStatus().toString())
                .message("Successfully registered for event. Awaiting approval.")
                .build();
    }

    @Override
    @Transactional
    public JoinEventResponse leaveEvent(UUID eventId, UUID userId) {
        // Validate event exists
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        // Find registration
        Registration registration = registrationRepository.findByEventIdAndVolunteerId(eventId, userId)
                .orElseThrow(() -> new EntityNotFoundException("User is not registered for this event"));

        // Check if already completed
        if (registration.getIsCompleted()) {
            throw new IllegalStateException("Cannot cancel registration for a completed event");
        }

        // Delete registration
        registrationRepository.delete(registration);

        return JoinEventResponse.builder()
                .registrationId(registration.getId())
                .eventId(event.getId())
                .userId(user.getId())
                .eventTitle(event.getTitle())
                .registrationStatus("CANCELLED")
                .message("Successfully cancelled event registration.")
                .build();
    }
}
