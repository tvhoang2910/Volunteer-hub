package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.List;
import java.util.UUID;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;

public interface EventService {
    void approveEventStatus(UUID id);

    void rejectEventStatus(UUID id);

    void deleteEvent(UUID id);

    List<Event> getAllEvents();
}
