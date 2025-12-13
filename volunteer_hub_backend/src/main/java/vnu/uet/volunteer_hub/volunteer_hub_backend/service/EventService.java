package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.List;
import java.util.UUID;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationCompletionRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CheckInResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.JoinEventResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ParticipantResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationApprovalResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationCompletionResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.RegistrationRejectionResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;

public interface EventService {
    void approveEventStatus(UUID id);

    void rejectEventStatus(UUID id);

    void deleteEvent(UUID id);

    List<Event> getAllEvents();

    List<Event> getApprovedEvents();

    /**
     * Join an event (user registers to volunteer)
     */
    JoinEventResponse joinEvent(UUID eventId, UUID userId);

    /**
     * Leave an event (user cancels registration)
     */
    JoinEventResponse leaveEvent(UUID eventId, UUID userId);

    /**
     * Get event detail by id.
     *
     * @param eventId the event id
     * @return EventResponseDTO containing event details
     */
    EventResponseDTO getEventById(UUID eventId);

    /**
     * Get list of participants for an event.
     *
     * @param eventId the event id
     * @return List of ParticipantResponseDTO
     */
    List<ParticipantResponseDTO> getParticipants(
            UUID eventId);

    /**
     * Check-in a volunteer to an event.
     *
     * @param eventId the event id
     * @param userId  the user id
     * @return CheckInResponseDTO with check-in status
     */
    CheckInResponseDTO checkInVolunteer(UUID eventId,
            UUID userId);

    /**
     * Approve a registration.
     *
     * @param registrationId   the registration id
     * @param approvedByUserId the id of the user approving the registration
     * @return RegistrationApprovalResponseDTO with approval status
     */
    RegistrationApprovalResponseDTO approveRegistration(UUID registrationId, UUID approvedByUserId);

    /**
     * Reject a registration.
     *
     * @param registrationId the registration id
     * @return RegistrationRejectionResponseDTO with rejection status
     */
    RegistrationRejectionResponseDTO rejectRegistration(UUID registrationId);

    /**
     * Mark a registration as complete.
     *
     * @param registrationId the registration id
     * @param request        the completion details
     * @return RegistrationCompletionResponseDTO with completion status
     */
    RegistrationCompletionResponseDTO completeRegistration(UUID registrationId,
            RegistrationCompletionRequest request);
}
