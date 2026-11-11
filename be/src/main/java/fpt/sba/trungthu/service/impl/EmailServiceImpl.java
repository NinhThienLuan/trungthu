package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Implementation sử dụng JavaMailSender đã configured (Gmail SMTP)
 * @Async để không block request khi gửi email
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${spring.mail.from-name:Trung Thu Admin}")
    private String fromName;
    
    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    @Override
    @Async
    public void sendComplianceApprovedEmail(String providerEmail, String documentType) {
        try {
            String subject = "✅ Giấy tờ " + getDocumentTypeName(documentType) + " đã được duyệt";
            String body = String.format("""
                <h2>Chào bạn,</h2>
                <p>Giấy tờ <b>%s</b> của bạn đã được admin sàn duyệt thành công.</p>
                <p>Bạn có thể xem chi tiết tại: <a href="%s/seller/profile">%s/seller/profile</a></p>
                <br>
                <p>Trân trọng,<br>Đội ngũ Trung Thu</p>
                """, getDocumentTypeName(documentType), baseUrl, baseUrl);
            
            sendHtmlEmail(providerEmail, subject, body);
            log.info("Sent compliance approved email to {} for {}", providerEmail, documentType);
        } catch (Exception e) {
            log.error("Failed to send compliance approved email to {}", providerEmail, e);
        }
    }

    @Override
    @Async
    public void sendComplianceRejectedEmail(String providerEmail, String documentType, String reason) {
        try {
            String subject = "❌ Giấy tờ " + getDocumentTypeName(documentType) + " bị từ chối";
            String body = String.format("""
                <h2>Chào bạn,</h2>
                <p>Giấy tờ <b>%s</b> của bạn đã bị từ chối bởi admin.</p>
                <p><b>Lý do:</b> %s</p>
                <p>Vui lòng nộp lại giấy tờ hợp lệ tại: <a href="%s/seller/profile">%s/seller/profile</a></p>
                <br>
                <p>Trân trọng,<br>Đội ngũ Trung Thu</p>
                """, getDocumentTypeName(documentType), reason, baseUrl, baseUrl);
            
            sendHtmlEmail(providerEmail, subject, body);
            log.info("Sent compliance rejected email to {} for {}", providerEmail, documentType);
        } catch (Exception e) {
            log.error("Failed to send compliance rejected email to {}", providerEmail, e);
        }
    }

    @Override
    @Async
    public void sendComplianceFullyApprovedEmail(String providerEmail) {
        try {
            String subject = "🎉 Hồ sơ thẩm định đã hoàn tất";
            String body = String.format("""
                <h2>Chúc mừng!</h2>
                <p>Tất cả giấy tờ thẩm định của bạn đã được duyệt đầy đủ.</p>
                <p>Bạn có thể bắt đầu đăng bán sản phẩm sau khi:</p>
                <ul>
                    <li>✅ Đăng ký gói bán hàng</li>
                    <li>✅ Admin kích hoạt gói</li>
                </ul>
                <p>Xem gói bán hàng tại: <a href="%s/seller/subscription">%s/seller/subscription</a></p>
                <br>
                <p>Trân trọng,<br>Đội ngũ Trung Thu</p>
                """, baseUrl, baseUrl);
            
            sendHtmlEmail(providerEmail, subject, body);
            log.info("Sent compliance fully approved email to {}", providerEmail);
        } catch (Exception e) {
            log.error("Failed to send compliance fully approved email to {}", providerEmail, e);
        }
    }

    @Override
    @Async
    public void sendSubscriptionActivatedEmail(String providerEmail, String planName, String endDate) {
        try {
            String subject = "✅ Gói bán hàng " + planName + " đã được kích hoạt";
            String body = String.format("""
                <h2>Chào bạn,</h2>
                <p>Gói bán hàng <b>%s</b> của bạn đã được kích hoạt thành công.</p>
                <p><b>Hiệu lực đến:</b> %s</p>
                <p>Bạn có thể bắt đầu đăng bán sản phẩm tại: <a href="%s/seller/products">%s/seller/products</a></p>
                <br>
                <p>Trân trọng,<br>Đội ngũ Trung Thu</p>
                """, planName, endDate, baseUrl, baseUrl);
            
            sendHtmlEmail(providerEmail, subject, body);
            log.info("Sent subscription activated email to {} for plan {}", providerEmail, planName);
        } catch (Exception e) {
            log.error("Failed to send subscription activated email to {}", providerEmail, e);
        }
    }

    @Override
    @Async
    public void sendNewComplianceDocumentToAdmin(String adminEmail, String providerEmail, String documentType) {
        try {
            String subject = "🔔 Giấy tờ mới từ seller: " + providerEmail;
            String body = String.format("""
                <h2>Thông báo Admin</h2>
                <p>Seller <b>%s</b> vừa nộp giấy tờ <b>%s</b>.</p>
                <p>Vui lòng kiểm tra và duyệt tại: <a href="%s/admin/compliance">%s/admin/compliance</a></p>
                <br>
                <p>Hệ thống Trung Thu</p>
                """, providerEmail, getDocumentTypeName(documentType), baseUrl, baseUrl);
            
            sendHtmlEmail(adminEmail, subject, body);
            log.info("Sent new compliance document notification to admin {} for provider {}", adminEmail, providerEmail);
        } catch (Exception e) {
            log.error("Failed to send new compliance document notification to admin", e);
        }
    }

    @Override
    @Async
    public void sendNewSubscriptionRequestToAdmin(String adminEmail, String providerEmail, String planName) {
        try {
            String subject = "🔔 Yêu cầu gói mới từ seller: " + providerEmail;
            String body = String.format("""
                <h2>Thông báo Admin</h2>
                <p>Seller <b>%s</b> vừa đăng ký gói <b>%s</b>.</p>
                <p>Vui lòng kiểm tra thanh toán và kích hoạt tại: <a href="%s/admin/subscriptions">%s/admin/subscriptions</a></p>
                <br>
                <p>Hệ thống Trung Thu</p>
                """, providerEmail, planName, baseUrl, baseUrl);
            
            sendHtmlEmail(adminEmail, subject, body);
            log.info("Sent new subscription request notification to admin {} for provider {}", adminEmail, providerEmail);
        } catch (Exception e) {
            log.error("Failed to send new subscription request notification to admin", e);
        }
    }

    /**
     * Helper method gửi HTML email
     */
    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML
            
            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to create/send email to {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Map document type enum sang tên tiếng Việt
     */
    private String getDocumentTypeName(String documentType) {
        return switch (documentType) {
            case "FOOD_SAFETY_CERT" -> "Giấy chứng nhận ATTP";
            case "BUSINESS_LICENSE" -> "Giấy phép kinh doanh";
            case "IDENTITY_KYC" -> "CCCD / Hộ chiếu";
            default -> documentType;
        };
    }
}
