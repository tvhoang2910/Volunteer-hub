package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Role;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmailIgnoreCaseWithRoleOptional(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        if (user.getEmail() == null || user.getPassword() == null) {
            throw new IllegalStateException("User data incomplete: email or password is null");
        }

        Set<GrantedAuthority> authorities = user.getRoles() == null
                ? Set.of()
                : user.getRoles().stream()
                        .filter(Objects::nonNull)
                        .map(Role::getRoleName)
                        .filter(Objects::nonNull)
                        .map(name -> new SimpleGrantedAuthority("ROLE_" + name))
                        .collect(Collectors.toSet());

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(authorities)
                .disabled(!Boolean.TRUE.equals(user.getIsActive()))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .build();
    }
}