package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Post;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;

public interface PostRepository extends JpaRepository<Post, UUID> {

    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN p.event e "
            + "WHERE (e IS NULL OR e.adminApprovalStatus = :approved "
            + "OR p.author.id = :userId "
            + "OR EXISTS (SELECT r FROM Registration r WHERE r.event = e AND r.volunteer.id = :userId))")
    Page<Post> findVisiblePostsForUser(@Param("userId") UUID userId,
            @Param("approved") EventApprovalStatus approved,
            Pageable pageable);

    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN p.event e "
            + "WHERE (e IS NULL OR e.adminApprovalStatus = :approved)")
    Page<Post> findVisiblePostsForAnonymous(@Param("approved") EventApprovalStatus approved,
            Pageable pageable);

    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author a LEFT JOIN FETCH p.event ev WHERE p.id IN :ids")
    List<Post> findAllWithAuthorAndEventByIdIn(@Param("ids") Collection<UUID> ids);
}
