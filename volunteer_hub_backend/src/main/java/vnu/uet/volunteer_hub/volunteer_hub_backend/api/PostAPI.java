package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.CreateCommentRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.CreatePostRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdatePostRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CommentResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.PostDetailResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.CommentService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.ReactionType;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostAPI {

        private final PostService postService;
        private final UserService userService;
        private final CommentService commentService;

        /**
         * Create a new post.
         * POST /api/posts/{authorId}
         * Request: CreatePostRequest
         * Response: ScoredPostDTO
         * <p>
         * TODO: Sau khi test xong, sửa lại thành:
         * <p>
         * {@code @PostMapping}
         * public ResponseEntity<?> createPost(@Valid @RequestBody
         * CreatePostRequest request) {
         * Authentication auth =
         * SecurityContextHolder.getContext().getAuthentication();
         * UUID authorId = userService.getViewerIdFromAuthentication(auth);
         */
        @PostMapping("/{authorId}")
        public ResponseEntity<?> createPost(@PathVariable UUID authorId,
                        @Valid @RequestBody CreatePostRequest request) {
                try {
                        // [TEST MODE] authorId được truyền từ path parameter
                        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        // UUID authorId = userService.getViewerIdFromAuthentication(auth);
                        if (authorId == null) {
                                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                                .body(ResponseDTO.builder()
                                                                .message("User not authenticated")
                                                                .build());
                        }
                        ScoredPostDTO createdPost = postService.createPost(request, authorId);
                        return ResponseEntity.status(HttpStatus.CREATED)
                                        .body(ResponseDTO.<ScoredPostDTO>builder()
                                                        .message("Post created successfully")
                                                        .data(createdPost)
                                                        .build());
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ResponseDTO.builder()
                                                        .message("Failed to create post")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Paginated feed of visible posts. page (0-based) and size query params are
         * supported. Works for anonymous and authenticated users.
         * GET /api/posts
         * Query: page, size, viewerId (optional - for testing)
         * Response: Page<ScoredPostDTO>
         * <p>
         * TODO: Sau khi test xong, bỏ param viewerId và sửa lại:
         * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
         * UUID viewerId = userService.getViewerIdFromAuthentication(auth);
         */
        @GetMapping
        public ResponseEntity<?> getVisiblePosts(@RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "20") int size,
                        @RequestParam(required = false) UUID viewerId) {
                try {
                        // [TEST MODE] viewerId được truyền từ query parameter
                        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        // UUID viewerId = userService.getViewerIdFromAuthentication(auth);
                        Page<ScoredPostDTO> pageResult = postService.getVisiblePosts(viewerId, page, size);
                        return ResponseEntity.ok(ResponseDTO.<Page<ScoredPostDTO>>builder()
                                        .message("Posts retrieved successfully")
                                        .data(pageResult)
                                        .build());
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ResponseDTO.builder()
                                                        .message("Failed to retrieve posts")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Get post detail by ID.
         * GET /api/posts/{postId}
         * Query: viewerId (optional - for testing)
         * Response: PostDetailResponse
         * <p>
         * TODO: Sau khi test xong, bỏ param viewerId và sửa lại:
         * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
         * UUID viewerId = userService.getViewerIdFromAuthentication(auth);
         */
        @GetMapping("/{postId}/{viewerId}")
        public ResponseEntity<?> getPostDetail(@PathVariable UUID postId, @PathVariable UUID viewerId) {
                try {
                        // [TEST MODE] viewerId được truyền từ query parameter
                        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        // UUID viewerId = userService.getViewerIdFromAuthentication(auth);
                        PostDetailResponse postDetail = postService.getPostDetail(postId, viewerId);
                        return ResponseEntity.ok(ResponseDTO.<PostDetailResponse>builder()
                                        .message("Post detail retrieved successfully")
                                        .data(postDetail)
                                        .build());
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(ResponseDTO.builder()
                                                        .message("Post not found or not visible")
                                                        .detail(e.getMessage())
                                                        .build());
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ResponseDTO.builder()
                                                        .message("Failed to retrieve post detail")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Get post detail without viewer (public view).
         * GET /api/posts/{postId}
         */
        @GetMapping("/{postId}")
        public ResponseEntity<?> getPostDetailPublic(@PathVariable UUID postId) {
                try {
                        PostDetailResponse postDetail = postService.getPostDetail(postId, null);
                        return ResponseEntity.ok(ResponseDTO.<PostDetailResponse>builder()
                                        .message("Post detail retrieved successfully")
                                        .data(postDetail)
                                        .build());
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(ResponseDTO.builder()
                                                        .message("Post not found or not visible")
                                                        .detail(e.getMessage())
                                                        .build());
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ResponseDTO.builder()
                                                        .message("Failed to retrieve post detail")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Update a post by ID.
         * PUT /api/posts/{postId}
         * Request: UpdatePostRequest
         * Response: ScoredPostDTO
         * <p>
         * TODO (Future):
         * - Add @PreAuthorize("hasRole('USER')") or custom authorization
         * - Verify requester is the author or admin before allowing update
         * - Add audit logging
         */
        @PutMapping("/{postId}/{authorId}")
        // @PreAuthorize("hasRole('VOLUNTEER')") // TODO: Enable after auth setup
        public ResponseEntity<?> updatePost(
                        @PathVariable UUID postId,
                        @PathVariable UUID authorId,
                        @Valid @RequestBody UpdatePostRequest request) {
                try {
                        // TODO (Future): Get authenticated user and verify ownership
                        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        // UUID authorId = userService.getViewerIdFromAuthentication(auth);
                        // Verify ownership in service layer

                        ScoredPostDTO updatedPost = postService.updatePost(postId, request, authorId);
                        return ResponseEntity.ok(ResponseDTO.<ScoredPostDTO>builder()
                                        .message("Post updated successfully")
                                        .data(updatedPost)
                                        .build());
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(ResponseDTO.builder()
                                                        .message("Post not found")
                                                        .detail(e.getMessage())
                                                        .build());
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ResponseDTO.builder()
                                                        .message("Failed to update post")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Delete a post by ID.
         * DELETE /api/posts/{postId}
         * Response: MessageResponse
         * <p>
         * TODO (Future):
         * - Add @PreAuthorize("hasRole('USER')") or custom authorization
         * - Verify requester is the author or admin before allowing delete
         * - Consider soft delete instead of hard delete
         * - Add audit logging
         */
        @DeleteMapping("/{postId}/{authorId}")
        // @PreAuthorize("hasRole('VOLUNTEER')") // TODO: Enable after auth setup
        public ResponseEntity<?> deletePost(@PathVariable UUID postId, @PathVariable UUID authorId) {
                try {
                        // TODO (Future): Get authenticated user and verify ownership
                        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        // UUID authorId = userService.getViewerIdFromAuthentication(auth);
                        // Verify ownership in service layer

                        postService.deletePost(postId, authorId);
                        return ResponseEntity.ok(ResponseDTO.<Void>builder()
                                        .message("Post deleted successfully")
                                        .build());
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(ResponseDTO.builder()
                                                        .message("Post not found")
                                                        .detail(e.getMessage())
                                                        .build());
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ResponseDTO.builder()
                                                        .message("Failed to delete post")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Create a comment on a post.
         * POST /api/posts/{postId}/comments
         * Request: CreateCommentRequest
         * Response: CommentResponse
         */
        @PostMapping("/{postId}/comments/{userId}")
        public ResponseEntity<?> createComment(@PathVariable UUID postId,
                        @Valid @RequestBody CreateCommentRequest request, @PathVariable UUID userId) {
                try {
                        // [TEST MODE] userId được truyền từ request
                        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        // UUID userId = userService.getViewerIdFromAuthentication(auth);
                        CommentResponse response = commentService.createComment(postId, request, userId);
                        return ResponseEntity.ok(ResponseDTO.builder()
                                        .message("Comment created successfully")
                                        .data(response)
                                        .build());
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ResponseDTO.builder()
                                                        .message(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Get comments for a post.
         * GET /api/posts/{postId}/comments
         * Query: page, size
         * Response: Page<CommentResponse>
         */
        @GetMapping("/{postId}/comments")
        public ResponseEntity<?> getComments(@PathVariable UUID postId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {
                try {
                        Page<CommentResponse> response = commentService.getCommentsByPostId(postId,
                                        PageRequest.of(page, size, Sort.by("createdAt").descending()));
                        return ResponseEntity.ok(ResponseDTO.builder()
                                        .message("Get comments successfully")
                                        .data(response)
                                        .build());
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ResponseDTO.builder()
                                                        .message(e.getMessage())
                                                        .build());
                }
        }

        /**
         * Toggle reaction on a post (add, update, or remove).
         * POST /api/posts/{postId}/reactions/{viewerId}
         * Query: type (optional, default LIKE)
         * Response: PostDetailResponse
         * <p>
         * Logic:
         * - Nếu chưa có react: Thêm mới.
         * - Nếu đã có react cùng type: Xóa (toggle unlike).
         * - Nếu đã có react khác type: Cập nhật.
         */
        @PostMapping("/{postId}/reactions/{viewerId}")
        public ResponseEntity<?> toggleReaction(@PathVariable UUID postId, @PathVariable UUID viewerId,
                        @RequestParam(name = "type", required = false, defaultValue = "LIKE") ReactionType reactionType) {
                try {
                        // [TEST MODE] viewerId passed from path param
                        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        // UUID viewerId = userService.getViewerIdFromAuthentication(auth);

                        PostDetailResponse response = postService.likePost(postId, viewerId, reactionType);
                        return ResponseEntity.ok(ResponseDTO.<PostDetailResponse>builder()
                                        .message("Reaction toggled successfully")
                                        .data(response)
                                        .build());
                } catch (IllegalStateException e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ResponseDTO.builder()
                                                        .message(e.getMessage())
                                                        .build());
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(ResponseDTO.builder()
                                                        .message(e.getMessage())
                                                        .build());
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ResponseDTO.builder()
                                                        .message("Failed to toggle reaction")
                                                        .detail(e.getMessage())
                                                        .build());
                }
        }
}
