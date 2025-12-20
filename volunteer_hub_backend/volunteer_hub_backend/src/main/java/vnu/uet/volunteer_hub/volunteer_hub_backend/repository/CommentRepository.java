package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Comment;

import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    /**
     * Find comments by post with eager loading of post and user
     * Fixes N+1 when iterating over comments and accessing post/user
     */
    @EntityGraph(attributePaths = { "post", "user" })
    Page<Comment> findByPostId(UUID postId, Pageable pageable);

    /**
     * Find root comments (no parent) with eager loading
     */
    @EntityGraph(attributePaths = { "post", "user" })
    Page<Comment> findByPostIdAndParentIsNull(UUID postId, Pageable pageable);

    /**
     * Find all replies for a comment with eager loading
     */
    @EntityGraph(attributePaths = { "user" })
    List<Comment> findByParentId(UUID parentId);

    long countByPostId(UUID postId);

    long countByPostIdAndUserId(UUID postId, UUID userId);
}
