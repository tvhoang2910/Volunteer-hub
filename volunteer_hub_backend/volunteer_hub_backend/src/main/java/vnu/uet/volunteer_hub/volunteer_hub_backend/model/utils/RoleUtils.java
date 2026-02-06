package vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils;

import java.util.Collection;
import java.util.Objects;
import java.util.Set;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;

public final class RoleUtils {

    private RoleUtils() {
    }

    /**
     * Determine a single "primary" role for the user.
     * Priority: ADMIN > MANAGER > VOLUNTEER.
     */
    public static String resolvePrimaryRole(Set<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return "VOLUNTEER";
        }
        if (hasRole(roles, "ADMIN")) {
            return "ADMIN";
        }
        if (hasRole(roles, "MANAGER")) {
            return "MANAGER";
        }
        if (hasRole(roles, "VOLUNTEER")) {
            return "VOLUNTEER";
        }
        // Fallback to any non-null role name
        return roles.stream()
                .filter(Objects::nonNull)
                .map(Role::getRoleName)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse("VOLUNTEER");
    }

    public static boolean hasRole(Set<Role> roles, String roleName) {
        if (roles == null || roles.isEmpty() || roleName == null) {
            return false;
        }
        return roles.stream()
                .filter(Objects::nonNull)
                .anyMatch(r -> roleName.equalsIgnoreCase(r.getRoleName()));
    }

    public static int rank(String role) {
        if (role == null) {
            return 0;
        }
        return switch (role.toUpperCase()) {
            case "ADMIN" -> 3;
            case "MANAGER" -> 2;
            case "VOLUNTEER" -> 1;
            default -> 0;
        };
    }

    /**
     * Returns true when the userRole is at least the requestedRole by priority.
     */
    public static boolean satisfiesRequestedRole(String userRole, String requestedRole) {
        if (requestedRole == null || requestedRole.isBlank()) {
            return true;
        }
        return rank(userRole) >= rank(requestedRole);
    }

    public static String normalizeRole(String role) {
        if (role == null) {
            return null;
        }
        String trimmed = role.trim();
        return trimmed.isEmpty() ? null : trimmed.toUpperCase();
    }

    public static String resolvePrimaryRoleFromAuthorities(
            Collection<? extends org.springframework.security.core.GrantedAuthority> authorities) {
        if (authorities == null || authorities.isEmpty()) {
            return "VOLUNTEER";
        }
        boolean isAdmin = authorities.stream()
                .anyMatch(a -> a != null && "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()));
        if (isAdmin) {
            return "ADMIN";
        }
        boolean isManager = authorities.stream()
                .anyMatch(a -> a != null && "ROLE_MANAGER".equalsIgnoreCase(a.getAuthority()));
        if (isManager) {
            return "MANAGER";
        }
        return "VOLUNTEER";
    }
}
