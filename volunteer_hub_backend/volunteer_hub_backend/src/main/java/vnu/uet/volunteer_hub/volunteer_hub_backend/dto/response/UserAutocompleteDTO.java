package vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UserAutocompleteDTO {
    private UUID userId;

    private String name;

    public UserAutocompleteDTO(String name, UUID userId) {
        this.name = name;
        this.userId = userId;
    }
}
