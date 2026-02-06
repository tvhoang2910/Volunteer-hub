package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostReaction;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.ReactionType;

public interface PostReactionRepository extends JpaRepository<PostReaction, UUID> {

        /**
         * Count recent reactions by post and user with eager loading
         */
        @Query("SELECT COUNT(r) FROM PostReaction r WHERE r.post.id = :postId AND r.user.id = :userId AND r.createdAt > :since")
        long countRecentReactionsByPostAndUser(@Param("postId") UUID postId, @Param("userId") UUID userId,
                        @Param("since") LocalDateTime since);

        /**
         * Count reactions for a post
         */
        @Query("SELECT COUNT(r) FROM PostReaction r WHERE r.post.id = :postId")
        int countByPostId(@Param("postId") UUID postId);

        /**
         * Find all reactions for a post with eager loading of post and user
         * Fixes N+1 problem when iterating reactions
         */
        @EntityGraph(attributePaths = { "post", "user" })
        List<PostReaction> findByPostId(UUID postId);

        /**
         * Find all reactions by user with eager loading
         */
        @EntityGraph(attributePaths = { "post", "user" })
        List<PostReaction> findByUserId(UUID userId);

        boolean existsByPostIdAndUserId(UUID postId, UUID userId);

        /**
         * Find reaction with eager loading of post and user
         */
        @EntityGraph(attributePaths = { "post", "user" })
        Optional<PostReaction> findByPostIdAndUserId(UUID postId, UUID userId);

        /**
         * Find reaction by type with eager loading
         */
        @EntityGraph(attributePaths = { "post", "user" })
        Optional<PostReaction> findByPostIdAndUserIdAndReactionType(
                        UUID postId, UUID userId, ReactionType reactionType);

        void deleteByPostIdAndUserId(UUID postId, UUID userId);
}
