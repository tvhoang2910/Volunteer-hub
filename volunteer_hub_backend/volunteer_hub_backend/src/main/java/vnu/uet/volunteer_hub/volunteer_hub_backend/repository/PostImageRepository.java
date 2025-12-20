package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostImage;

import java.util.UUID;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, UUID> {

    /**
     * Find the maximum sort_order for a given post
     * Used to calculate the next sort_order when uploading new images
     * Returns null if no images exist for this post
     */
    @Query("SELECT MAX(pi.sortOrder) FROM PostImage pi WHERE pi.post.id = :postId")
    Integer findMaxSortOrderByPostId(@Param("postId") UUID postId);

    /**
     * Find all images for a given post, ordered by sortOrder
     * Used to retrieve images for display without lazy loading issues
     */
    @Query("SELECT pi FROM PostImage pi WHERE pi.post.id = :postId ORDER BY pi.sortOrder ASC")
    java.util.List<PostImage> findByPostIdOrderBySortOrderAsc(@Param("postId") UUID postId);
}
