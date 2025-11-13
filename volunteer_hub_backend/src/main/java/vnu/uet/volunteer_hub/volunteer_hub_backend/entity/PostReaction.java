package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.ReactionType;

@Getter
@Setter
@Entity
@Table(name = "post_reactions")
@AttributeOverride(name = "id", column = @Column(name = "reaction_id", nullable = false, updatable = false))
public class PostReaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", length = 50, nullable = false)
    private ReactionType reactionType;

    @Column(name = "comment", length = 500)
    private String comment;

    @Column(name = "comment_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime commentAt;
}
