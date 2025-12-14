package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.Comment;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.RegistrationStatus;

/**
 * Entity đại diện cho đơn đăng ký tình nguyện của user cho một sự kiện
 */
@Getter
@Setter
@Entity
@Table(name = "registrations", indexes = {
        @Index(name = "idx_registrations_event_user", columnList = "event_id,user_id"),
        @Index(name = "idx_registrations_user_id", columnList = "user_id"),
        @Index(name = "idx_registrations_user_status", columnList = "user_id,registration_status")
})
@AttributeOverrides({
        @AttributeOverride(name = "id", column = @Column(name = "registration_id", nullable = false, updatable = false)),
        @AttributeOverride(name = "createdAt", column = @Column(name = "registered_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE"))
})
@Comment("Bảng quản lý đơn đăng ký tình nguyện của user cho sự kiện")
public class Registration extends BaseEntity {

    @Comment("ID của user đăng ký làm tình nguyện viên")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User volunteer;

    @Comment("ID của sự kiện được đăng ký")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Comment("Trạng thái đơn đăng ký: PENDING (chờ duyệt), APPROVED (đã duyệt), REJECTED (từ chối), WITHDRAWN (user tự hủy), CHECKED_IN (đã check-in), COMPLETED (hoàn thành)")
    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status", nullable = false, length = 50)
    private RegistrationStatus registrationStatus = RegistrationStatus.PENDING;

    @Comment("Thời điểm user check-in tại sự kiện")
    @Column(name = "checked_in_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant checkedInAt;

    @Comment("Thời điểm admin xác nhận hoàn thành sự kiện")
    @Column(name = "completed_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant completedAt;

    @Comment("ID của user (admin) xác nhận hoàn thành")
    @Column(name = "completed_by_user_id")
    private UUID completedByUserId;

    @Comment("Ghi chú về việc hoàn thành sự kiện")
    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

    @Comment("ID của user (admin) duyệt đơn đăng ký")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;

    @Deprecated
    @Comment("(Deprecated) Cờ đánh dấu hoàn thành - nên dùng registrationStatus = COMPLETED thay thế")
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = Boolean.FALSE;

    @Comment("Thời điểm user rút đăng ký (WITHDRAWN); null nếu không rút")
    @Column(name = "withdrawn_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant withdrawnAt;

    @PrePersist
    public void prePersist() {
        if (registrationStatus == null) {
            registrationStatus = RegistrationStatus.PENDING;
        }
        if (isCompleted == null) {
            isCompleted = Boolean.FALSE;
        }
    }
}
