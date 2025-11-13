package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostReaction;

public interface PostReactionRepository extends JpaRepository<PostReaction, UUID> {

    @Query("SELECT COUNT(r) FROM PostReaction r WHERE r.post.id = :postId AND r.user.id = :userId AND r.createdAt > :since")
    long countRecentReactionsByPostAndUser(@Param("postId") UUID postId, @Param("userId") UUID userId,
            @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(r) FROM PostReaction r WHERE r.post.id = :postId AND r.user.id = :userId AND r.comment IS NOT NULL")
    long countCommentsByPostAndUser(@Param("postId") UUID postId, @Param("userId") UUID userId);
}
