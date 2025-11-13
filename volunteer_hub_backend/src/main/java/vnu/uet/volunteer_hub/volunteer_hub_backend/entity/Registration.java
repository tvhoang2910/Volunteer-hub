package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.RegistrationStatus;

@Getter
@Setter
@Entity
@Table(name = "registrations")
@AttributeOverrides({
        @AttributeOverride(name = "id", column = @Column(name = "registration_id", nullable = false, updatable = false)),
        @AttributeOverride(name = "createdAt", column = @Column(name = "registered_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE"))
})
public class Registration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User volunteer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status", nullable = false, length = 50)
    private RegistrationStatus registrationStatus = RegistrationStatus.PENDING;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = Boolean.FALSE;

    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;

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
