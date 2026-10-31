package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubmitQuoteRequest(
        @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 16, fraction = 2) BigDecimal unitPrice,
        @NotNull @Positive Integer offeredQuantity,
        @NotNull @FutureOrPresent LocalDate estimatedDeliveryDate,
        @NotNull @FutureOrPresent LocalDate validUntil,
        @Size(max = 2000) String note) {}
