package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.BulkRequestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RfqResponse(UUID id, String code, String companyName, String taxCode,
        String contactName, String contactPosition, String contactPhone, String contactEmail,
        int requestedQuantity, LocalDate expectedDeliveryDate, BigDecimal expectedBudget,
        String description, String logoUrl, BulkRequestStatus status) {}
