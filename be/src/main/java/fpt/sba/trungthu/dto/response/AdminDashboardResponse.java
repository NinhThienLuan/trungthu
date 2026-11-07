package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.ComplaintStatus;
import fpt.sba.trungthu.entity.enumeration.ComplaintType;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    // KPI Cards
    private long totalProviders;
    private long approvedProviders;
    private long activeSeasonProviders;
    private long totalCustomers;
    private long totalOrders;
    private BigDecimal totalGmv;
    private BigDecimal totalSaasRevenue;

    // Action Queue
    private long pendingKycDocs;
    private long pendingSubscriptions;
    private long pendingComplaints;
    private long openRfqs;

    // Order Distribution
    private Map<String, Long> ordersByStatus;

    // Recent Actions
    private List<RecentSubscriptionItem> recentSubscriptions;
    private List<RecentKycDocItem> recentKycDocs;
    private List<RecentComplaintItem> recentComplaints;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentSubscriptionItem {
        private UUID id;
        private String providerEmail;
        private String providerName;
        private String planName;
        private BigDecimal price;
        private String paymentNote;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentKycDocItem {
        private UUID id;
        private String providerEmail;
        private String providerName;
        private ComplianceDocType documentType;
        private LocalDateTime submittedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentComplaintItem {
        private UUID id;
        private String orderCode;
        private String providerName;
        private ComplaintType complaintType;
        private String subject;
        private ComplaintStatus status;
        private LocalDateTime createdAt;
    }
}
