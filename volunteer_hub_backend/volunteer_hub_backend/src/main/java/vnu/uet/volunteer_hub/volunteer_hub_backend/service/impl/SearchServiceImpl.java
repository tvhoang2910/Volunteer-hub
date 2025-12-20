package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.*;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.EventRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.SearchService;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final EventRepository eventRepository;

    @Override
    public List<UserAutocompleteDTO> autocompleteUsers(String keyword, Integer limit) {
        return userRepository.autocompleteNames(keyword.toLowerCase(), limit);
    }

    @Override
    public List<PostAutocompleteDTO> autocompletePosts(String keyword, Integer limit) {
        return postRepository.autocompleteContent(keyword.toLowerCase(), limit);
    }

    @Override
    public List<EventAutocompleteDTO> autocompleteEvents(String keyword, Integer limit) {
        return eventRepository.autocompleteTitle(keyword.toLowerCase(), limit);
    }

}
