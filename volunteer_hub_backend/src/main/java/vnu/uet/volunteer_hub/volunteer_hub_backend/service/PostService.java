package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.UUID;

import org.springframework.data.domain.Page;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.CreatePostRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdatePostRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.PostDetailResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;

public interface PostService {
    Page<ScoredPostDTO> getVisiblePosts(UUID viewerId, int page, int size);

    ScoredPostDTO createPost(CreatePostRequest request, UUID authorId);

    PostDetailResponse getPostDetail(UUID postId, UUID viewerId);

    /**
     * Update a post by ID.
     * 
     * TODO (Future):
     * - Add authorization check: only author or admin can update
     * - Add audit logging for post updates
     * 
     * @param postId  the post ID
     * @param request the update request
     * @return updated post as ScoredPostDTO
     */
    ScoredPostDTO updatePost(UUID postId, UpdatePostRequest request);

    /**
     * Delete a post by ID.
     * 
     * TODO (Future):
     * - Add authorization check: only author or admin can delete
     * - Add soft delete option instead of hard delete
     * - Clean up related reactions and comments
     * 
     * @param postId the post ID
     */
    void deletePost(UUID postId);

    /**
     * Get posts by a specific user.
     * 
     * TODO (Future):
     * - Add visibility check: viewer should only see visible posts
     * - Add filtering/sorting options
     * 
     * @param userId the user ID
     * @param page   page number (0-based)
     * @param size   page size
     * @return paginated posts
     */
    Page<ScoredPostDTO> getPostsByUserId(UUID userId, int page, int size);
}
