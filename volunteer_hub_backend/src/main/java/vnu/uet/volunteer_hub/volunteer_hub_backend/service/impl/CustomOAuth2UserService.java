package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RoleRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomOAuth2UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // Trường hợp Google trả email trong mảng "emails"
        if (email == null) {
            Object emailsAttr = oAuth2User.getAttribute("emails");
            if (emailsAttr instanceof java.util.List<?> emailsList && !emailsList.isEmpty()) {
                Object item = emailsList.get(0);
                if (item instanceof Map<?, ?> emailMap) {
                    Object value = emailMap.get("value");
                    if (value instanceof String s) {
                        email = s;
                    }
                }
            }
        }

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        // Tìm user trong DB
        User user = userRepository.findByEmailIgnoreCaseWithRoleOptional(email).orElse(null);

        if (user == null) {
            // Chưa có thì tạo mới
            user = new User();
            user.setEmail(email);
            user.setName((name != null && !name.isBlank()) ? name : email);
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setIsActive(Boolean.TRUE);

            Role volunteerRole = roleRepository.findByRoleName("VOLUNTEER")
                    .orElseThrow(() -> new IllegalStateException("Default role VOLUNTEER not found"));
            user.getRoles().add(volunteerRole);

            userRepository.save(user);
        } else if (user.getRoles() == null || user.getRoles().isEmpty()) {
            // Có user nhưng chưa có role
            Role volunteerRole = roleRepository.findByRoleName("VOLUNTEER")
                    .orElseThrow(() -> new IllegalStateException("Default role VOLUNTEER not found"));
            user.getRoles().add(volunteerRole);
            userRepository.save(user);
        }

        final User finalUser = user;
        final String finalEmail = email;

        // Trả về OAuth2User custom, getName() = email (rất quan trọng)
        return new OAuth2User() {
            @Override
            public <A> A getAttribute(String name) {
                return oAuth2User.getAttribute(name);
            }

            @Override
            public Map<String, Object> getAttributes() {
                return oAuth2User.getAttributes();
            }

            @Override
            public Collection<? extends GrantedAuthority> getAuthorities() {
                return oAuth2User.getAuthorities();
            }

            @Override
            public String getName() {
                // ⭐ RẤT QUAN TRỌNG: authentication.getName() = email
                return finalEmail;
            }
        };
    }
}
