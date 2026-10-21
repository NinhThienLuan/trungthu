package fpt.sba.trungthu.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PayosPaymentResponse(UUID orderId, long payosOrderCode, BigDecimal amount,
        String paymentLinkId, String checkoutUrl, String qrCode, Instant expiresAt) {}
