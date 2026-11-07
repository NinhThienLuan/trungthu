package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.dto.response.AdminDashboardResponse;
import fpt.sba.trungthu.dto.response.AdminDashboardResponse.RecentComplaintItem;
import fpt.sba.trungthu.dto.response.AdminDashboardResponse.RecentKycDocItem;
import fpt.sba.trungthu.dto.response.AdminDashboardResponse.RecentSubscriptionItem;
import fpt.sba.trungthu.entity.enumeration.BulkRequestStatus;
import fpt.sba.trungthu.entity.enumeration.ComplaintStatus;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.SubscriptionStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.BulkRequestRepository;
import fpt.sba.trungthu.repository.ComplaintRepository;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.StoreComplianceDocRepository;
import fpt.sba.trungthu.repository.SubscriptionRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private static final Set<OrderStatus> SOLD_STATUSES = EnumSet.of(
            OrderStatus.DEPOSITED,
            OrderStatus.BAKING_QUEUED,
            OrderStatus.DELIVERING,
            OrderStatus.COMPLETED
    );

    private static final Set<ComplaintStatus> PENDING_COMPLAINT_STATUSES = EnumSet.of(
            ComplaintStatus.OPEN,
            ComplaintStatus.IN_PROGRESS
    );

    private static final Set<BulkRequestStatus> OPEN_RFQ_STATUSES = EnumSet.of(
            BulkRequestStatus.NEW,
            BulkRequestStatus.DISTRIBUTED,
            BulkRequestStatus.QUOTES_RECEIVED
    );

    private final UserRepository userRepository;
    private final StoreComplianceDocRepository complianceDocRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ComplaintRepository complaintRepository;
    private final BulkRequestRepository bulkRequestRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        log.info("Generating platform admin dashboard data");
        try {
            // 1. User & Provider metrics
            long totalProviders = userRepository.countByRole(UserRole.PROVIDER);
            long approvedProviders = userRepository.countByRoleAndIsComplianceApproved(UserRole.PROVIDER, true);
            long activeSeasonProviders = userRepository.countByRoleAndIsSeasonActive(UserRole.PROVIDER, true);
            long totalCustomers = userRepository.countByRole(UserRole.CUSTOMER);

            // 2. Action queues
            long pendingKycDocs = complianceDocRepository.countByVerificationStatus(ComplianceDocStatus.PENDING);
            long pendingSubscriptions = subscriptionRepository.countByStatus(SubscriptionStatus.PENDING_PAYMENT);
            long pendingComplaints = complaintRepository.countByStatusIn(PENDING_COMPLAINT_STATUSES);
            long openRfqs = bulkRequestRepository.countByStatusIn(OPEN_RFQ_STATUSES);

            // 3. SaaS Revenue & GMV
            BigDecimal totalSaasRevenue = subscriptionRepository.sumPriceByStatus(SubscriptionStatus.ACTIVE);
            if (totalSaasRevenue == null) {
                totalSaasRevenue = BigDecimal.ZERO;
            }

            BigDecimal totalGmv = orderRepository.sumTotalAmountByOrderStatusIn(SOLD_STATUSES);
            if (totalGmv == null) {
                totalGmv = BigDecimal.ZERO;
            }

            long totalOrders = orderRepository.count();

            // 4. Orders by status
            Map<String, Long> ordersByStatus = new LinkedHashMap<>();
            for (OrderStatus status : OrderStatus.values()) {
                long count = orderRepository.countByOrderStatus(status);
                ordersByStatus.put(status.name(), count);
            }

            // 5. Recent pending items (top 5 each)
            List<RecentSubscriptionItem> recentSubscriptions = subscriptionRepository
                    .findByStatusOrderByCreatedAtDesc(SubscriptionStatus.PENDING_PAYMENT)
                    .stream()
                    .limit(5)
                    .map(s -> RecentSubscriptionItem.builder()
                            .id(s.getId())
                            .providerEmail(s.getProvider().getEmail())
                            .providerName(s.getProvider().getFullName())
                            .planName(s.getPlanName())
                            .price(s.getPrice())
                            .paymentNote(s.getPaymentNote())
                            .createdAt(s.getCreatedAt())
                            .build())
                    .toList();

            List<RecentKycDocItem> recentKycDocs = complianceDocRepository
                    .findByVerificationStatusOrderBySubmittedAtAsc(ComplianceDocStatus.PENDING)
                    .stream()
                    .limit(5)
                    .map(d -> RecentKycDocItem.builder()
                            .id(d.getId())
                            .providerEmail(d.getProvider().getEmail())
                            .providerName(d.getProvider().getFullName())
                            .documentType(d.getDocumentType())
                            .submittedAt(d.getSubmittedAt())
                            .build())
                    .toList();

            List<RecentComplaintItem> recentComplaints = complaintRepository
                    .findAllByOrderByCreatedAtDesc()
                    .stream()
                    .filter(c -> PENDING_COMPLAINT_STATUSES.contains(c.getStatus()))
                    .limit(5)
                    .map(c -> RecentComplaintItem.builder()
                            .id(c.getId())
                            .orderCode(c.getOrder().getOrderCode())
                            .providerName(c.getProvider().getFullName())
                            .complaintType(c.getComplaintType())
                            .subject(c.getSubject())
                            .status(c.getStatus())
                            .createdAt(c.getCreatedAt())
                            .build())
                    .toList();

            return AdminDashboardResponse.builder()
                    .totalProviders(totalProviders)
                    .approvedProviders(approvedProviders)
                    .activeSeasonProviders(activeSeasonProviders)
                    .totalCustomers(totalCustomers)
                    .totalOrders(totalOrders)
                    .totalGmv(totalGmv)
                    .totalSaasRevenue(totalSaasRevenue)
                    .pendingKycDocs(pendingKycDocs)
                    .pendingSubscriptions(pendingSubscriptions)
                    .pendingComplaints(pendingComplaints)
                    .openRfqs(openRfqs)
                    .ordersByStatus(ordersByStatus)
                    .recentSubscriptions(recentSubscriptions)
                    .recentKycDocs(recentKycDocs)
                    .recentComplaints(recentComplaints)
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate admin dashboard", e);
            throw e;
        } finally {
            log.debug("Finished getDashboard process");
        }
    }
}
