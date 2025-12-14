package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.Comment;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entity đại diện cho bài viết (post) trong sự kiện
 */
@Getter
@Setter
@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_posts_author_id", columnList = "user_id"),
        @Index(name = "idx_posts_event_id", columnList = "event_id")
})
@AttributeOverride(name = "id", column = @Column(name = "post_id", nullable = false, updatable = false))
@Comment("Bảng quản lý bài viết của user trong các sự kiện")
public class Post extends BaseEntity {

    @Comment("ID của sự kiện chứa bài viết")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Comment("ID của user viết bài")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @Comment("Nội dung bài viết")
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @OneToMany(mappedBy = "post", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PostReaction> reactions = new HashSet<>();

    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM post_reactions r WHERE r.post_id = post_id)")
    private int reactionCount;

    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM comments c WHERE c.post_id = post_id)")
    private int commentCount;

    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM post_reactions r WHERE r.post_id = post_id AND r.created_at > current_timestamp - interval '30 days')")
    private int recentReactionCount;

    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM comments c WHERE c.post_id = post_id AND c.created_at > current_timestamp - interval '30 days')")
    private int recentCommentCount;

    @org.hibernate.annotations.Formula("(SELECT COUNT(*) FROM post_reactions r WHERE r.post_id = post_id AND r.created_at > current_timestamp - interval '30 days' AND (r.reaction_type = 'LIKE' OR r.reaction_type = 'LOVE'))")
    private int recentLikeCount;

    @org.hibernate.annotations.Formula("(SELECT COALESCE(AVG(CASE WHEN r.reaction_type IN ('LIKE', 'LOVE') THEN 5.0 ELSE 8.0 END), 5.0) FROM post_reactions r WHERE r.post_id = post_id)")
    private double averageEdgeWeight;
}
