package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    /**
     * Find role by name.
     * This query is called frequently during initialization.
     * Consider caching at service layer if repeated calls are a bottleneck.
     */
    @Query("SELECT r FROM Role r WHERE r.roleName = :roleName")
    Optional<Role> findByRoleName(@Param("roleName") String roleName);
}
