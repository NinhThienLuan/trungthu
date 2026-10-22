package fpt.sba.trungthu.dto.response;

import java.util.List;
import java.util.UUID;

public record ProviderDashboardResponse(
        long totalOrders,
        long soldOrders,
        long cancelledOrders,
        long pendingOrders,
        java.math.BigDecimal listRevenue,
        java.math.BigDecimal discountTotal,
        java.math.BigDecimal revenue,
        List<VariantRank> variants,
        List<CustomerRank> topBuyers,
        List<CustomerRank> topCancellers) {

    public record VariantRank(UUID variantId, String productName, String variantName,
            long soldQuantity, long cancelledQuantity, long soldOrders, long cancelledOrders) {
    }

    public record CustomerRank(UUID customerId, String fullName, String email, long quantity, long orders) {
    }
}
