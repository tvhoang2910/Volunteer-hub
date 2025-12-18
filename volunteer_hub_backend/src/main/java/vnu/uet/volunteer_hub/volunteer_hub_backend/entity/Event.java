package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.Comment;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;

/**
 * Entity đại diện cho sự kiện tình nguyện
 */
@Getter
@Setter
@Entity
@Table(name = "events", indexes = {
        @Index(name = "idx_events_created_by_user", columnList = "created_by_user_id")
})
@AttributeOverride(name = "id", column = @Column(name = "event_id", nullable = false, updatable = false))
@Comment("Bảng quản lý các sự kiện tình nguyện")
public class Event extends BaseEntity {

    @Comment("ID của user tạo sự kiện")
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Comment("Tiêu đề sự kiện")
    @Column(name = "title", nullable = false)
    private String title;

    @Comment("Mô tả chi tiết về sự kiện")
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Comment("Địa điểm tổ chức sự kiện")
    @Column(name = "location", columnDefinition = "TEXT")
    private String location;

    @Comment("Thời gian bắt đầu sự kiện")
    @Column(name = "start_time", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime startTime;

    @Comment("Thời gian kết thúc sự kiện")
    @Column(name = "end_time", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private LocalDateTime endTime;

    @Comment("Số lượng tình nguyện viên tối đa (null = không giới hạn)")
    @Column(name = "max_volunteers")
    private Integer maxVolunteers;

    @Comment("Trạng thái duyệt của admin: PENDING (chờ duyệt), APPROVED (đã duyệt), REJECTED (từ chối)")
    @Enumerated(EnumType.STRING)
    @Column(name = "admin_approval_status", length = 50, nullable = false)
    private EventApprovalStatus adminApprovalStatus = EventApprovalStatus.PENDING;

    @Comment("Cờ đánh dấu sự kiện đã được lưu trữ (ẩn khỏi danh sách công khai)")
    @Column(name = "is_archived", nullable = false)
    private Boolean isArchived = Boolean.FALSE;

    @Comment("Ảnh bìa/Thumbnail đại diện cho sự kiện")
    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @JsonIgnore
    @OneToMany(mappedBy = "event", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Registration> registrations = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "event", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Post> posts = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "event", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Notification> notifications = new HashSet<>();

    @PrePersist
    public void prePersist() {
        if (adminApprovalStatus == null) {
            adminApprovalStatus = EventApprovalStatus.PENDING;
        }
        if (isArchived == null) {
            isArchived = Boolean.FALSE;
        }
    }
}
