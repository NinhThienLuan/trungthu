package fpt.sba.trungthu.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ReservedLineResponse(
        UUID variantId,
        UUID providerId,
        String productName,
        String variantName,
        BigDecimal unitPrice,
        int quantity,
        int bakeQuantity,
        UUID capacityId,
        LocalDate bakeDate,
        UUID sourceSetId,
        BigDecimal listUnitPrice,
        int directUnits) {

    public ReservedLineResponse(UUID variantId, UUID providerId, String productName, String variantName,
            BigDecimal unitPrice, int quantity, int bakeQuantity, UUID capacityId, LocalDate bakeDate) {
        this(variantId, providerId, productName, variantName, unitPrice, quantity, bakeQuantity, capacityId, bakeDate,
                null, unitPrice, 0);
    }

    public ReservedLineResponse(UUID variantId, UUID providerId, String productName, String variantName,
            BigDecimal unitPrice, int quantity, int bakeQuantity, UUID capacityId, LocalDate bakeDate,
            UUID sourceSetId) {
        this(variantId, providerId, productName, variantName, unitPrice, quantity, bakeQuantity, capacityId, bakeDate,
                sourceSetId, unitPrice, 0);
    }
}
