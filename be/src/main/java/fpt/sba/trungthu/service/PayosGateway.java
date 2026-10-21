package fpt.sba.trungthu.service;

import tools.jackson.databind.JsonNode;

import java.time.Instant;

/** External payOS boundary. Each platform order uses its own payOS order code. */
public interface PayosGateway {
    record Channel(String clientId, String apiKey, String checksumKey) {}
    record Link(long orderCode, long amount, String paymentLinkId, String checkoutUrl, String qrCode) {}

    Link create(Channel channel, long orderCode, long amount, String description, Instant expiresAt);

    Link recover(Channel channel, long orderCode, long amount);

    void cancel(Channel channel, long orderCode);

    void confirmWebhook(Channel channel, String webhookUrl);

    boolean verifyWebhook(Channel channel, JsonNode data, String signature);
}
