package fpt.sba.trungthu.common.policy;

import java.time.LocalDate;

public final class CheckoutLeadTime {
    public static final int STANDARD_DAYS = 3;
    public static final int BULK_QUANTITY = 20;
    public static final int EXTENDED_DAYS = 7;

    private CheckoutLeadTime() {}

    public static int requiredDays(long quantity) {
        return quantity >= BULK_QUANTITY ? EXTENDED_DAYS : STANDARD_DAYS;
    }

    public static boolean canBakeToOrder(LocalDate deliveryDate, LocalDate today) {
        return !deliveryDate.isBefore(today.plusDays(EXTENDED_DAYS));
    }
}
