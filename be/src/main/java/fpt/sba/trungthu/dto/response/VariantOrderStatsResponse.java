package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.OrderStatus;

import java.util.List;
import java.util.Map;

public record VariantOrderStatsResponse(
        long placedToday,
        long soldToday,
        long cancelledToday,
        Map<OrderStatus, Long> todayByStatus,
        List<Period> series) {

    public record Period(String label, Map<OrderStatus, Long> counts) {
    }
}
