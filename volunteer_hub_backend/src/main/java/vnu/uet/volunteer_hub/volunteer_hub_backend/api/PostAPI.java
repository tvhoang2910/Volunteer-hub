package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostAPI {

    private final PostService postService;
    private final UserService userService;

    public PostAPI(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    /**
     * Paginated feed of visible posts. page (0-based) and size query params are
     * supported. Works for anonymous and authenticated users.
     */
    @GetMapping("/visible")
    public ResponseEntity<?> getVisiblePosts(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID viewerId = userService.getViewerIdFromAuthentication(auth);
        Page<ScoredPostDTO> pageResult = postService.getVisiblePosts(viewerId, page, size);
        return ResponseEntity.ok(ResponseDTO.<Page<ScoredPostDTO>>builder()
                .message("Visible posts retrieved")
                .data(pageResult)
                .build());
    }
}
