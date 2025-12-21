package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.CreateEventRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationCompletionRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateEventRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CheckInResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventReportDTO;
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
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.NotificationService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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
    private final NotificationService notificationService;

    @Override
    public void approveEventStatus(UUID id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        event.setAdminApprovalStatus(EventApprovalStatus.APPROVED);
        eventRepository.save(event);

        // Thông báo cho Manager khi sự kiện được duyệt
        notificationService.notifyEventApproved(event);

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

        // Thông báo cho Manager khi sự kiện bị từ chối
        notificationService.notifyEventRejected(event);

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
    @Transactional(readOnly = true)
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> getApprovedEvents() {
        return eventRepository.findAllByAdminApprovalStatusAndIsArchived(EventApprovalStatus.APPROVED, Boolean.FALSE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Event> getEventsByManager(UUID managerId) {
        return eventRepository.findAllByCreatedBy_Id(managerId);
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

        // Check if already registered - use List to handle potential duplicates
        List<Registration> existingRegistrations = registrationRepository.findByEventIdAndVolunteerId(eventId, userId);
        if (!existingRegistrations.isEmpty()) {
            // Take the most recent registration
            Registration existingRegistration = existingRegistrations.stream()
                    .max((r1, r2) -> r1.getCreatedAt().compareTo(r2.getCreatedAt()))
                    .orElse(existingRegistrations.get(0));

            if (existingRegistration.getRegistrationStatus().equals(RegistrationStatus.WITHDRAWN)) {
                // allow re-registration by resetting state to PENDING
                existingRegistration.setRegistrationStatus(RegistrationStatus.PENDING);
                existingRegistration.setWithdrawnAt(null);
                Registration savedRegistration = registrationRepository.save(existingRegistration);

                // Clean up duplicate registrations if any
                if (existingRegistrations.size() > 1) {
                    existingRegistrations.stream()
                            .filter(r -> !r.getId().equals(savedRegistration.getId()))
                            .forEach(registrationRepository::delete);
                }

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

        // Notify manager about new registration
        try {
            notificationService.notifyNewRegistration(event, user);
        } catch (Exception e) {
            // Log but don't fail the registration
            System.err.println("Failed to send notification: " + e.getMessage());
        }

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

        // Find registration - use List to handle potential duplicates
        List<Registration> registrations = registrationRepository.findByEventIdAndVolunteerId(eventId, userId);
        if (registrations.isEmpty()) {
            throw new EntityNotFoundException("User is not registered for this event");
        }

        // Take the most recent non-withdrawn registration, or the most recent one
        Registration registration = registrations.stream()
                .filter(r -> !r.getRegistrationStatus().equals(RegistrationStatus.WITHDRAWN))
                .max((r1, r2) -> r1.getCreatedAt().compareTo(r2.getCreatedAt()))
                .orElse(registrations.stream()
                        .max((r1, r2) -> r1.getCreatedAt().compareTo(r2.getCreatedAt()))
                        .orElse(registrations.get(0)));

        // Check if already completed
        if (registration.getRegistrationStatus().equals(RegistrationStatus.COMPLETED)) {
            throw new IllegalStateException("Không thể hủy đăng ký cho sự kiện đã hoàn thành");
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

        // Clean up duplicate registrations if any
        if (registrations.size() > 1) {
            registrations.stream()
                    .filter(r -> !r.getId().equals(registration.getId()))
                    .forEach(registrationRepository::delete);
        }

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
        Event event = getEventEntityById(eventId);

        String createdByName = null;
        String contactEmail = null;
        if (event.getCreatedBy() != null) {
            // may trigger a lazy load
            createdByName = event.getCreatedBy().getName();
            contactEmail = event.getCreatedBy().getEmail();
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
                .contactEmail(contactEmail)
                .adminApprovalStatus(
                        event.getAdminApprovalStatus() == null ? null : event.getAdminApprovalStatus().toString())
                .createdAt(event.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Event getEventEntityById(UUID eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(
                        () -> new jakarta.persistence.EntityNotFoundException("Event not found with id: " + eventId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParticipantResponseDTO> getParticipants(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        return event.getRegistrations().stream()
                .map(reg -> ParticipantResponseDTO.builder()
                        .registrationId(reg.getId()) // Add registration ID for approval/rejection
                        .userId(reg.getVolunteer().getId())
                        .userName(reg.getVolunteer().getName())
                        .email(reg.getVolunteer().getEmail())
                        .registrationStatus(reg.getRegistrationStatus().toString())
                        .registeredAt(reg.getCreatedAt())
                        .isCompleted(reg.getRegistrationStatus().equals(RegistrationStatus.COMPLETED))
                        .isWithdrawn(reg.getRegistrationStatus().equals(RegistrationStatus.WITHDRAWN))
                        .isUserActive(reg.getVolunteer().getIsActive())
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

        // Find registration - use List to handle potential duplicates
        List<Registration> registrations = registrationRepository.findByEventIdAndVolunteerId(eventId, userId);
        if (registrations.isEmpty()) {
            throw new EntityNotFoundException("User is not registered for this event");
        }

        // Take the most recent approved registration
        Registration registration = registrations.stream()
                .filter(r -> r.getRegistrationStatus().equals(RegistrationStatus.APPROVED) ||
                        r.getRegistrationStatus().equals(RegistrationStatus.CHECKED_IN) ||
                        r.getRegistrationStatus().equals(RegistrationStatus.COMPLETED))
                .max((r1, r2) -> r1.getCreatedAt().compareTo(r2.getCreatedAt()))
                .orElse(registrations.get(0));

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

        // Notify volunteer about approval
        try {
            notificationService.notifyRegistrationApproved(
                    savedRegistration.getEvent(),
                    savedRegistration.getVolunteer());
        } catch (Exception e) {
            // Log but don't fail the approval
            System.err.println("Failed to send notification: " + e.getMessage());
        }

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
    public RegistrationRejectionResponseDTO rejectRegistration(UUID registrationId, UUID rejectedByUserId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new EntityNotFoundException("Registration not found with id: " + registrationId));

        User rejectedBy = userRepository.findById(rejectedByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + rejectedByUserId));

        // Update registration status
        registration.setRegistrationStatus(RegistrationStatus.REJECTED);

        Registration savedRegistration = registrationRepository.save(registration);

        // Notify volunteer about rejection
        try {
            notificationService.notifyRegistrationRejected(
                    savedRegistration.getEvent(),
                    savedRegistration.getVolunteer());
        } catch (Exception e) {
            // Log but don't fail the rejection
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return RegistrationRejectionResponseDTO.builder()
                .registrationId(savedRegistration.getId().toString())
                .userId(savedRegistration.getVolunteer().getId().toString())
                .userName(savedRegistration.getVolunteer().getName())
                .eventTitle(savedRegistration.getEvent().getTitle())
                .registrationStatus(savedRegistration.getRegistrationStatus().toString())
                .rejectedByUserName(rejectedBy.getName())
                .message("Registration rejected successfully")
                .build();
    }

    @Override
    @Transactional
    public RegistrationCompletionResponseDTO completeRegistration(UUID registrationId,
            RegistrationCompletionRequest request, UUID completedByUserId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new EntityNotFoundException("Registration not found with id: " + registrationId));

        User completedBy = userRepository.findById(completedByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + completedByUserId));

        // Check if registration is checked-in (user must check-in before completion)
        if (!registration.getRegistrationStatus().equals(RegistrationStatus.CHECKED_IN) &&
                !registration.getRegistrationStatus().equals(RegistrationStatus.COMPLETED) &&
                !registration.getRegistrationStatus().equals(RegistrationStatus.APPROVED)) {
            throw new IllegalStateException(
                    "Only approved or checked-in registrations can be completed. Current status: "
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
                    .completedByUserName(completedBy.getName())
                    .message("Registration already completed")
                    .build();
        }

        // Mark as completed
        registration.setRegistrationStatus(RegistrationStatus.COMPLETED);
        registration.setCompletedAt(java.time.Instant.now());
        registration.setCompletedByUserId(completedByUserId);
        if (request.getCompletionNotes() != null && !request.getCompletionNotes().isEmpty()) {
            registration.setCompletionNotes(request.getCompletionNotes());
        }

        Registration savedRegistration = registrationRepository.save(registration);

        // Notify volunteer about completion
        try {
            notificationService.notifyRegistrationCompleted(
                    savedRegistration.getEvent(),
                    savedRegistration.getVolunteer());
        } catch (Exception e) {
            // Log but don't fail the completion
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return RegistrationCompletionResponseDTO.builder()
                .registrationId(savedRegistration.getId().toString())
                .userId(savedRegistration.getVolunteer().getId().toString())
                .userName(savedRegistration.getVolunteer().getName())
                .eventTitle(savedRegistration.getEvent().getTitle())
                .isCompleted(true)
                .completionNotes(savedRegistration.getCompletionNotes())
                .completedByUserName(completedBy.getName())
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

        System.out.println("[DEBUG] countRegisteredEvents - volunteerId: " + volunteerId);
        System.out.println("[DEBUG] countRegisteredEvents - eligibleStatuses: " + eligibleStatuses);

        // Debug: get all registrations for this volunteer
        List<Registration> allRegs = registrationRepository.findByVolunteerId(volunteerId);
        System.out.println("[DEBUG] Total registrations for volunteer: " + allRegs.size());
        for (Registration reg : allRegs) {
            System.out.println("[DEBUG] Registration - eventId: " + reg.getEvent().getId() +
                    ", status: " + reg.getRegistrationStatus());
        }

        long count = registrationRepository.countByVolunteerIdAndRegistrationStatusIn(volunteerId, eligibleStatuses);
        System.out.println("[DEBUG] countRegisteredEvents - result count: " + count);
        return count;
    }

    @Override
    @Transactional
    public RegistrationCompletionResponseDTO uncompleteRegistration(UUID registrationId, UUID userId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Registration not found: " + registrationId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "User not found: " + userId));

        // Check if registration is actually completed
        if (!registration.getRegistrationStatus().equals(RegistrationStatus.COMPLETED)) {
            return RegistrationCompletionResponseDTO.builder()
                    .registrationId(registration.getId().toString())
                    .userId(registration.getVolunteer().getId().toString())
                    .userName(registration.getVolunteer().getName())
                    .eventTitle(registration.getEvent().getTitle())
                    .isCompleted(false)
                    .message("Registration is not completed, current status: " + registration.getRegistrationStatus())
                    .build();
        }

        // Revert to APPROVED status
        registration.setRegistrationStatus(RegistrationStatus.APPROVED);
        registration.setCompletedAt(null);
        registration.setCompletedByUserId(null);
        registration.setCompletionNotes(null);

        Registration savedRegistration = registrationRepository.save(registration);

        return RegistrationCompletionResponseDTO.builder()
                .registrationId(savedRegistration.getId().toString())
                .userId(savedRegistration.getVolunteer().getId().toString())
                .userName(savedRegistration.getVolunteer().getName())
                .eventTitle(savedRegistration.getEvent().getTitle())
                .isCompleted(false)
                .message("Registration reverted to APPROVED status successfully")
                .build();
    }

    @Override
    public List<Event> getPendingEvents() {
        return eventRepository.findAllByAdminApprovalStatusAndIsArchived(EventApprovalStatus.PENDING, false);
    }

    @Override
    @Transactional(readOnly = true)
    public EventReportDTO getEventReport(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        List<Registration> registrations = event.getRegistrations().stream()
                .filter(r -> !r.getRegistrationStatus().equals(RegistrationStatus.WITHDRAWN))
                .collect(Collectors.toList());

        // Count statistics
        int totalApproved = 0;
        int checkedInCount = 0;
        int completedCount = 0;
        int incompleteCount = 0;
        int absentCount = 0;

        LocalDateTime now = LocalDateTime.now();
        boolean eventEnded = event.getEndTime() != null && event.getEndTime().isBefore(now);

        // Calculate event duration in hours
        double eventDurationHours = 0;
        if (event.getStartTime() != null && event.getEndTime() != null) {
            eventDurationHours = ChronoUnit.MINUTES.between(event.getStartTime(), event.getEndTime()) / 60.0;
        }

        List<EventReportDTO.VolunteerReportDTO> volunteerReports = new ArrayList<>();

        for (Registration reg : registrations) {
            RegistrationStatus status = reg.getRegistrationStatus();
            
            // Skip PENDING and REJECTED
            if (status.equals(RegistrationStatus.PENDING) || status.equals(RegistrationStatus.REJECTED)) {
                continue;
            }

            totalApproved++;

            String volunteerStatus;
            double contributionHours = 0;

            if (status.equals(RegistrationStatus.COMPLETED)) {
                completedCount++;
                volunteerStatus = "completed";
                contributionHours = eventDurationHours; // Full event duration
            } else if (status.equals(RegistrationStatus.CHECKED_IN)) {
                checkedInCount++;
                volunteerStatus = "participating";
                // Partial hours based on check-in time
                if (reg.getCheckedInAt() != null && event.getEndTime() != null) {
                    LocalDateTime checkedInTime = LocalDateTime.ofInstant(reg.getCheckedInAt(), java.time.ZoneId.systemDefault());
                    LocalDateTime endTime = eventEnded ? event.getEndTime() : now;
                    contributionHours = Math.max(0, ChronoUnit.MINUTES.between(checkedInTime, endTime) / 60.0);
                }
            } else if (status.equals(RegistrationStatus.APPROVED)) {
                if (eventEnded) {
                    absentCount++;
                    volunteerStatus = "absent";
                } else {
                    incompleteCount++;
                    volunteerStatus = "participating";
                }
            } else {
                incompleteCount++;
                volunteerStatus = "incomplete";
            }

            User volunteer = reg.getVolunteer();
            volunteerReports.add(EventReportDTO.VolunteerReportDTO.builder()
                    .id(volunteer.getId())
                    .name(volunteer.getName())
                    .email(volunteer.getEmail())
                    .avatarUrl(volunteer.getAvatarUrl())
                    .role("Tình nguyện viên")
                    .contributionHours(Math.round(contributionHours * 10.0) / 10.0)
                    .status(volunteerStatus)
                    .registrationStatus(status.toString())
                    .build());
        }

        // Calculate total contribution hours
        double totalContributionHours = volunteerReports.stream()
                .mapToDouble(EventReportDTO.VolunteerReportDTO::getContributionHours)
                .sum();

        // Calculate progress percentage
        int progress = 0;
        if (totalApproved > 0) {
            progress = (int) Math.round((completedCount * 100.0) / totalApproved);
        }

        // Generate highlights
        List<String> highlights = new ArrayList<>();
        if (completedCount > 0) {
            highlights.add(completedCount + " tình nguyện viên đã hoàn thành");
        }
        if (checkedInCount > 0) {
            highlights.add(checkedInCount + " tình nguyện viên đã check-in");
        }
        if (totalContributionHours > 0) {
            highlights.add("Tổng cộng " + Math.round(totalContributionHours * 10.0) / 10.0 + " giờ đóng góp");
        }

        return EventReportDTO.builder()
                .eventId(event.getId())
                .eventTitle(event.getTitle())
                .progress(progress)
                .totalContributionHours(Math.round(totalContributionHours * 10.0) / 10.0)
                .satisfactionScore("N/A") // Chưa có hệ thống đánh giá
                .incidentCount(0) // Chưa có hệ thống báo cáo sự cố
                .totalApprovedVolunteers(totalApproved)
                .checkedInCount(checkedInCount)
                .completedCount(completedCount)
                .incompleteCount(incompleteCount)
                .absentCount(absentCount)
                .highlights(highlights)
                .volunteers(volunteerReports)
                .build();
    }
}
