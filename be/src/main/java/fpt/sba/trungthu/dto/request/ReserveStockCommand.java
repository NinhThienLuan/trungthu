package fpt.sba.trungthu.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ReserveStockCommand(List<ReserveLine> lines) {

    public record ReserveLine(UUID variantId, int quantity, LocalDate deliveryDate, UUID setProductId,
            boolean futureBake) {
        public ReserveLine(UUID variantId, int quantity, LocalDate deliveryDate) {
            this(variantId, quantity, deliveryDate, null, false);
        }

        public ReserveLine(UUID variantId, int quantity, LocalDate deliveryDate, UUID setProductId) {
            this(variantId, quantity, deliveryDate, setProductId, false);
        }
    }
}
