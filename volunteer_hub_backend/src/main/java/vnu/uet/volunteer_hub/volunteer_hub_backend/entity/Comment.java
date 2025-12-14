package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * Entity đại diện cho bình luận (comment) trên bài viết
 */
@Getter
@Setter
@Entity
@Table(name = "comments", indexes = {
        @Index(name = "idx_comments_post_id", columnList = "post_id"),
        @Index(name = "idx_comments_user_id", columnList = "user_id")
})
@AttributeOverride(name = "id", column = @Column(name = "comment_id", nullable = false, updatable = false))
@org.hibernate.annotations.Comment("Bảng quản lý bình luận trên bài viết")
public class Comment extends BaseEntity {

    @org.hibernate.annotations.Comment("Nội dung bình luận")
    @Column(name = "content", nullable = false, length = 1000)
    private String content;

    @org.hibernate.annotations.Comment("ID của bài viết được bình luận")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @org.hibernate.annotations.Comment("ID của user viết bình luận")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @org.hibernate.annotations.Comment("ID của comment cha (nếu là reply, null nếu là comment gốc)")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;

    @org.hibernate.annotations.Comment("Danh sách các reply của comment này")
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> replies = new ArrayList<>();
}
