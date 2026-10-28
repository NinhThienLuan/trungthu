package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.entity.enumeration.QuoteStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record QuoteResponse(UUID id, UUID requestId, UUID providerId, String providerName,
        BigDecimal unitPrice, int offeredQuantity, LocalDate estimatedDeliveryDate,
        LocalDate validUntil, String note, QuoteStatus status, LocalDateTime createdAt) {}
