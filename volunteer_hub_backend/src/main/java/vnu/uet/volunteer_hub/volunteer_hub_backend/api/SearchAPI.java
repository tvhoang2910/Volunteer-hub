package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventAutocompleteDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.PostAutocompleteDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.UserAutocompleteDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.SearchService;

@RestController
@RequestMapping("/api/search/autocomplete")
@RequiredArgsConstructor
public class SearchAPI {

    private final SearchService searchService;

    @GetMapping("/users")
    public ResponseEntity<List<UserAutocompleteDTO>> autocompleteUsers(@RequestParam("keyword") String keyword,
            @RequestParam(value = "limit", required = false, defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(searchService.autocompleteUsers(keyword, limit));
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostAutocompleteDTO>> autocompletePosts(@RequestParam("keyword") String keyword,
            @RequestParam(value = "limit", required = false, defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(searchService.autocompletePosts(keyword, limit));
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventAutocompleteDTO>> autocompleteEvents(@RequestParam("keyword") String keyword,
            @RequestParam(value = "limit", required = false, defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(searchService.autocompleteEvents(keyword, limit));
    }
}
