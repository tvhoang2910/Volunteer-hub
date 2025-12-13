package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CheckInResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.JoinEventResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ParticipantResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EventService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

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
     * Get all approved events for creating posts.
     * GET /api/events
     * Response: List of approved events
     */
    @GetMapping
    public ResponseEntity<?> getApprovedEvents() {
        try {
            List<Event> approvedEventsList = eventService.getApprovedEvents();

            // Map to simple DTO
            List<EventSimpleDTO> approvedEvents = approvedEventsList.stream()
                    .map(e -> new EventSimpleDTO(
                            e.getId().toString(),
                            e.getTitle(),
                            e.getLocation(),
                            e.getDescription()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ResponseDTO.<List<EventSimpleDTO>>builder()
                    .message("Events retrieved successfully")
                    .data(approvedEvents)
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
    @PostMapping("/{eventId}/participants/{userId}")
    public ResponseEntity<?> joinEvent(@PathVariable UUID eventId, @PathVariable UUID userId) {
        try {
            // [TEST MODE] userId được truyền từ path parameter
            // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // UUID userId = userService.getViewerIdFromAuthentication(auth);

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
    @DeleteMapping("/{eventId}/participants/{userId}")
    public ResponseEntity<?> leaveEvent(@PathVariable UUID eventId, @PathVariable UUID userId) {
        try {
            // [TEST MODE] userId được truyền từ path parameter
            // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // UUID userId = userService.getViewerIdFromAuthentication(auth);

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
    @PostMapping("/{eventId}/check-in/{userId}")
    public ResponseEntity<?> checkInVolunteer(@PathVariable UUID eventId, @PathVariable UUID userId) {
        try {
            // [TEST MODE] userId được truyền từ query parameter
            // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // UUID userId = userService.getViewerIdFromAuthentication(auth);
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
