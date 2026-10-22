package fpt.sba.trungthu.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class VariantStatsResponse {
    private long inbound;
    private long looseOnHand;
    private long inSet;
    private long onHand;
    private long broken;
    private long expired;
    private long terminateClear;
    private long sold;
    private long awaitingPayment;
    private long cancelled;
    private long discrepancy;
}
