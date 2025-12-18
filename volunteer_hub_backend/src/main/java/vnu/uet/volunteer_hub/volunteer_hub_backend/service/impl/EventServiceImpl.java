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
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Notification;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Registration;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.NotificationType;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.RegistrationStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.UserRoleType;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.EventRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.NotificationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RegistrationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EventService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * EventServiceImpl
 * <p>
 * Implementation cho toàn bộ nghiệp vụ liên quan đến sự kiện tình nguyện:
 * tạo sự kiện, duyệt sự kiện, đăng ký tham gia, check-in và hoàn thành.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final PostRankingService postRankingService;

    /* ============================================================
     * EVENT APPROVAL / BASIC MANAGEMENT
     * ============================================================ */

    @Override
    public void approveEventStatus(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setAdminApprovalStatus(EventApprovalStatus.APPROVED);
        eventRepository.save(event);

        // Rebuild ranking vì visibility post có thể thay đổi
        try {
            postRankingService.rebuildRankingFromDatabase();
        } catch (Exception ignored) {
        }
    }

    @Override
    public void rejectEventStatus(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setAdminApprovalStatus(EventApprovalStatus.REJECTED);
        eventRepository.save(event);

        try {
            postRankingService.rebuildRankingFromDatabase();
        } catch (Exception ignored) {
        }
    }

    @Override
    @Transactional
    public void deleteEvent(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Event not found with id " + id));
        eventRepository.delete(event);
    }

    @Override
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    /* ============================================================
     * PUBLIC EVENTS
     * ============================================================ */

    @Override
    public List<Event> getApprovedEvents() {
        return eventRepository
                .findAllByAdminApprovalStatusAndIsArchived(
                        EventApprovalStatus.APPROVED,
                        Boolean.FALSE);
    }

    /**
     * Lấy chi tiết sự kiện đã được duyệt (phục vụ event feed).
     */
    @Override
    public Event getApprovedEvent(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Event not found with id " + id));

        if (event.getAdminApprovalStatus() != EventApprovalStatus.APPROVED
                || Boolean.TRUE.equals(event.getIsArchived())) {
            throw new EntityNotFoundException("Event is not approved or has been archived");
        }

        return event;
    }

    /* ============================================================
     * CREATE / UPDATE EVENT
     * ============================================================ */

    @Override
    @Transactional
    public EventResponseDTO createEvent(CreateEventRequest request, UUID creatorId) {

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found with id: " + creatorId));

        // Only manager or admin can create events
        if (!isManagerOrAdmin(creator)) {
            throw new IllegalStateException("Only manager or admin can create events");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        Event event = new Event();
        event.setCreatedBy(creator);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setMaxVolunteers(request.getMaxVolunteers());
        event.setAdminApprovalStatus(EventApprovalStatus.PENDING);
        event.setIsArchived(false);

        Event savedEvent = eventRepository.save(event);

        notifyAdminsPendingEvent(savedEvent, creator);

        return mapToEventResponse(savedEvent);
    }

    @Override
    @Transactional
    public EventResponseDTO updateEvent(UUID eventId,
                                       UpdateEventRequest request,
                                       UUID updaterId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Event not found with id: " + eventId));

        User updater = userRepository.findById(updaterId)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found with id: " + updaterId));

        ensureEventManagerOrAdmin(event, updater);

        if (event.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Cannot update event that has already started");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank())
            event.setTitle(request.getTitle());
        if (request.getDescription() != null)
            event.setDescription(request.getDescription());
        if (request.getLocation() != null)
            event.setLocation(request.getLocation());
        if (request.getStartTime() != null)
            event.setStartTime(request.getStartTime());
        if (request.getEndTime() != null)
            event.setEndTime(request.getEndTime());
        if (request.getMaxVolunteers() != null)
            event.setMaxVolunteers(request.getMaxVolunteers());

        if (!event.getStartTime().isBefore(event.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        return mapToEventResponse(eventRepository.save(event));
    }

    /* ============================================================
     * FILTER / SEARCH
     * ============================================================ */

    @Override
    @Transactional(readOnly = true)
    public List<Event> getEventsWithFilters(String searchQuery,
                                            String category,
                                            LocalDateTime fromDate,
                                            LocalDateTime toDate,
                                            EventApprovalStatus status) {
        return eventRepository.findEventsWithFilters(
                searchQuery, fromDate, toDate, status);
    }

    /* ============================================================
     * PARTICIPATION
     * ============================================================ */

        @Override
        @Transactional(readOnly = true)
        public List<ParticipantResponseDTO> getParticipants(UUID eventId) {
        // Ensure event exists
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));

        // Fetch all registrations for the event and map to DTO
        List<Registration> regs = registrationRepository.findByEventId(eventId);

        return regs.stream()
            .map(r -> ParticipantResponseDTO.builder()
                .userId(r.getVolunteer() != null ? r.getVolunteer().getId() : null)
                .userName(r.getVolunteer() != null ? r.getVolunteer().getName() : null)
                .email(r.getVolunteer() != null ? r.getVolunteer().getEmail() : null)
                .registrationStatus(r.getRegistrationStatus() != null
                    ? r.getRegistrationStatus().toString() : null)
                .registeredAt(r.getCreatedAt())
                .isCompleted(r.getRegistrationStatus() != null
                    && r.getRegistrationStatus().equals(RegistrationStatus.COMPLETED))
                .isWithdrawn(r.getRegistrationStatus() != null
                    && r.getRegistrationStatus().equals(RegistrationStatus.WITHDRAWN))
                .build())
            .collect(Collectors.toList());
        }

    @Override
    @Transactional
    public JoinEventResponse joinEvent(UUID eventId, UUID userId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Event not found with id: " + eventId));

        if (!event.getAdminApprovalStatus().equals(EventApprovalStatus.APPROVED)) {
            throw new IllegalStateException("Cannot join event that is not approved");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found with id: " + userId));

        Optional<Registration> existing =
                registrationRepository.findByEventIdAndVolunteerId(eventId, userId);

        if (existing.isPresent()) {
            Registration reg = existing.get();
            if (reg.getRegistrationStatus().equals(RegistrationStatus.WITHDRAWN)) {
                reg.setRegistrationStatus(RegistrationStatus.PENDING);
                reg.setWithdrawnAt(null);
                registrationRepository.save(reg);
                return JoinEventResponse.builder()
                        .registrationId(reg.getId())
                        .eventId(event.getId())
                        .userId(user.getId())
                        .eventTitle(event.getTitle())
                        .registrationStatus(reg.getRegistrationStatus().toString())
                        .message("Successfully re-registered for event. Awaiting approval.")
                        .build();
            }
            throw new IllegalStateException("User is already registered for this event");
        }

        if (event.getMaxVolunteers() != null && event.getMaxVolunteers() > 0) {
            long approvedCount =
                    registrationRepository.countByEventIdAndRegistrationStatus(
                            eventId, RegistrationStatus.APPROVED);
            if (approvedCount >= event.getMaxVolunteers()) {
                throw new IllegalStateException("Event has reached maximum volunteer capacity");
            }
        }

        Registration registration = new Registration();
        registration.setEvent(event);
        registration.setVolunteer(user);
        registration.setRegistrationStatus(RegistrationStatus.PENDING);

        Registration saved = registrationRepository.save(registration);

        return JoinEventResponse.builder()
                .registrationId(saved.getId())
                .eventId(event.getId())
                .userId(user.getId())
                .eventTitle(event.getTitle())
                .registrationStatus(saved.getRegistrationStatus().toString())
                .message("Successfully registered for event. Awaiting approval.")
                .build();
    }

    @Override
    @Transactional
    public JoinEventResponse leaveEvent(UUID eventId, UUID userId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Event not found with id: " + eventId));

        Registration registration =
                registrationRepository.findByEventIdAndVolunteerId(eventId, userId)
                        .orElseThrow(() ->
                                new EntityNotFoundException("User is not registered for this event"));

        if (registration.getRegistrationStatus().equals(RegistrationStatus.COMPLETED)) {
            throw new IllegalStateException("Cannot cancel completed registration");
        }

        if (registration.getRegistrationStatus().equals(RegistrationStatus.WITHDRAWN)) {
            return JoinEventResponse.builder()
                    .registrationId(registration.getId())
                    .eventId(event.getId())
                    .userId(userId)
                    .eventTitle(event.getTitle())
                    .registrationStatus(registration.getRegistrationStatus().toString())
                    .message("User already withdrawn from event")
                    .build();
        }

        registration.setRegistrationStatus(RegistrationStatus.WITHDRAWN);
        registration.setWithdrawnAt(java.time.Instant.now());
        registrationRepository.save(registration);

        return JoinEventResponse.builder()
                .registrationId(registration.getId())
                .eventId(event.getId())
                .userId(userId)
                .eventTitle(event.getTitle())
                .registrationStatus(registration.getRegistrationStatus().toString())
                .message("Successfully cancelled event registration.")
                .build();
    }

    /* ============================================================
     * CHECK-IN & COMPLETION
     * ============================================================ */

    @Override
    @Transactional
    public CheckInResponseDTO checkInVolunteer(UUID eventId, UUID userId, UUID checkerId) {

        User checker = userRepository.findById(checkerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + checkerId));

        Registration registration =
                registrationRepository.findByEventIdAndVolunteerId(eventId, userId)
                        .orElseThrow(() ->
                                new EntityNotFoundException("User is not registered"));

        ensureEventManagerOrAdmin(registration.getEvent(), checker);

        if (!registration.getRegistrationStatus().equals(RegistrationStatus.APPROVED)) {
            throw new IllegalStateException("Only approved registrations can check-in");
        }

        if (registration.getCheckedInAt() != null) {
            return CheckInResponseDTO.builder()
                    .registrationId(registration.getId().toString())
                    .eventTitle(registration.getEvent().getTitle())
                    .userName(registration.getVolunteer().getName())
                    .isCheckedIn(true)
                    .message("User already checked in")
                    .build();
        }

        registration.setRegistrationStatus(RegistrationStatus.CHECKED_IN);
        registration.setCheckedInAt(java.time.Instant.now());
        registrationRepository.save(registration);

        return CheckInResponseDTO.builder()
                .registrationId(registration.getId().toString())
                .eventTitle(registration.getEvent().getTitle())
                .userName(registration.getVolunteer().getName())
                .isCheckedIn(true)
                .message("Check-in successful")
                .build();
    }

    @Override
    @Transactional
    public RegistrationApprovalResponseDTO approveRegistration(UUID registrationId,
                                                              UUID approvedByUserId) {

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Registration not found"));

        User approvedBy = userRepository.findById(approvedByUserId)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));

        ensureEventManagerOrAdmin(registration.getEvent(), approvedBy);

        registration.setRegistrationStatus(RegistrationStatus.APPROVED);
        registration.setApprovedBy(approvedBy);

        registrationRepository.save(registration);

        return RegistrationApprovalResponseDTO.builder()
                .registrationId(registration.getId().toString())
                .userId(registration.getVolunteer().getId().toString())
                .userName(registration.getVolunteer().getName())
                .eventTitle(registration.getEvent().getTitle())
                .registrationStatus(registration.getRegistrationStatus().toString())
                .message("Registration approved successfully")
                .build();
    }

    @Override
    @Transactional
    public RegistrationRejectionResponseDTO rejectRegistration(UUID registrationId, UUID actorId) {

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Registration not found"));

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        ensureEventManagerOrAdmin(registration.getEvent(), actor);

        registration.setRegistrationStatus(RegistrationStatus.REJECTED);
        registrationRepository.save(registration);

        return RegistrationRejectionResponseDTO.builder()
                .registrationId(registration.getId().toString())
                .userId(registration.getVolunteer().getId().toString())
                .userName(registration.getVolunteer().getName())
                .eventTitle(registration.getEvent().getTitle())
                .registrationStatus(registration.getRegistrationStatus().toString())
                .message("Registration rejected successfully")
                .build();
    }

    @Override
    @Transactional
    public RegistrationCompletionResponseDTO completeRegistration(UUID registrationId,
                                                                  RegistrationCompletionRequest request,
                                                                  UUID actorId) {

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Registration not found"));

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        ensureEventManagerOrAdmin(registration.getEvent(), actor);

        if (!registration.getRegistrationStatus().equals(RegistrationStatus.CHECKED_IN)
                && !registration.getRegistrationStatus().equals(RegistrationStatus.COMPLETED)) {
            throw new IllegalStateException("Only checked-in registrations can be completed");
        }

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

        registration.setRegistrationStatus(RegistrationStatus.COMPLETED);
        registration.setCompletedAt(java.time.Instant.now());
        registration.setCompletionNotes(request.getCompletionNotes());

        registrationRepository.save(registration);

        return RegistrationCompletionResponseDTO.builder()
                .registrationId(registration.getId().toString())
                .userId(registration.getVolunteer().getId().toString())
                .userName(registration.getVolunteer().getName())
                .eventTitle(registration.getEvent().getTitle())
                .isCompleted(true)
                .completionNotes(registration.getCompletionNotes())
                .message("Registration marked as completed successfully")
                .build();
    }

    /* ============================================================
     * HELPER
     * ============================================================ */

    private EventResponseDTO mapToEventResponse(Event event) {
        return EventResponseDTO.builder()
                .eventId(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .maxVolunteers(event.getMaxVolunteers())
                .createdByName(
                        event.getCreatedBy() != null ? event.getCreatedBy().getName() : null)
                .adminApprovalStatus(
                        event.getAdminApprovalStatus() != null
                                ? event.getAdminApprovalStatus().toString()
                                : null)
                .createdAt(event.getCreatedAt())
                .build();
    }

    private boolean hasRole(User user, String roleName) {
        if (user == null || user.getRoles() == null) return false;
        return user.getRoles().stream()
                .anyMatch(r -> r != null && roleName.equalsIgnoreCase(r.getRoleName()));
    }

    private boolean isManagerOrAdmin(User user) {
        return hasRole(user, UserRoleType.MANAGER.name()) || hasRole(user, UserRoleType.ADMIN.name());
    }

    private void ensureEventManagerOrAdmin(Event event, User actor) {
        boolean isCreator = event.getCreatedBy() != null
                && actor != null
                && event.getCreatedBy().getId().equals(actor.getId());
        boolean isAdmin = hasRole(actor, UserRoleType.ADMIN.name());
        boolean isManager = hasRole(actor, UserRoleType.MANAGER.name());
        if (!(isAdmin || (isManager && isCreator))) {
            throw new IllegalStateException("Not authorized to manage this event");
        }
    }

    private void notifyAdminsPendingEvent(Event event, User creator) {
        // Fetch active admins
        List<User> admins = userRepository.findByIsActive(true).stream()
                .filter(this::isAdmin)
                .toList();
        if (admins.isEmpty()) {
            return;
        }

        String title = "Sự kiện mới chờ duyệt";
        String body = String.format("Sự kiện \"%s\" do %s vừa tạo đang chờ duyệt.",
                event.getTitle(),
                creator != null ? creator.getName() : "manager");

        List<Notification> notifications = new ArrayList<>();
        for (User admin : admins) {
            Notification n = new Notification();
            n.setRecipient(admin);
            n.setEvent(event);
            n.setTitle(title);
            n.setBody(body);
            n.setNotificationType(NotificationType.EVENT_CREATED_PENDING);
            n.setIsRead(false);
            notifications.add(n);
        }
        notificationRepository.saveAll(notifications);
    }

    private boolean isAdmin(User user) {
        return hasRole(user, UserRoleType.ADMIN.name());
    }
}
