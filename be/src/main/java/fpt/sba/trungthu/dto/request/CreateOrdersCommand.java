package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Internal snapshots supplied by CheckoutService, never bound to an HTTP request. */
public record CreateOrdersCommand(
        @NotNull UUID checkoutId,
        @NotNull UUID customerId,
        @NotNull Instant orderedAt,
        @NotBlank @Size(max = 255) String receiverName,
        @NotBlank @Size(max = 20) String receiverPhone,
        @NotBlank @Size(max = 100000) String shippingAddress,
        @Valid VatInfo vat,
        @NotEmpty List<@NotNull @Valid ProviderOrder> groups) {

    public record ProviderOrder(
            @NotNull UUID providerId,
            @NotNull LocalDate deliveryDate,
            UUID capacityId,
            @NotNull @DecimalMin("0") @Digits(integer = 16, fraction = 2) BigDecimal shippingFee,
            @NotNull @DecimalMin("0") @Digits(integer = 16, fraction = 2) BigDecimal depositAmount,
            @NotNull PaymentMethod paymentMethod,
            Instant holdExpiresAt,
            @DecimalMin("0") @Digits(integer = 16, fraction = 2) BigDecimal listAmount,
            @DecimalMin("0") @Digits(integer = 16, fraction = 2) BigDecimal discountAmount,
            @NotEmpty List<@NotNull @Valid ItemSnapshot> items) {

        public ProviderOrder(UUID providerId, LocalDate deliveryDate, UUID capacityId, BigDecimal shippingFee,
                BigDecimal depositAmount, PaymentMethod paymentMethod, Instant holdExpiresAt,
                List<ItemSnapshot> items) {
            this(providerId, deliveryDate, capacityId, shippingFee, depositAmount, paymentMethod, holdExpiresAt,
                    null, null, items);
        }
    }

    public record ItemSnapshot(
            @NotNull UUID variantId,
            @NotBlank @Size(max = 255) String productName,
            @NotBlank @Size(max = 255) String variantName,
            @Positive int quantity,
            @NotNull @DecimalMin("0") @Digits(integer = 16, fraction = 2) BigDecimal unitPrice,
            @PositiveOrZero int bakeQuantity,
            UUID sourceSetId,
            int directUnits,
            @Size(max = 50) String personalizationText,
            @NotNull @DecimalMin("0") BigDecimal personalizationFee) {

        public ItemSnapshot {
            if (personalizationFee == null) {
                personalizationFee = BigDecimal.ZERO;
            }
        }

        public ItemSnapshot(UUID variantId, String productName, String variantName, int quantity, BigDecimal unitPrice,
                int bakeQuantity) {
            this(variantId, productName, variantName, quantity, unitPrice, bakeQuantity, null, 0, null,
                    BigDecimal.ZERO);
        }

        public ItemSnapshot(UUID variantId, String productName, String variantName, int quantity, BigDecimal unitPrice,
                int bakeQuantity, UUID sourceSetId) {
            this(variantId, productName, variantName, quantity, unitPrice, bakeQuantity, sourceSetId, 0, null,
                    BigDecimal.ZERO);
        }

        public ItemSnapshot(UUID variantId, String productName, String variantName, int quantity, BigDecimal unitPrice,
                int bakeQuantity, UUID sourceSetId, int directUnits) {
            this(variantId, productName, variantName, quantity, unitPrice, bakeQuantity, sourceSetId, directUnits, null,
                    BigDecimal.ZERO);
        }

        public ItemSnapshot(UUID variantId, String productName, String variantName, int quantity, BigDecimal unitPrice,
                int bakeQuantity, String personalizationText, BigDecimal personalizationFee) {
            this(variantId, productName, variantName, quantity, unitPrice, bakeQuantity, null, 0, personalizationText,
                    personalizationFee);
        }
    }

    public record VatInfo(
            @NotBlank @Size(max = 255) String companyName,
            @NotBlank @Pattern(regexp = VnFormats.TAX_CODE, message = VnFormats.TAX_CODE_MESSAGE) String taxCode,
            @NotBlank @Size(max = 100000) String companyAddress,
            @NotBlank @Email @Size(max = 254) String invoiceEmail) {}
}
