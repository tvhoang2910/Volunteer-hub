package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.ManagerRoleRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.ManagerRequestStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.utils.RoleUtils;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.EventRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.ManagerRoleRequestRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RegistrationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RoleRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EventService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.TopPostsCacheService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAPI {

    private final EventService eventService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final TopPostsCacheService topPostsCacheService;
    private final PostRankingService postRankingService;
    private final ManagerRoleRequestRepository managerRoleRequestRepository;
    private final RoleRepository roleRepository;

    @PutMapping("/events/{eventId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveEventStatus(@PathVariable UUID eventId) {
        eventService.approveEventStatus(eventId);
        return ResponseEntity.ok(ResponseDTO.<Void>builder()
                .message("Event approved successfully")
                .build());
    }

    @PutMapping("/events/{eventId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectEventStatus(@PathVariable UUID eventId) {
        eventService.rejectEventStatus(eventId);
        return ResponseEntity.ok(ResponseDTO.<Void>builder()
                .message("Event rejected successfully")
                .build());
    }

    @DeleteMapping("/events/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteEvent(@PathVariable UUID eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.ok(ResponseDTO.<Void>builder()
                .message("Event deleted successfully")
                .build());
    }

    @PutMapping("/users/{userId}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> lockUser(@PathVariable UUID userId) {
        userService.lockUserById(userId);
        return ResponseEntity.ok(ResponseDTO.<Void>builder().message("User locked").build());
    }

    @PutMapping("/users/{userId}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unlockUser(@PathVariable UUID userId) {
        userService.unlockUserById(userId);
        return ResponseEntity.ok(ResponseDTO.<Void>builder().message("User unlocked").build());
    }

    @GetMapping("/events/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> exportEvents(@RequestParam(defaultValue = "json") String format) {
        // Use findAllWithCreator() to eagerly load createdBy and avoid
        // LazyInitializationException
        List<Map<String, Object>> rows = eventRepository.findAllWithCreator().stream().map(e -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", e.getId() == null ? "" : e.getId().toString());
            m.put("title", e.getTitle());
            m.put("startTime", e.getStartTime() == null ? "" : e.getStartTime().toString());
            m.put("endTime", e.getEndTime() == null ? "" : e.getEndTime().toString());
            m.put("location", e.getLocation());
            m.put("createdBy", e.getCreatedBy() == null ? "" : e.getCreatedBy().getEmail());
            m.put("approvalStatus", e.getAdminApprovalStatus() == null ? "" : e.getAdminApprovalStatus().name());
            return m;
        }).collect(Collectors.toList());

        if ("csv".equalsIgnoreCase(format)) {
            String csv = "\uFEFF" + toCsv(rows); // UTF-8 BOM for Excel on Windows
            byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
            InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(bytes));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=events.csv");
            return ResponseEntity.ok().headers(headers)
                    .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                    .body(resource);
        }

        return ResponseEntity.ok(ResponseDTO.<List<Map<String, Object>>>builder().message("Exported events")
                .data(rows).build());
    }

    @GetMapping("/volunteers/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> exportVolunteers(@RequestParam(defaultValue = "json") String format) {
        List<Map<String, Object>> rows = userRepository.findAll().stream().map(u -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", u.getId() == null ? "" : u.getId().toString());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("isActive", u.getIsActive());
            return m;
        }).collect(Collectors.toList());

        if ("csv".equalsIgnoreCase(format)) {
            String csv = "\uFEFF" + toCsv(rows); // UTF-8 BOM for Excel on Windows
            byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
            InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(bytes));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=volunteers.csv");
            return ResponseEntity.ok().headers(headers)
                    .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                    .body(resource);
        }

        return ResponseEntity.ok(ResponseDTO.<List<Map<String, Object>>>builder().message("Exported volunteers")
                .data(rows).build());
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboard() {
        long totalEvents = eventRepository.count();
        long approvedEvents = eventRepository.findAll().stream()
                .filter(e -> e.getAdminApprovalStatus() != null && e.getAdminApprovalStatus().name().equals("APPROVED"))
                .count();
        long pendingEvents = eventRepository.findAll().stream()
                .filter(e -> e.getAdminApprovalStatus() != null && e.getAdminApprovalStatus().name().equals("PENDING"))
                .count();
        long totalVolunteers = userRepository.count();
        long totalRegistrations = registrationRepository.count();

        Map<String, Object> payload = Map.of(
                "totalEvents", totalEvents,
                "approvedEvents", approvedEvents,
                "pendingEvents", pendingEvents,
                "totalVolunteers", totalVolunteers,
                "totalRegistrations", totalRegistrations);

        return ResponseEntity.ok(ResponseDTO.<Map<String, Object>>builder().message("Dashboard data").data(payload)
                .build());
    }

    /**
     * This Java function refreshes the top posts cache with a limit of 5 and
     * requires the user to have an
     * 'ADMIN' role.
     * 
     * @return The method `refreshTopPostsCache()` is returning a `ResponseEntity`
     *         object with a message
     *         indicating that the top posts cache has been refreshed.
     */
    @PutMapping("/cache/top-posts/refresh")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> refreshTopPostsCache() {
        topPostsCacheService.refreshTopPostsCache(5);
        return ResponseEntity.ok(ResponseDTO.<Void>builder().message("Top posts cache refreshed").build());
    }

    /**
     * This Java function invalidates the cache for the top posts and requires the
     * user to have an 'ADMIN'
     * role.
     * 
     * @return The method `invalidateTopPostsCache()` is being called to invalidate
     *         the top posts cache
     *         with a cache duration of 5 minutes. After that, a ResponseEntity with
     *         a message "Top posts cache
     *         invalidated" is being returned.
     */
    @PutMapping("/cache/top-posts/invalidate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> invalidateTopPostsCache() {
        topPostsCacheService.invalidateTopPostsCache(5);
        return ResponseEntity.ok(ResponseDTO.<Void>builder().message("Top posts cache invalidated").build());
    }

    /**
     * This Java function rebuilds the Redis ZSET ranking from the database and
     * handles exceptions
     * during the process.
     * 
     * @return The method `rebuildPostRanking` returns a `ResponseEntity` object. If
     *         the post ranking
     *         rebuild is successful, it returns a response with a message "Rebuild
     *         scheduled". If the rebuild
     *         fails, it returns a response with a message "Rebuild failed" along
     *         with the exception message.
     */
    @PutMapping("/cache/top-posts/rebuild-ranking")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rebuildPostRanking() {
        // rebuild the Redis ZSET ranking from the DB
        topPostsCacheService.invalidateTopPostsCache(5);
        // attempt to rebuild ranking; delegate to ranking service through cache service
        // (ranking service has a public rebuild method)
        try {
            postRankingService.rebuildRankingFromDatabase();
            return ResponseEntity.ok(ResponseDTO.<Void>builder().message("Rebuild scheduled").build());
        } catch (Exception e) {
            return ResponseEntity.ok(ResponseDTO.<Void>builder().message("Rebuild failed: " + e.getMessage()).build());
        }
    }

    /**
     * This Java function retrieves cached top posts for administrators.
     * 
     * @return The `getCachedTopPosts` method returns a `ResponseEntity` object. If
     *         the
     *         `topPostsCacheService.getTopPostsCached(5)` method call is
     *         successful, it returns a response
     *         with a message "Cached top posts" and the top post's data. If there
     *         is
     *         an exception during the
     *         method call, it returns a response with a message "No cached top
     *         posts" and an empty list
     */
    @GetMapping("/cache/top-posts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCachedTopPosts() {
        try {
            return ResponseEntity.ok(ResponseDTO.builder().message("Cached top posts")
                    .data(topPostsCacheService.getTopPostsCached(5)).build());
        } catch (Exception e) {
            return ResponseEntity.ok(ResponseDTO.builder().message("No cached top posts")
                    .data(Collections.emptyList()).build());
        }
    }

    private String toCsv(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) {
            return "";
        }
        List<String> headers = new ArrayList<>(rows.get(0).keySet());
        StringBuilder sb = new StringBuilder();
        sb.append(String.join(",", headers)).append("\r\n");
        for (Map<String, Object> row : rows) {
            List<String> values = headers.stream().map(h -> escapeCsv(row.get(h))).collect(Collectors.toList());
            sb.append(String.join(",", values)).append("\r\n");
        }
        return sb.toString();
    }

    private String escapeCsv(Object o) {
        if (o == null)
            return "";
        String s = o.toString().replace("\"", "\"\"");
        if (s.contains(",") || s.contains("\n") || s.contains("\r") || s.contains("\"")) {
            return "\"" + s + "\"";
        }
        return s;
    }

    @GetMapping("/events")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllEvents() {
        try {
            // Use repository directly with join fetch to avoid LazyInitializationException
            List<Event> events = eventRepository.findAllWithCreator();
            // Map to DTO to expose createdBy info (Entity has @JsonIgnore on that field)
            List<Map<String, Object>> rows = events.stream().map(e -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", e.getId() != null ? e.getId().toString() : "");
                m.put("title", e.getTitle());
                m.put("name", e.getTitle()); // alias for frontend
                m.put("description", e.getDescription());
                m.put("location", e.getLocation());
                m.put("startTime", e.getStartTime() != null ? e.getStartTime().toString() : "");
                m.put("endTime", e.getEndTime() != null ? e.getEndTime().toString() : "");
                m.put("startDate", e.getStartTime() != null ? e.getStartTime().toLocalDate().toString() : "");
                m.put("endDate", e.getEndTime() != null ? e.getEndTime().toLocalDate().toString() : "");
                m.put("maxVolunteers", e.getMaxVolunteers());
                m.put("thumbnailUrl", e.getThumbnailUrl());
                m.put("category", "Tình nguyện"); // Default category since entity doesn't have this field
                m.put("adminApprovalStatus",
                        e.getAdminApprovalStatus() != null ? e.getAdminApprovalStatus().name() : "PENDING");
                m.put("status", e.getAdminApprovalStatus() != null ? e.getAdminApprovalStatus().name() : "PENDING");
                // Creator info - the key fix
                m.put("createdBy", e.getCreatedBy() != null ? e.getCreatedBy().getName() : "");
                m.put("createdByName", e.getCreatedBy() != null ? e.getCreatedBy().getName() : "");
                m.put("createdByEmail", e.getCreatedBy() != null ? e.getCreatedBy().getEmail() : "");
                m.put("createdAt", e.getCreatedAt() != null ? e.getCreatedAt().toString() : "");
                return m;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(ResponseDTO.<List<Map<String, Object>>>builder()
                    .message("Retrieved all events successfully")
                    .data(rows)
                    .build());
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(ResponseDTO.<Void>builder()
                    .message("Failed to retrieve events")
                    .detail(ex.getMessage())
                    .build());
        }
    }

    /**
     * Get all users for admin management
     * GET /api/admin/users
     * Optional query params: page, limit, role
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(required = false) String role) {
        try {
            // Use findAllWithRoles() to eagerly load roles and avoid
            // LazyInitializationException
            List<Map<String, Object>> users = userRepository.findAllWithRoles().stream()
                    .filter(u -> {
                        if (role == null || role.isEmpty())
                            return true;
                        var roles = u.getRoles();
                        if (roles == null || roles.isEmpty())
                            return false;
                        return roles.stream().anyMatch(r -> r.getRoleName().equalsIgnoreCase(role));
                    })
                    .map(u -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", u.getId() != null ? u.getId().toString() : "");
                        m.put("userId", u.getId() != null ? u.getId().toString() : "");
                        m.put("name", u.getName() != null ? u.getName() : "");
                        m.put("firstName", "");
                        m.put("lastName", u.getName() != null ? u.getName() : "");
                        m.put("email", u.getEmail() != null ? u.getEmail() : "");
                        m.put("isActive", Boolean.TRUE.equals(u.getIsActive()));
                        m.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");

                        // Safe role extraction
                        String userRole = RoleUtils.resolvePrimaryRole(u.getRoles());
                        m.put("role", userRole);
                        return m;
                    })
                    .collect(Collectors.toList());

            // Simple pagination
            int startIndex = (page - 1) * limit;
            int endIndex = Math.min(startIndex + limit, users.size());
            List<Map<String, Object>> paginatedUsers = startIndex < users.size()
                    ? users.subList(startIndex, endIndex)
                    : new ArrayList<>();

            return ResponseEntity.ok(ResponseDTO.<List<Map<String, Object>>>builder()
                    .message("Retrieved all users successfully")
                    .data(paginatedUsers)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseDTO.<Void>builder()
                    .message("Failed to retrieve users")
                    .detail(e.getMessage())
                    .build());
        }
    }

    /**
     * List admin role requests (default: PENDING)
     * GET /api/admin/admin-requests?status=PENDING
     */
    @GetMapping("/admin-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listAdminRoleRequests(@RequestParam(defaultValue = "PENDING") String status) {
        String normalized = (status == null || status.isBlank())
                ? ManagerRequestStatus.PENDING.name()
                : status.trim().toUpperCase();

        // Use JOIN FETCH query to avoid LazyInitializationException
        List<Map<String, Object>> rows = managerRoleRequestRepository.findByStatusWithRequestedBy(normalized)
                .stream()
                .map(req -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", req.getId() != null ? req.getId().toString() : "");
                    User u = req.getRequestedBy();
                    m.put("userId", (u != null && u.getId() != null) ? u.getId().toString() : "");
                    m.put("email", u != null ? u.getEmail() : "");
                    m.put("name", u != null ? u.getName() : "");
                    m.put("status", req.getStatus());
                    m.put("createdAt", req.getCreatedAt() != null ? req.getCreatedAt().toString() : "");
                    m.put("decidedAt", req.getDecidedAt() != null ? req.getDecidedAt().toString() : "");
                    m.put("note", req.getNote());
                    return m;
                })
                .toList();

        return ResponseEntity.ok(ResponseDTO.<List<Map<String, Object>>>builder()
                .message("Admin role requests")
                .data(rows)
                .build());
    }

    @PutMapping("/admin-requests/{requestId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveAdminRoleRequest(@PathVariable UUID requestId,
            @RequestParam(required = false) String note) {
        ManagerRoleRequest req = managerRoleRequestRepository.findById(requestId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Request not found"));

        if (!ManagerRequestStatus.PENDING.name().equalsIgnoreCase(req.getStatus())) {
            return ResponseEntity.badRequest().body(ResponseDTO.<Void>builder()
                    .message("Request is not pending")
                    .build());
        }

        UUID adminId = (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Admin not found"));

        User targetUser = userRepository.findById(req.getRequestedBy().getId())
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found"));

        // Grant ADMIN role to the user
        Role adminRole = roleRepository.findByRoleName("ADMIN")
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("ADMIN role not found"));

        targetUser.getRoles().add(adminRole);
        userRepository.save(targetUser);

        req.setStatus(ManagerRequestStatus.APPROVED.name());
        req.setDecidedBy(admin);
        req.setDecidedAt(java.time.LocalDateTime.now());
        if (note != null && !note.isBlank()) {
            req.setNote(note);
        }
        managerRoleRequestRepository.save(req);

        return ResponseEntity.ok(ResponseDTO.<Void>builder()
                .message("Admin role approved")
                .build());
    }

    @PutMapping("/admin-requests/{requestId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectAdminRoleRequest(@PathVariable UUID requestId,
            @RequestParam(required = false) String note) {
        ManagerRoleRequest req = managerRoleRequestRepository.findById(requestId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Request not found"));

        if (!ManagerRequestStatus.PENDING.name().equalsIgnoreCase(req.getStatus())) {
            return ResponseEntity.badRequest().body(ResponseDTO.<Void>builder()
                    .message("Request is not pending")
                    .build());
        }

        UUID adminId = (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Admin not found"));

        req.setStatus(ManagerRequestStatus.REJECTED.name());
        req.setDecidedBy(admin);
        req.setDecidedAt(java.time.LocalDateTime.now());
        if (note != null && !note.isBlank()) {
            req.setNote(note);
        }
        managerRoleRequestRepository.save(req);

        return ResponseEntity.ok(ResponseDTO.<Void>builder()
                .message("Admin role rejected")
                .build());
    }

}
