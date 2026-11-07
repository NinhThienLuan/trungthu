package fpt.sba.trungthu.common.policy;

import java.time.LocalDate;

public final class CheckoutLeadTime {
    /** Bánh có sẵn trong kho: nhận sớm nhất từ ngày mai */
    public static final int READY_DAYS = 1;
    public static final int BULK_QUANTITY = 20;
    public static final int EXTENDED_DAYS = 7;

    private CheckoutLeadTime() {}

    public static int requiredDays(long quantity) {
        return quantity >= BULK_QUANTITY ? EXTENDED_DAYS : READY_DAYS;
    }

    public static boolean canBakeToOrder(LocalDate deliveryDate, LocalDate today) {
        return !deliveryDate.isBefore(today.plusDays(EXTENDED_DAYS));
    }
}
