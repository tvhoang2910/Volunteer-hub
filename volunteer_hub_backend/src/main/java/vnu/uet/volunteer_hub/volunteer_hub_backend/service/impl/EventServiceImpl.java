package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.EventRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EventService;

@Service
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService postRankingService;

    public EventServiceImpl(EventRepository eventRepository,
            vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService postRankingService) {
        this.eventRepository = eventRepository;
        this.postRankingService = postRankingService;
    }

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

}
