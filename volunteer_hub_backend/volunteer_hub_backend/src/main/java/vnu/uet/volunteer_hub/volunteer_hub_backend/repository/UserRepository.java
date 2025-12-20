package vnu.uet.volunteer_hub.volunteer_hub_backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.UserAutocompleteDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;

public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Override findById with EntityGraph to fetch roles eagerly
     * Fixes N+1 when accessing user.getAuthorities()
     */
    @Override
    @EntityGraph(attributePaths = { "roles" })
    @NonNull
    Optional<User> findById(@NonNull UUID id);

    boolean existsByEmailIgnoreCase(String email);

    /**
     * Find user by email with eager loading of roles
     */
    @EntityGraph(attributePaths = { "roles" })
    Optional<User> findByEmailIgnoreCase(String email);

    /**
     * Find user by email with LEFT JOIN FETCH for optional roles
     * (Legacy method - prefer findByEmailIgnoreCase with EntityGraph)
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findByEmailIgnoreCaseWithRoleOptional(String email);

    /**
     * Find active users with eager loading of roles for broadcast
     */
    @EntityGraph(attributePaths = { "roles" })
    List<User> findByIsActive(Boolean isActive);

    @Query(value = "SELECT * FROM users u WHERE u.name ILIKE CONCAT('%', :keyword, '%') ORDER BY similarity(u.name, :keyword) DESC", nativeQuery = true)
    List<User> searchByName(@Param("keyword") String keyword);

    @Query(value = """
            SELECT name,user_id
            FROM users
            WHERE name ILIKE CONCAT(:keyword, '%')
               OR name ILIKE CONCAT('%', :keyword, '%')
               OR name % :keyword
            ORDER BY similarity(name, :keyword) DESC, name
            LIMIT :limit
            """, nativeQuery = true)
    List<UserAutocompleteDTO> autocompleteNames(@Param("keyword") String keyword,
            @Param("limit") int limit);
}
