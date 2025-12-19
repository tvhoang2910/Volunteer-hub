package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.CreateEventRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationCompletionRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateEventRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CheckInResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.JoinEventResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ParticipantResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationApprovalResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationCompletionResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationRejectionResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Registration;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.RegistrationStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.EventRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RegistrationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EventService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final PostRankingService postRankingService;

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
    public EventResponseDTO createEvent(CreateEventRequest request, UUID creatorId) {
        // Validate creator exists
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + creatorId));

        // Validate startTime < endTime
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Create event entity
        Event event = new Event();
        event.setCreatedBy(creator);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setMaxVolunteers(request.getMaxVolunteers());
        event.setThumbnailUrl(request.getThumbnailUrl());
        event.setAdminApprovalStatus(EventApprovalStatus.PENDING);
        event.setIsArchived(false);

        Event savedEvent = eventRepository.save(event);

        return EventResponseDTO.builder()
                .eventId(savedEvent.getId())
                .title(savedEvent.getTitle())
                .description(savedEvent.getDescription())
                .location(savedEvent.getLocation())
                .startTime(savedEvent.getStartTime())
                .endTime(savedEvent.getEndTime())
                .maxVolunteers(savedEvent.getMaxVolunteers())
                .thumbnailUrl(savedEvent.getThumbnailUrl())
                .createdByName(creator.getName())
                .adminApprovalStatus(savedEvent.getAdminApprovalStatus().toString())
                .createdAt(savedEvent.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public EventResponseDTO updateEvent(UUID eventId, UpdateEventRequest request, UUID updaterId) {
        // Validate event exists
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        // Validate updater exists
        userRepository.findById(updaterId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + updaterId));

        // Check ownership - only creator can update
        if (!event.getCreatedBy().getId().equals(updaterId)) {
            throw new IllegalStateException("Only the event creator can update this event");
        }

        // Check if event has already started
        if (event.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Cannot update event that has already started");
        }

        // Update fields if provided
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            event.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            event.setLocation(request.getLocation());
        }
        if (request.getStartTime() != null) {
            event.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            event.setEndTime(request.getEndTime());
        }
        if (request.getMaxVolunteers() != null) {
            event.setMaxVolunteers(request.getMaxVolunteers());
        }
        if (request.getThumbnailUrl() != null) {
            event.setThumbnailUrl(request.getThumbnailUrl());
        }

        // Validate startTime < endTime after updates
        if (event.getStartTime() != null && event.getEndTime() != null
                && !event.getStartTime().isBefore(event.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        Event savedEvent = eventRepository.save(event);

        return EventResponseDTO.builder()
                .eventId(savedEvent.getId())
                .title(savedEvent.getTitle())
                .description(savedEvent.getDescription())
                .location(savedEvent.getLocation())
                .startTime(savedEvent.getStartTime())
                .endTime(savedEvent.getEndTime())
                .maxVolunteers(savedEvent.getMaxVolunteers())
                .thumbnailUrl(savedEvent.getThumbnailUrl())
                .createdByName(savedEvent.getCreatedBy().getName())
                .adminApprovalStatus(savedEvent.getAdminApprovalStatus().toString())
                .createdAt(savedEvent.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> getEventsWithFilters(String searchQuery, String category,
            LocalDateTime fromDate, LocalDateTime toDate,
            EventApprovalStatus status) {
        // Note: category parameter is reserved for future use when Event entity has a
        // category field
        return eventRepository.findEventsWithFilters(searchQuery, fromDate, toDate, status);
    }

    @Override
    @Transactional
    public JoinEventResponse joinEvent(UUID eventId, UUID userId) {
        // Validate event exists
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        // Check if event is approved
        if (!event.getAdminApprovalStatus().equals(EventApprovalStatus.APPROVED)) {
            throw new IllegalStateException("Cannot join event that is not approved");
        }

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        // Check if already registered
        Optional<Registration> existingRegistrationOpt = registrationRepository.findByEventIdAndVolunteerId(eventId,
                userId);
        if (existingRegistrationOpt.isPresent()) {
            Registration existingRegistration = existingRegistrationOpt.get();
            if (existingRegistration.getRegistrationStatus().equals(RegistrationStatus.WITHDRAWN)) {
                // allow re-registration by resetting state to PENDING
                existingRegistration.setRegistrationStatus(RegistrationStatus.PENDING);
                existingRegistration.setWithdrawnAt(null);
                Registration savedRegistration = registrationRepository.save(existingRegistration);
                return JoinEventResponse.builder()
                        .registrationId(savedRegistration.getId())
                        .eventId(event.getId())
                        .userId(user.getId())
                        .eventTitle(event.getTitle())
                        .registrationStatus(savedRegistration.getRegistrationStatus().toString())
                        .message("Successfully re-registered for event. Awaiting approval.")
                        .build();
            }
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
        if (registration.getRegistrationStatus().equals(RegistrationStatus.COMPLETED)) {
            throw new IllegalStateException("Cannot cancel registration for a completed event");
        }

        // If already withdrawn, return a friendly idempotent message
        if (registration.getRegistrationStatus().equals(RegistrationStatus.WITHDRAWN)) {
            return JoinEventResponse.builder()
                    .registrationId(registration.getId())
                    .eventId(event.getId())
                    .userId(user.getId())
                    .eventTitle(event.getTitle())
                    .registrationStatus(registration.getRegistrationStatus().toString())
                    .message("User already withdrawn from event")
                    .build();
        }

        // Mark registration as withdrawn instead of deleting it
        registration.setRegistrationStatus(RegistrationStatus.WITHDRAWN);
        registration.setWithdrawnAt(java.time.Instant.now());
        registrationRepository.save(registration);

        return JoinEventResponse.builder()
                .registrationId(registration.getId())
                .eventId(event.getId())
                .userId(user.getId())
                .eventTitle(event.getTitle())
                .registrationStatus(registration.getRegistrationStatus().toString())
                .message("Successfully cancelled event registration.")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponseDTO getEventById(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String createdByName = null;
        if (event.getCreatedBy() != null) {
            // may trigger a lazy load
            createdByName = event.getCreatedBy().getName();
        }

        return EventResponseDTO.builder()
                .eventId(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .maxVolunteers(event.getMaxVolunteers())
                .thumbnailUrl(event.getThumbnailUrl())
                .createdByName(createdByName)
                .adminApprovalStatus(
                        event.getAdminApprovalStatus() == null ? null : event.getAdminApprovalStatus().toString())
                .createdAt(event.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParticipantResponseDTO> getParticipants(
            UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        return event.getRegistrations().stream()
                .map(reg -> ParticipantResponseDTO.builder()
                        .userId(reg.getVolunteer().getId())
                        .userName(reg.getVolunteer().getName())
                        .email(reg.getVolunteer().getEmail())
                        .registrationStatus(reg.getRegistrationStatus().toString())
                        .registeredAt(reg.getCreatedAt())
                        .isCompleted(reg.getRegistrationStatus().equals(RegistrationStatus.COMPLETED))
                        .isWithdrawn(reg.getRegistrationStatus().equals(RegistrationStatus.WITHDRAWN))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CheckInResponseDTO checkInVolunteer(
            UUID eventId, UUID userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Registration registration = registrationRepository.findByEventIdAndVolunteerId(eventId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User is not registered for this event"));

        // Check if registration is approved
        if (!registration.getRegistrationStatus().equals(RegistrationStatus.APPROVED)) {
            throw new IllegalStateException(
                    "Only approved registrations can check-in. Current status: "
                            + registration.getRegistrationStatus());
        }

        // If already checked-in, return a friendly message
        if (registration.getCheckedInAt() != null ||
                registration.getRegistrationStatus().equals(RegistrationStatus.CHECKED_IN) ||
                registration.getRegistrationStatus().equals(RegistrationStatus.COMPLETED)) {
            return CheckInResponseDTO.builder()
                    .registrationId(registration.getId().toString())
                    .eventTitle(event.getTitle())
                    .userName(user.getName())
                    .isCheckedIn(true)
                    .message("User already checked in")
                    .build();
        }

        // Mark as checked-in
        registration.setRegistrationStatus(RegistrationStatus.CHECKED_IN);
        registration.setCheckedInAt(java.time.Instant.now());
        Registration savedRegistration = registrationRepository.save(registration);

        return CheckInResponseDTO.builder()
                .registrationId(savedRegistration.getId().toString())
                .eventTitle(event.getTitle())
                .userName(user.getName())
                .isCheckedIn(true)
                .message("Check-in successful")
                .build();
    }

    @Override
    @Transactional
    public RegistrationApprovalResponseDTO approveRegistration(UUID registrationId, UUID approvedByUserId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new EntityNotFoundException("Registration not found with id: " + registrationId));

        User approvedBy = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + approvedByUserId));

        // Update registration status
        registration.setRegistrationStatus(RegistrationStatus.APPROVED);
        registration.setApprovedBy(approvedBy);

        Registration savedRegistration = registrationRepository.save(registration);

        return RegistrationApprovalResponseDTO.builder()
                .registrationId(savedRegistration.getId().toString())
                .userId(savedRegistration.getVolunteer().getId().toString())
                .userName(savedRegistration.getVolunteer().getName())
                .eventTitle(savedRegistration.getEvent().getTitle())
                .registrationStatus(savedRegistration.getRegistrationStatus().toString())
                .message("Registration approved successfully")
                .build();
    }

    @Override
    @Transactional
    public RegistrationRejectionResponseDTO rejectRegistration(UUID registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new EntityNotFoundException("Registration not found with id: " + registrationId));

        // Update registration status
        registration.setRegistrationStatus(RegistrationStatus.REJECTED);

        Registration savedRegistration = registrationRepository.save(registration);

        return RegistrationRejectionResponseDTO.builder()
                .registrationId(savedRegistration.getId().toString())
                .userId(savedRegistration.getVolunteer().getId().toString())
                .userName(savedRegistration.getVolunteer().getName())
                .eventTitle(savedRegistration.getEvent().getTitle())
                .registrationStatus(savedRegistration.getRegistrationStatus().toString())
                .message("Registration rejected successfully")
                .build();
    }

    @Override
    @Transactional
    public RegistrationCompletionResponseDTO completeRegistration(UUID registrationId,
            RegistrationCompletionRequest request) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new EntityNotFoundException("Registration not found with id: " + registrationId));

        // Check if registration is checked-in (user must check-in before completion)
        if (!registration.getRegistrationStatus().equals(RegistrationStatus.CHECKED_IN) &&
                !registration.getRegistrationStatus().equals(RegistrationStatus.COMPLETED)) {
            throw new IllegalStateException(
                    "Only checked-in registrations can be completed. Current status: "
                            + registration.getRegistrationStatus());
        }

        // Check if already completed
        if (registration.getRegistrationStatus().equals(RegistrationStatus.COMPLETED)) {
            return RegistrationCompletionResponseDTO.builder()
                    .registrationId(registration.getId().toString())
                    .userId(registration.getVolunteer().getId().toString())
                    .userName(registration.getVolunteer().getName())
                    .eventTitle(registration.getEvent().getTitle())
                    .isCompleted(true)
                    .completionNotes(registration.getCompletionNotes())
                    .message("Registration already completed")
                    .build();
        }

        // Mark as completed
        registration.setRegistrationStatus(RegistrationStatus.COMPLETED);
        registration.setCompletedAt(java.time.Instant.now());
        if (request.getCompletionNotes() != null && !request.getCompletionNotes().isEmpty()) {
            registration.setCompletionNotes(request.getCompletionNotes());
        }

        Registration savedRegistration = registrationRepository.save(registration);

        return RegistrationCompletionResponseDTO.builder()
                .registrationId(savedRegistration.getId().toString())
                .userId(savedRegistration.getVolunteer().getId().toString())
                .userName(savedRegistration.getVolunteer().getName())
                .eventTitle(savedRegistration.getEvent().getTitle())
                .isCompleted(true)
                .completionNotes(savedRegistration.getCompletionNotes())
                .message("Registration marked as completed successfully")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public long countRegisteredEvents(UUID volunteerId) {
        List<RegistrationStatus> eligibleStatuses = List.of(
                RegistrationStatus.APPROVED,
                RegistrationStatus.CHECKED_IN,
                RegistrationStatus.COMPLETED);
        return registrationRepository.countByVolunteerIdAndRegistrationStatusIn(volunteerId, eligibleStatuses);
    }

    @Override
    public List<Event> getPendingEvents() {
        return eventRepository.findAllByAdminApprovalStatusAndIsArchived(EventApprovalStatus.PENDING, false);
    }
}
