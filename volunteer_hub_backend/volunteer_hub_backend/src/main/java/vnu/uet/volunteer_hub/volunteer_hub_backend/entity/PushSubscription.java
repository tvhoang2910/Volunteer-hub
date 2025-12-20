package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Comment;

/**
 * Entity lưu trữ subscription Web Push của user
 */
@Getter
@Setter
@Entity
@Table(name = "push_subscriptions", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "endpoint" })
})
@AttributeOverride(name = "id", column = @Column(name = "subscription_id", nullable = false, updatable = false))
@Comment("Bảng lưu trữ Web Push subscription của người dùng")
public class PushSubscription extends BaseEntity {

    @Comment("ID của user sở hữu subscription")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Comment("Endpoint URL của subscription")
    @Column(name = "endpoint", nullable = false, length = 500)
    private String endpoint;

    @Comment("Public key P256dh")
    @Column(name = "p256dh", nullable = false, length = 200)
    private String p256dh;

    @Comment("Auth secret key")
    @Column(name = "auth", nullable = false, length = 200)
    private String auth;
}
