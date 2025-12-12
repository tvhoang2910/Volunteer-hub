package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.List;
import java.util.UUID;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.JoinEventResponse;

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
    vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventResponseDTO getEventById(UUID eventId);
}
