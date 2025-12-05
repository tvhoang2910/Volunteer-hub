package vnu.uet.volunteer_hub.volunteer_hub_backend.entity;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.CascadeType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Entity
@Table(name = "users")
@ToString(exclude = { "roles", "createdEvents", "registrations", "posts", "postReactions", "notifications" })
@AttributeOverride(name = "id", column = @Column(name = "user_id", nullable = false, updatable = false))
public class User extends BaseEntity implements UserDetails {

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", columnDefinition = "TEXT", nullable = false)
    private String password;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = Boolean.TRUE;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_role", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "createdBy", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Event> createdEvents = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "volunteer", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Registration> registrations = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "approvedBy", fetch = FetchType.LAZY)
    private Set<Registration> approvedRegistrations = new HashSet<>(); // Not orphanRemoval, not always owned

    @JsonIgnore
    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Post> posts = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PostReaction> postReactions = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "recipient", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Notification> notifications = new HashSet<>();

    @PrePersist
    public void prePersist() {
        if (isActive == null) {
            isActive = Boolean.TRUE;
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // phòng trường hợp roles = null
        return (roles == null ? List.<GrantedAuthority>of()
                : roles.stream()
                        .filter(Objects::nonNull)
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getRoleName()))
                        .collect(Collectors.toSet()));
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(this.isActive);
    }

    // equals & hashCode: dùng email (lowercased) như business key
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof User))
            return false;
        User that = (User) o;
        return Objects.equals(
                this.email == null ? null : this.email.toLowerCase(),
                that.email == null ? null : that.email.toLowerCase());
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.email == null ? null : this.email.toLowerCase());
    }

}
