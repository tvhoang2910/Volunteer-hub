package vnu.uet.volunteer_hub.volunteer_hub_backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RoleRepository;

@Component
@RequiredArgsConstructor
public class DataInitializer {
    private final RoleRepository roleRepository;

    @PostConstruct
    public void init() {
        createRoleIfNotExists("VOLUNTEER", "Tình nguyện viên");
        createRoleIfNotExists("MANAGER", "Quản lý sự kiện");
        createRoleIfNotExists("ADMIN", "Quản trị viên");
    }

    private void createRoleIfNotExists(String roleName, String description) {
        if (roleRepository.findByRoleName(roleName).isEmpty()) {
            Role role = new Role();
            role.setRoleName(roleName);
            role.setDescription(description);
            roleRepository.save(role);
        }
    }
}
