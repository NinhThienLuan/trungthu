package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BulkDeliveryRequest(
        @NotBlank @Size(max = 255) String recipientName,
        @NotBlank @Size(max = 20) String recipientPhone,
        @NotBlank @Size(max = 1000) String deliveryAddress) {}
