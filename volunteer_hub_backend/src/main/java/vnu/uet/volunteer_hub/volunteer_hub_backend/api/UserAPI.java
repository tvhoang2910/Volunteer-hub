package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostService;

import java.util.UUID;

/**
 * API endpoints for user-related operations.
 * 
 * TODO (Future):
 * - Add GET /api/users/{userId} for user profile
 * - Add PUT /api/users/{userId} for updating user profile
 * - Add GET /api/users/{userId}/events for user's events
 * - Add authentication/authorization checks
 */
@RestController
@RequestMapping("/api/users")
public class UserAPI {

    private final PostService postService;

    public UserAPI(PostService postService) {
        this.postService = postService;
    }

    /**
     * Get posts by a specific user.
     * GET /api/users/{userId}/posts
     * Query: page, size
     * Response: PageResponse<ScoredPostDTO>
     * 
     * TODO (Future):
     * - Add @PreAuthorize or custom authorization
     * - Add visibility filtering based on viewer
     * - Add sorting options (newest, most popular)
     * - Consider caching for frequently accessed user profiles
     */
    @GetMapping("/{userId}/posts")
    // @PreAuthorize("permitAll()") // TODO: Adjust after auth setup
    public ResponseEntity<?> getUserPosts(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            // TODO (Future): Get viewer ID for visibility filtering
            // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            // UUID viewerId = userService.getViewerIdFromAuthentication(auth);

            Page<ScoredPostDTO> postsPage = postService.getPostsByUserId(userId, page, size);
            return ResponseEntity.ok(ResponseDTO.<Page<ScoredPostDTO>>builder()
                    .message("User posts retrieved successfully")
                    .data(postsPage)
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("User not found")
                            .detail(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to retrieve user posts")
                            .detail(e.getMessage())
                            .build());
        }
    }
}
