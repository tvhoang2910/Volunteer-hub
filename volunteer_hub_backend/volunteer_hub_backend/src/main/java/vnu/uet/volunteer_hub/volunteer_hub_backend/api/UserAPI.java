package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateProfileRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.UserProfileResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EventService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

import java.util.List;
import java.util.UUID;

/**
 * API endpoints for user-related operations.
 * <p>
 * Các API được hỗ trợ:
 * - GET /api/users/{userId}: Lấy thông tin profile user
 * - PUT /api/users/profile: Cập nhật profile cá nhân
 * - GET /api/users/{userId}/posts: Lấy bài viết của user
 * - GET /api/users/{userId}/events: Lấy danh sách sự kiện đã tham gia
 * (portfolio tình nguyện)
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserAPI {

        private final PostService postService;
        private final UserService userService;
        private final EventService eventService;

        /**
         * Get user profile information.
         * GET /api/users/{userId}
         * [TEST MODE] userId được truyền từ request
         * Response: UserProfileResponse
         */
        @GetMapping()
        public ResponseEntity<?> getUserProfile() {
                try {
                        // [TEST MODE] userId được truyền từ request
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        UUID userId = userService.getViewerIdFromAuthentication(auth);

                        UserProfileResponse response = userService.getUserProfile(userId);

                        return ResponseEntity.ok(ResponseDTO.<UserProfileResponse>builder()
                                        .message("User profile retrieved successfully")
                                        .data(response)
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
                                                        .message("Failed to retrieve user profile")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Update user profile.
         * PUT /api/users/profile
         * [TEST MODE] userId được truyền từ body query
         * Request: UpdateProfileRequest
         * Response: UserProfileResponse
         */
        @PutMapping("/profile")
        public ResponseEntity<?> updateUserProfile(
                        @RequestBody UpdateProfileRequest request) {
                try {
                        // [TEST MODE] userId được truyền từ request param
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        UUID userId = userService.getViewerIdFromAuthentication(auth);

                        UserProfileResponse response = userService.updateUserProfile(userId, request);

                        return ResponseEntity.ok(ResponseDTO.<UserProfileResponse>builder()
                                        .message("User profile updated successfully")
                                        .data(response)
                                        .build());
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ResponseDTO.builder()
                                                        .message("Invalid update data")
                                                        .detail(e.getMessage())
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
                                                        .message("Failed to update user profile")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Get list of events user has participated in (Volunteer Portfolio).
         * GET /api/users/{userId}/events
         * Response: List<EventResponseDTO>
         * <p>
         * Lấy danh sách tất cả sự kiện mà user đã đăng ký tham gia.
         * Bao gồm thông tin sự kiện và trạng thái đăng ký của user.
         * Cho Admin xem tất cả.
         */
        @GetMapping("/events")
        public ResponseEntity<?> getUserEvents() {
                try {
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        UUID userId = userService.getViewerIdFromAuthentication(auth);
                        List<EventResponseDTO> eventResponses = userService.getUserEvents(userId);
                        return ResponseEntity.ok(ResponseDTO.<List<EventResponseDTO>>builder()
                                        .message("User events retrieved successfully")
                                        .data(eventResponses)
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
                                                        .message("Failed to retrieve user events")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Get posts by a specific user.
         * GET /api/users/{userId}/posts
         * Query: page, size
         * Response: PageResponse<ScoredPostDTO>
         * <p>
         * TODO (Future):
         * - Add @PreAuthorize or custom authorization
         * - Add visibility filtering based on viewer
         * - Add sorting options (newest, most popular)
         * - Consider caching for frequently accessed user profiles
         */
        @GetMapping("/posts")
        // @PreAuthorize("permitAll()") // TODO: Adjust after auth setup
        public ResponseEntity<?> getUserPosts(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size) {
                try {
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        UUID userId = userService.getViewerIdFromAuthentication(auth);
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

        /**
         * Get count of events user has registered for (not including removed).
         * GET /api/users/{userId}/registered-events-count
         * Response: { data: number, message: "...", detail: null }
         * <p>
         * Đếm số sự kiện mà user đã đăng ký tham gia.
         * Chỉ đếm những sự kiện có registrationStatus = "APPROVED", "CHECKED_IN" hoặc
         * "COMPLETED"
         */
        @GetMapping("/registered-events-count")
        public ResponseEntity<?> getRegisteredEventsCount() {
                try {
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        UUID userId = userService.getViewerIdFromAuthentication(auth);

                        // Use EventService's optimized count method instead of fetching all events
                        long count = eventService.countRegisteredEvents(userId);

                        return ResponseEntity.ok(ResponseDTO.<Long>builder()
                                        .message("Registered events count retrieved successfully")
                                        .data(count)
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
                                                        .message("Failed to retrieve registered events count")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }
}
