package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class EventAutocompleteDTO {
    private UUID eventId;

    private String title;

    public EventAutocompleteDTO(UUID eventId, String title) {
        this.eventId = eventId;
        this.title = title;
    }
}
