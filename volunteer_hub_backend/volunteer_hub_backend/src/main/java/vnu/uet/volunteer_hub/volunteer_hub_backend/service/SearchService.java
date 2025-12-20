package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.List;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.UserAutocompleteDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventAutocompleteDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.PostAutocompleteDTO;

public interface SearchService {

    List<UserAutocompleteDTO> autocompleteUsers(String keyword, Integer limit);

    List<PostAutocompleteDTO> autocompletePosts(String keyword, Integer limit);

    List<EventAutocompleteDTO> autocompleteEvents(String keyword, Integer limit);
}
