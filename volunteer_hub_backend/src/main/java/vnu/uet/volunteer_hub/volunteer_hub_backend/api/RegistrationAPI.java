package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationCompletionRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationApprovalResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationCompletionResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationRejectionResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EventService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

import java.util.UUID;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
public class RegistrationAPI {

    private final EventService eventService;
    private final UserService userService;

    /**
     * Approve a registration.
     * PUT /api/registrations/{registrationId}/approve
     * Request: approvedByUserId (query parameter for testing)
     * Response: RegistrationApprovalResponseDTO
     */
    @PutMapping("/{registrationId}/approve")
    public ResponseEntity<?> approveRegistration(@PathVariable UUID registrationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID approvedByUserId = userService.getViewerIdFromAuthentication(auth);
        if (approvedByUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ResponseDTO.builder()
                            .message("Not authenticated")
                            .build());
        }
        try {
            RegistrationApprovalResponseDTO response = eventService.approveRegistration(registrationId,
                    approvedByUserId);
            return ResponseEntity.ok(ResponseDTO.<RegistrationApprovalResponseDTO>builder()
                    .message(response.getMessage())
                    .data(response)
                    .build());
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("Registration or user not found")
                            .detail(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to approve registration")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Reject a registration.
     * PUT /api/registrations/{registrationId}/reject
     * Response: RegistrationRejectionResponseDTO
     */
    @PutMapping("/{registrationId}/reject")
    public ResponseEntity<?> rejectRegistration(@PathVariable UUID registrationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID actorId = userService.getViewerIdFromAuthentication(auth);
        if (actorId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ResponseDTO.builder()
                            .message("Not authenticated")
                            .build());
        }
        try {
            RegistrationRejectionResponseDTO response = eventService.rejectRegistration(registrationId, actorId);
            return ResponseEntity.ok(ResponseDTO.<RegistrationRejectionResponseDTO>builder()
                    .message(response.getMessage())
                    .data(response)
                    .build());
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("Registration not found")
                            .detail(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to reject registration")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Mark a registration as complete.
     * PUT /api/registrations/{registrationId}/complete
     * Request Body: RegistrationCompletionRequest (optional completionNotes)
     * Response: RegistrationCompletionResponseDTO
     */
    @PutMapping("/{registrationId}/complete")
    public ResponseEntity<?> completeRegistration(
            @PathVariable UUID registrationId,
            @RequestBody(required = false) RegistrationCompletionRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID actorId = userService.getViewerIdFromAuthentication(auth);
        if (actorId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ResponseDTO.builder()
                            .message("Not authenticated")
                            .build());
        }
        try {
            RegistrationCompletionRequest req = request != null ? request : new RegistrationCompletionRequest();
            RegistrationCompletionResponseDTO response = eventService.completeRegistration(registrationId, req, actorId);
            return ResponseEntity.ok(ResponseDTO.<RegistrationCompletionResponseDTO>builder()
                    .message(response.getMessage())
                    .data(response)
                    .build());
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("Registration not found")
                            .detail(e.getMessage())
                            .build());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseDTO.builder()
                            .message("Cannot complete registration")
                            .detail(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to complete registration")
                            .detail(e.getMessage())
                            .build());
        }
    }
}
