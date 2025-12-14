package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import org.hibernate.annotations.Comment;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.ReactionType;

/**
 * Entity đại diện cho reaction (tương tác) của user trên bài viết
 */
@Getter
@Setter
@Entity
@Table(name = "post_reactions", indexes = {
        @Index(name = "idx_post_reactions_post_id", columnList = "post_id"),
        @Index(name = "idx_post_reactions_user_id", columnList = "user_id")
})
@AttributeOverride(name = "id", column = @Column(name = "reaction_id", nullable = false, updatable = false))
@Comment("Bảng quản lý reaction của user trên bài viết")
public class PostReaction extends BaseEntity {

    @Comment("ID của bài viết được react")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Comment("ID của user thực hiện react")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Comment("Loại reaction: LIKE, CARE, LOVE, HAHA, WOW, SAD, ANGRY")
    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", length = 50, nullable = false)
    private ReactionType reactionType;
}
