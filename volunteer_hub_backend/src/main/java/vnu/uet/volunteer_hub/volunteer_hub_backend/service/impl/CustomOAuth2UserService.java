package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.Collection;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
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

    public CustomOAuth2UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
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