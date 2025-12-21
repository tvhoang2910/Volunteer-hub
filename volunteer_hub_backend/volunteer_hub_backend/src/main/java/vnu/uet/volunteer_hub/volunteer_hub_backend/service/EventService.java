package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;

public interface EventService {
        void approveEventStatus(UUID id);

        void rejectEventStatus(UUID id);

        void deleteEvent(UUID id);

        List<Event> getAllEvents();

        List<Event> getApprovedEvents();

        List<Event> getEventsByManager(UUID managerId);

        /**
         * Create a new event.
         *
         * @param request   CreateEventRequest with event details
         * @param creatorId ID of the user creating the event
         * @return EventResponseDTO with created event details
         */
        EventResponseDTO createEvent(CreateEventRequest request, UUID creatorId);

        /**
         * Update an existing event.
         * Only owner/manager can update, and only before event starts.
         *
         * @param eventId   ID of the event to update
         * @param request   UpdateEventRequest with fields to update
         * @param updaterId ID of the user updating the event
         * @return EventResponseDTO with updated event details
         */
        EventResponseDTO updateEvent(UUID eventId, UpdateEventRequest request, UUID updaterId);

        /**
         * Get events with filters.
         *
         * @param searchQuery Search query for title/description
         * @param category    Category filter (if applicable)
         * @param fromDate    Filter events starting from this date
         * @param toDate      Filter events ending before this date
         * @param status      Event approval status filter
         * @return List of events matching the criteria
         */
        List<Event> getEventsWithFilters(String searchQuery, String category,
                        LocalDateTime fromDate, LocalDateTime toDate,
                        EventApprovalStatus status);

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
         * Get event entity by id.
         *
         * @param eventId the event id
         * @return Event entity
         */
        Event getEventEntityById(UUID eventId);

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
         * @param registrationId   the registration id
         * @param rejectedByUserId the id of the manager rejecting the registration
         * @return RegistrationRejectionResponseDTO with rejection status
         */
        RegistrationRejectionResponseDTO rejectRegistration(UUID registrationId, UUID rejectedByUserId);

        /**
         * Mark a registration as complete.
         *
         * @param registrationId    the registration id
         * @param request           the completion details
         * @param completedByUserId the id of the manager completing the registration
         * @return RegistrationCompletionResponseDTO with completion status
         */
        RegistrationCompletionResponseDTO completeRegistration(UUID registrationId,
                        RegistrationCompletionRequest request, UUID completedByUserId);

        /**
         * Revert a completed registration back to APPROVED status.
         *
         * @param registrationId the registration id
         * @param userId         the id of the manager performing the action
         * @return RegistrationCompletionResponseDTO with status
         */
        RegistrationCompletionResponseDTO uncompleteRegistration(UUID registrationId, UUID userId);

        /**
         * Get list of pending events (adminApprovalStatus = PENDING).
         *
         * @return List of events awaiting admin approval
         */
        List<Event> getPendingEvents();

        long countRegisteredEvents(UUID volunteerId);
}
