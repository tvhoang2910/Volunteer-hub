package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service để gửi email notifications.
 * Các method gửi email được đánh dấu @Async để không block request thread.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /**
     * Gửi email chứa link khôi phục mật khẩu (asynchronous).
     * 
     * @param to    email người nhận
     * @param token secure token để reset password
     */
    @Async
    public void sendPasswordResetEmail(String to, String token) {
        try {
            logger.info("Đang chuẩn bị gửi email khôi phục mật khẩu đến: {}", to);

            String resetLink = frontendUrl + "/reset-password?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Khôi phục mật khẩu - Volunteer Hub");
            message.setText(buildPasswordResetEmailBody(resetLink));

            mailSender.send(message);

            logger.info("✅ Đã gửi thành công email khôi phục mật khẩu đến: {}", to);

        } catch (MailException e) {
            logger.error("❌ Lỗi khi gửi email đến {}: {}", to, e.getMessage(), e);
            // Không throw exception vì method này là async - log error là đủ
        } catch (Exception e) {
            logger.error("❌ Lỗi không mong muốn khi gửi email đến {}: {}", to, e.getMessage(), e);
        }
    }

    /**
     * Build email body cho password reset (có thể chuyển sang HTML template sau).
     */
    private String buildPasswordResetEmailBody(String resetLink) {
        return """
                Xin chào,

                Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản Volunteer Hub của mình.

                Vui lòng click vào link bên dưới để đặt lại mật khẩu:
                %s

                Link này sẽ hết hạn sau 15 phút.

                Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.

                Trân trọng,
                Volunteer Hub Team
                """.formatted(resetLink);
    }

    /**
     * DEPRECATED: Phương thức cũ gửi mã số (giữ lại để tương thích ngược).
     * Khuyến nghị dùng sendPasswordResetEmail() thay thế.
     */
    @Deprecated
    public void sendRecoveryCode(String to, String code) {
        try {
            logger.info("Đang chuẩn bị gửi email khôi phục mật khẩu đến: {}", to);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Mã khôi phục mật khẩu");
            message.setText("Mã khôi phục của bạn là: " + code);

            mailSender.send(message);

            logger.info("✅ Đã gửi thành công email khôi phục mật khẩu đến: {}", to);

        } catch (MailException e) {
            logger.error("❌ Lỗi khi gửi email đến {}: {}", to, e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            logger.error("❌ Lỗi không mong muốn khi gửi email đến {}: {}", to, e.getMessage(), e);
            throw new RuntimeException("Không thể gửi email: " + e.getMessage(), e);
        }
    }
}