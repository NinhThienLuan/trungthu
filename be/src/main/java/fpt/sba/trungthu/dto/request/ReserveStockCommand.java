package fpt.sba.trungthu.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ReserveStockCommand(List<ReserveLine> lines) {

    public record ReserveLine(UUID variantId, int quantity, LocalDate deliveryDate, UUID setProductId) {
        public ReserveLine(UUID variantId, int quantity, LocalDate deliveryDate) {
            this(variantId, quantity, deliveryDate, null);
        }
    }
}
