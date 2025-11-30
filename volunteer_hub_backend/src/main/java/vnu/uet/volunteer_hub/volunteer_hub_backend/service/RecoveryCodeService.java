package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

public interface RecoveryCodeService {
    void storeRecoveryCode(String email, String token);

    String isValidRecoveryCode(String inputToken);

    void invalidateByEmail(String email);

    void invalidateByToken(String token);
}
