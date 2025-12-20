package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.Comment;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Entity đại diện cho vai trò (role) trong hệ thống
 */
@Getter
@Setter
@Entity
@Table(name = "roles")
@AttributeOverride(name = "id", column = @Column(name = "role_id", nullable = false, updatable = false))
@Comment("Bảng quản lý vai trò của user (ADMIN, USER, ORGANIZER, etc.)")
public class Role extends BaseEntity {

    @Comment("Tên vai trò (ví dụ: ADMIN, USER, ORGANIZER)")
    @Column(name = "role_name", length = 50, nullable = false, unique = true)
    private String roleName;

    @Comment("Mô tả chi tiết về vai trò")
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Comment("Danh sách user có vai trò này")
    @JsonIgnore
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private Set<User> users = new HashSet<>();
}
