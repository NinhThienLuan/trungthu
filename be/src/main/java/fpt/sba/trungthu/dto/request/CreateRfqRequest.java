package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateRfqRequest(
        @NotBlank @Size(min = 3, max = 255) String companyName,
        @NotBlank @Pattern(regexp = VnFormats.TAX_CODE, message = VnFormats.TAX_CODE_MESSAGE) String taxCode,
        @NotBlank @Size(max = 255) String contactName,
        @NotBlank @Size(max = 255) String contactPosition,
        @NotBlank @Pattern(regexp = VnFormats.PHONE, message = VnFormats.PHONE_MESSAGE) String contactPhone,
        @NotBlank @Email @Size(max = 254) String contactEmail,
        @NotNull @Min(20) Integer requestedQuantity,
        @NotNull LocalDate expectedDeliveryDate,
        @DecimalMin("0") BigDecimal expectedBudget,
        @Size(max = 100000) String description,
        @Size(max = 2048) String logoUrl) {}
