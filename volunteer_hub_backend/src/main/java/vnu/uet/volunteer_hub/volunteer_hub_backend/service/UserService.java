package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.RegistrationRequest;

public interface UserService {
    void registerUser(RegistrationRequest registrationRequest);

    boolean existsByEmail(String email);

    void updatePassword(String email, String newPassword);
}
