package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.Comment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.ManagerRequestStatus;

@Getter
@Setter
@Entity
@Table(name = "manager_role_requests")
@ToString(exclude = { "requestedBy", "decidedBy" })
public class ManagerRoleRequest extends BaseEntity {

    @Comment("User requesting MANAGER role")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedBy;

    @Comment("Admin who approved/rejected")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by_user_id")
    private User decidedBy;

    @Comment("Request status")
    @Column(name = "status", nullable = false, length = 20)
    private String status = ManagerRequestStatus.PENDING.name();

    @Comment("Decision timestamp")
    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @Comment("Optional decision note")
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}
