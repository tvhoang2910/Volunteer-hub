package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import vnu.uet.volunteer_hub.volunteer_hub_backend.service.EmailService;

@Service
public class EmailServiceImpl implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String frontendUrl;
    private final String mailUsername;

    public EmailServiceImpl(JavaMailSender mailSender,
            @Value("${app.frontend.url:http://localhost:3000}") String frontendUrl,
            @Value("${spring.mail.username}") String mailUsername) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
        this.mailUsername = mailUsername;
    }

    /**
     * Send reset password link (async). Uses a generic body and hides whether the
     * email exists.
     */
    @Async
    @Override
    public void sendPasswordResetEmail(String to, String token, long expiresInMinutes) {
        try {
            logger.info("Preparing password reset email for {}", to);

            String resetLink = frontendUrl + "/reset-password?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername);
            message.setTo(to);
            message.setSubject("Dat lai mat khau - Volunteer Hub");
            message.setText(buildPasswordResetEmailBody(resetLink, expiresInMinutes));

            mailSender.send(message);

            logger.info("Password reset email sent to {}", to);

        } catch (MailException e) {
            logger.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error sending password reset email to {}: {}", to, e.getMessage(), e);
        }
    }

    private String buildPasswordResetEmailBody(String resetLink, long expiresInMinutes) {
        return """
                Xin chao,

                Ban da yeu cau dat lai mat khau cho tai khoan Volunteer Hub.

                Vui long click vao link duoi day de dat lai mat khau:
                %s

                Link nay se het han sau %d phut.

                Neu ban khong yeu cau dat lai, vui long bo qua email nay.

                Tran trong,
                Volunteer Hub Team
                """.formatted(resetLink, expiresInMinutes);
    }

    /**
     * Deprecated: send plain recovery code (kept for backward compatibility).
     */
    @Deprecated
    @Override
    public void sendRecoveryCode(String to, String code) {
        try {
            logger.info("Preparing legacy recovery code email for {}", to);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername);
            message.setTo(to);
            message.setSubject("Ma khoi phuc mat khau");
            message.setText("Ma khoi phuc cua ban la: " + code);

            mailSender.send(message);

            logger.info("Legacy recovery code email sent to {}", to);

        } catch (MailException e) {
            logger.error("Failed to send recovery code to {}: {}", to, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error sending recovery code to {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Khong the gui email: " + e.getMessage(), e);
        }
    }
}
