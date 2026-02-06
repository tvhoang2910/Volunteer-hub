package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Comment;

import lombok.Getter;
import lombok.Setter;

/**
 * Entity đại diện cho ảnh đính kèm của bài viết (gallery)
 */
@Getter
@Setter
@Entity
@Table(
        name = "post_images",
        indexes = {
                @Index(name = "idx_post_images_post_id", columnList = "post_id"),
                @Index(name = "idx_post_images_sort_order", columnList = "sort_order")
        }
)
@AttributeOverride(name = "id", column = @Column(name = "post_image_id", nullable = false, updatable = false))
@Comment("Ảnh đính kèm cho bài viết (gallery)")
public class PostImage extends BaseEntity {

    @Comment("ID của bài viết chứa ảnh")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Comment("URL ảnh của bài viết")
    @Column(name = "image_url", columnDefinition = "TEXT", nullable = false)
    private String imageUrl;

    @Comment("Thứ tự ảnh trong album")
    @Column(name = "sort_order")
    private Integer sortOrder;

}
