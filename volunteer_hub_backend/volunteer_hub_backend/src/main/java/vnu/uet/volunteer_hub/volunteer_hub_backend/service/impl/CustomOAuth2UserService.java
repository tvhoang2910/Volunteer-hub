package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.Collection;
import java.util.Map;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RoleRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        if (email == null)
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");

        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(name);

            Role volunteerRole = roleRepository.findByRoleName("VOLUNTEER")
                    .orElseThrow(() -> new IllegalStateException("Default role VOLUNTEER not found"));
            // Merge the role to ensure it's managed in the current session
            volunteerRole = entityManager.merge(volunteerRole);
            user.getRoles().add(volunteerRole);
            userRepository.save(user);

        }
        final User finalUser = user;
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
                return finalUser.getEmail();
            }
        };
    }
}