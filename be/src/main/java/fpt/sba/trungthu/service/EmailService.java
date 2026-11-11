package fpt.sba.trungthu.service;

/**
 * Service gửi email notification cho BE1 (Compliance & Subscription)
 * Sử dụng JavaMailSender đã configured trong application.properties
 */
public interface EmailService {
    
    /**
     * Gửi email thông báo khi admin duyệt compliance document
     */
    void sendComplianceApprovedEmail(String providerEmail, String documentType);
    
    /**
     * Gửi email thông báo khi admin từ chối compliance document
     */
    void sendComplianceRejectedEmail(String providerEmail, String documentType, String reason);
    
    /**
     * Gửi email thông báo khi provider đạt compliance đầy đủ (3 loại giấy tờ approved)
     */
    void sendComplianceFullyApprovedEmail(String providerEmail);
    
    /**
     * Gửi email thông báo khi admin kích hoạt subscription
     */
    void sendSubscriptionActivatedEmail(String providerEmail, String planName, String endDate);
    
    /**
     * Gửi email thông báo admin khi có compliance document mới
     */
    void sendNewComplianceDocumentToAdmin(String adminEmail, String providerEmail, String documentType);
    
    /**
     * Gửi email thông báo admin khi có subscription request mới
     */
    void sendNewSubscriptionRequestToAdmin(String adminEmail, String providerEmail, String planName);
}
