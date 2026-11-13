package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateRfqRequest(
        @Size(max = 255) String companyName,
        @Size(max = 50) String taxCode,
        @NotBlank @Size(max = 255) String contactName,
        @Size(max = 255) String contactPosition,
        @NotBlank @Size(max = 20) @Pattern(regexp = VnFormats.PHONE, message = VnFormats.PHONE_MESSAGE) String contactPhone,
        @NotBlank @Email @Size(max = 254) String contactEmail,
        @NotNull @Min(20) Integer requestedQuantity,
        @Min(1) @Max(100) Integer cakesPerBox,
        @NotNull LocalDate expectedDeliveryDate,
        @DecimalMin("0") @Digits(integer = 16, fraction = 2) BigDecimal expectedBudget,
        @Size(max = 100000) String description,
        @Size(max = 2048) String logoUrl,
        // Tuỳ chọn: gửi riêng một xưởng / báo giá cho một sản phẩm (sản phẩm kéo theo xưởng của nó)
        UUID providerId,
        UUID productId,
        String customerType) {

    public CreateRfqRequest(String companyName, String taxCode, String contactName, String contactPosition,
            String contactPhone, String contactEmail, Integer requestedQuantity, Integer cakesPerBox,
            LocalDate expectedDeliveryDate, BigDecimal expectedBudget, String description, String logoUrl,
            UUID providerId, UUID productId) {
        this(companyName, taxCode, contactName, contactPosition, contactPhone, contactEmail,
                requestedQuantity, cakesPerBox, expectedDeliveryDate, expectedBudget, description, logoUrl, providerId, productId, null);
    }

    public CreateRfqRequest(String companyName, String taxCode, String contactName, String contactPosition,
            String contactPhone, String contactEmail, Integer requestedQuantity, LocalDate expectedDeliveryDate,
            BigDecimal expectedBudget, String description, String logoUrl, UUID providerId, UUID productId) {
        this(companyName, taxCode, contactName, contactPosition, contactPhone, contactEmail,
                requestedQuantity, 1, expectedDeliveryDate, expectedBudget, description, logoUrl, providerId, productId, null);
    }
}
