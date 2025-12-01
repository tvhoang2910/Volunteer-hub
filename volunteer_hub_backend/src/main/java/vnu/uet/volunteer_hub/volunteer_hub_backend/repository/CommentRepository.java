package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Comment;

import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    Page<Comment> findByPostId(UUID postId, Pageable pageable);

    Page<Comment> findByPostIdAndParentIsNull(UUID postId, Pageable pageable);

    long countByPostIdAndUserId(UUID postId, UUID userId);
}
