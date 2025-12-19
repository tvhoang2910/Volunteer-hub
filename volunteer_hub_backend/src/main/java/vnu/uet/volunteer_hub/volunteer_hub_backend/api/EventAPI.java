package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.CreateEventRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateEventRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CheckInResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.JoinEventResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ParticipantResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EventService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventAPI {

    private final EventService eventService;
    private final UserService userService;

    /**
     * Create a new event.
     * POST /api/events
     * Request body: CreateEventRequest
     * Response: EventResponseDTO
     * <p>
     * TODO: Sau khi có authentication, lấy userId từ SecurityContext
     */
    @PostMapping()
    public ResponseEntity<?> createEvent(
            @Valid @RequestBody CreateEventRequest request) { // TODO: Remove after auth, get from
                                                              // SecurityContext
        try {
            // Validate startTime < endTime
            if (request.getStartTime() != null && request.getEndTime() != null
                    && !request.getStartTime().isBefore(request.getEndTime())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("Thời gian kết thúc phải sau thời gian bắt đầu")
                                .build());
            }

            // TODO: Get from SecurityContext after auth
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID creatorId = userService.getViewerIdFromAuthentication(auth);

            EventResponseDTO response = eventService.createEvent(request, creatorId);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ResponseDTO.<EventResponseDTO>builder()
                            .message("Event created successfully")
                            .data(response)
                            .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseDTO.builder()
                            .message("Invalid input")
                            .detail(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to create event")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Update an existing event.
     * PUT /api/events/{id}
     * Request body: UpdateEventRequest
     * Response: EventResponseDTO
     * Only owner/manager can update, and only before event starts.
     * <p>
     * TODO: Sau khi có authentication, lấy userId từ SecurityContext
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEventRequest request) { // TODO: Remove after auth, get from
                                                              // SecurityContext
        try {
            // Validate startTime < endTime if both provided
            if (request.getStartTime() != null && request.getEndTime() != null
                    && !request.getStartTime().isBefore(request.getEndTime())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("Thời gian kết thúc phải sau thời gian bắt đầu")
                                .build());
            }

            // TODO: Get from SecurityContext after auth
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID updaterId = userService.getViewerIdFromAuthentication(auth);

            EventResponseDTO response = eventService.updateEvent(id, request, updaterId);

            return ResponseEntity.ok(
                    ResponseDTO.<EventResponseDTO>builder()
                            .message("Event updated successfully")
                            .data(response)
                            .build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseDTO.builder()
                            .message("Invalid input")
                            .detail(e.getMessage())
                            .build());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ResponseDTO.builder()
                            .message(e.getMessage())
                            .build());
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("Event not found")
                            .detail(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to update event")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Get all approved events with optional filters.
     * GET /api/events?q=search&category=...&fromDate=...&toDate=...&status=...
     * Response: List of events matching the criteria
     */
    @GetMapping
    public ResponseEntity<?> getEvents(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) EventApprovalStatus status) {
        try {
            List<Event> eventsList;

            // If any filter is provided, use filtered search
            if (q != null || category != null || fromDate != null || toDate != null || status != null) {
                eventsList = eventService.getEventsWithFilters(q, category, fromDate, toDate, status);
            } else {
                // Default: get approved events only
                eventsList = eventService.getApprovedEvents();
            }

            // Map to simple DTO
            List<EventSimpleDTO> events = eventsList.stream()
                    .map(e -> new EventSimpleDTO(
                            e.getId().toString(),
                            e.getTitle(),
                            e.getLocation(),
                            e.getDescription()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ResponseDTO.<List<EventSimpleDTO>>builder()
                    .message("Events retrieved successfully")
                    .data(events)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ResponseDTO.builder()
                            .message("Failed to retrieve events")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Join an event - User registers to volunteer
     * POST /api/events/{eventId}/join/{userId}
     * Response: JoinEventResponse
     * <p>
     * TODO: Sau khi test xong, sửa lại thành:
     *
     * @PostMapping("/{eventId}/join") public ResponseEntity<?>
     * joinEvent(@PathVariable UUID eventId) {
     * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
     * UUID userId = userService.getViewerIdFromAuthentication(auth);
     */
    @PostMapping("/{eventId}/participants")
    public ResponseEntity<?> joinEvent(@PathVariable UUID eventId) {
        try {
            // [TEST MODE] userId được truyền từ path parameter
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ResponseDTO.builder()
                                .message("User not authenticated")
                                .build());
            }

            JoinEventResponse response = eventService.joinEvent(eventId, userId);
            return ResponseEntity.ok(ResponseDTO.<JoinEventResponse>builder()
                    .message("Successfully joined event")
                    .data(response)
                    .build());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseDTO.builder()
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to join event")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Leave an event - User cancels registration
     * DELETE /api/events/{eventId}/leave/{userId}
     * Response: JoinEventResponse
     * <p>
     * TODO: Sau khi test xong, sửa lại thành:
     * public ResponseEntity<?> leaveEvent(@PathVariable UUID eventId) {
     * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
     * UUID userId = userService.getViewerIdFromAuthentication(auth);
     */
    @DeleteMapping("/{eventId}/participants")
    public ResponseEntity<?> leaveEvent(@PathVariable UUID eventId) {
        try {
            // [TEST MODE] userId được truyền từ path parameter
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ResponseDTO.builder()
                                .message("User not authenticated")
                                .build());
            }

            JoinEventResponse response = eventService.leaveEvent(eventId, userId);
            return ResponseEntity.ok(ResponseDTO.<JoinEventResponse>builder()
                    .message("Successfully left event")
                    .data(response)
                    .build());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseDTO.builder()
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to leave event")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Simple DTO for event list
     */
    public record EventSimpleDTO(String id, String title, String location, String description) {
    }

    /**
     * Get list of pending events (awaiting admin approval).
     * GET /api/events/upcoming-count
     * Response: List of events with PENDING admin approval status
     * NOTE: Static paths must be defined BEFORE dynamic path variable patterns
     */
    @GetMapping("/upcoming-count")
    public ResponseEntity<?> getPendingEvents() {
        try {
            List<Event> pendingEvents = eventService.getPendingEvents();

            List<EventSimpleDTO> events = pendingEvents.stream()
                    .map(e -> new EventSimpleDTO(
                            e.getId().toString(),
                            e.getTitle(),
                            e.getLocation(),
                            e.getDescription()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ResponseDTO.<List<EventSimpleDTO>>builder()
                    .message("Pending events retrieved successfully")
                    .data(events)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to retrieve pending events")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Get count of registered events for the current user.
     * GET /api/events/registered-events-count
     * Response: Count of registered events
     * NOTE: Static paths must be defined BEFORE dynamic path variable patterns
     */
    @GetMapping("/registered-events-count")
    public ResponseEntity<?> getRegisteredEventsCount() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);

            System.out.println("[DEBUG] getRegisteredEventsCount - userId from auth: " + userId);

            // Use EventService's optimized count method instead of fetching all events
            long count = eventService.countRegisteredEvents(userId);

            System.out.println("[DEBUG] getRegisteredEventsCount - count: " + count);

            return ResponseEntity.ok(ResponseDTO.<Long>builder()
                    .message("Registered events count retrieved successfully")
                    .data(count)
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("User not found")
                            .detail(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to retrieve registered events count")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Get event detail by id.
     * GET /api/events/{eventId}
     * Response: EventResponseDTO
     */
    @GetMapping("/{eventId}")
    public ResponseEntity<?> getEventDetail(@PathVariable UUID eventId) {
        try {
            vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventResponseDTO response = eventService
                    .getEventById(eventId);
            return ResponseEntity
                    .ok(ResponseDTO.<vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventResponseDTO>builder()
                            .message("Event retrieved successfully")
                            .data(response)
                            .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("Event not found")
                            .detail(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to retrieve event")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Get list of participants for an event.
     * GET /api/events/{eventId}/participants
     * Response: List of ParticipantResponseDTO
     */
    @GetMapping("/{eventId}/participants")
    public ResponseEntity<?> getParticipants(@PathVariable UUID eventId) {
        try {
            List<ParticipantResponseDTO> participants = eventService
                    .getParticipants(eventId);
            return ResponseEntity.ok(
                    ResponseDTO.<List<ParticipantResponseDTO>>builder()
                            .message("Participants retrieved successfully")
                            .data(participants)
                            .build());
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("Event not found")
                            .detail(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to retrieve participants")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Check-in a volunteer to an event.
     * POST /api/events/{eventId}/check-in
     * Request: userId (query parameter for testing)
     * Response: CheckInResponseDTO
     */
    @PostMapping("/{eventId}/check-in")
    public ResponseEntity<?> checkInVolunteer(@PathVariable UUID eventId) {
        try {
            // [TEST MODE] userId được truyền từ query parameter
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);
            CheckInResponseDTO response = eventService
                    .checkInVolunteer(eventId, userId);
            return ResponseEntity.ok(
                    ResponseDTO.<CheckInResponseDTO>builder()
                            .message(response.getMessage())
                            .data(response)
                            .build());
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("Event or user not found")
                            .detail(e.getMessage())
                            .build());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseDTO.builder()
                            .message("Check-in failed")
                            .detail(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to check-in")
                            .detail(e.getMessage())
                            .build());
        }
    }
}
