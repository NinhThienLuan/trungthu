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
            @NotEmpty List<@NotNull @Valid ItemSnapshot> items) {}

    public record ItemSnapshot(
            @NotNull UUID variantId,
            @NotBlank @Size(max = 255) String productName,
            @NotBlank @Size(max = 255) String variantName,
            @Positive int quantity,
            @NotNull @DecimalMin("0") @Digits(integer = 16, fraction = 2) BigDecimal unitPrice,
            @PositiveOrZero int bakeQuantity) {}

    public record VatInfo(
            @NotBlank @Size(max = 255) String companyName,
            @NotBlank @Size(max = 50) String taxCode,
            @NotBlank @Size(max = 100000) String companyAddress,
            @NotBlank @Email @Size(max = 254) String invoiceEmail) {}
}
