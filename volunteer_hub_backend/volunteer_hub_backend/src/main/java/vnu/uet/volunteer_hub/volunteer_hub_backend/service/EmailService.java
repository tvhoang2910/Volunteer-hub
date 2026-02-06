package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

public interface EmailService {

    void sendPasswordResetEmail(String to, String token);

    void sendRecoveryCode(String to, String code);
}