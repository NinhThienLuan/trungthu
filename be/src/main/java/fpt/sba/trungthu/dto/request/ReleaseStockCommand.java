package fpt.sba.trungthu.dto.request;

import java.util.List;
import java.util.UUID;

public record ReleaseStockCommand(List<ReleaseLine> lines) {

    public record ReleaseLine(UUID variantId, int quantity, UUID capacityId, int bakeQuantity, UUID sourceSetId,
            int directUnits, int stockReservedQuantity) {
        public ReleaseLine(UUID variantId, int quantity, UUID capacityId, int bakeQuantity) {
            this(variantId, quantity, capacityId, bakeQuantity, null, 0, quantity);
        }

        public ReleaseLine(UUID variantId, int quantity, UUID capacityId, int bakeQuantity, UUID sourceSetId) {
            this(variantId, quantity, capacityId, bakeQuantity, sourceSetId, 0, quantity);
        }

        public ReleaseLine(UUID variantId, int quantity, UUID capacityId, int bakeQuantity, UUID sourceSetId,
                int directUnits) {
            this(variantId, quantity, capacityId, bakeQuantity, sourceSetId, directUnits, quantity);
        }
    }
}
