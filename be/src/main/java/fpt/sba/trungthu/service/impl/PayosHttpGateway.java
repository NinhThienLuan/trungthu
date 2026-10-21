package fpt.sba.trungthu.service.impl;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import fpt.sba.trungthu.service.PayosGateway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;

@Component
public class PayosHttpGateway implements PayosGateway {
    private static final String API = "https://api-merchant.payos.vn/v2/payment-requests";
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    private final ObjectMapper json;
    private final String returnUrl;
    private final String cancelUrl;

    public PayosHttpGateway(ObjectMapper json,
            @Value("${payos.return-url:http://localhost:5173/orders}") String returnUrl,
            @Value("${payos.cancel-url:http://localhost:5173/orders}") String cancelUrl) {
        this.json = json;
        this.returnUrl = returnUrl;
        this.cancelUrl = cancelUrl;
    }

    @Override
    public Link create(Channel channel, long orderCode, long amount, String description, Instant expiresAt) {
        configured(channel);
        try {
            String signed = "amount=" + amount + "&cancelUrl=" + cancelUrl + "&description=" + description
                    + "&orderCode=" + orderCode + "&returnUrl=" + returnUrl;
            Map<String, Object> body = Map.of("orderCode", orderCode, "amount", amount,
                    "description", description, "cancelUrl", cancelUrl, "returnUrl", returnUrl,
                    "expiredAt", expiresAt.getEpochSecond(), "signature", hmac(channel, signed));
            JsonNode response = send(channel, HttpRequest.newBuilder(URI.create(API))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))));
            JsonNode data = response.path("data");
            if (data.path("orderCode").asLong() != orderCode || data.path("amount").asLong() != amount
                    || !"PENDING".equals(data.path("status").asText())
                    || data.path("paymentLinkId").asText().isBlank()
                    || data.path("checkoutUrl").asText().isBlank() || data.path("qrCode").asText().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Invalid payOS payment link response");
            }
            return new Link(orderCode, amount, data.path("paymentLinkId").asText(),
                    data.path("checkoutUrl").asText(), data.path("qrCode").asText());
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cannot create payOS payment link", ex);
        }
    }

    @Override
    public Link recover(Channel channel, long orderCode, long amount) {
        configured(channel);
        JsonNode data = send(channel, HttpRequest.newBuilder(URI.create(API + "/" + orderCode)).GET()).path("data");
        if (data.path("orderCode").asLong() != orderCode || data.path("amount").asLong() != amount
                || !"PENDING".equals(data.path("status").asText()) || data.path("id").asText().isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "payOS link cannot be recovered");
        }
        String id = data.path("id").asText();
        return new Link(orderCode, amount, id, "https://pay.payos.vn/web/" + id, null);
    }

    @Override
    public void cancel(Channel channel, long orderCode) {
        configured(channel);
        send(channel, HttpRequest.newBuilder(URI.create(API + "/" + orderCode + "/cancel"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{}")));
    }

    @Override
    public void confirmWebhook(Channel channel, String webhookUrl) {
        configured(channel);
        try {
            send(channel, HttpRequest.newBuilder(URI.create("https://api-merchant.payos.vn/confirm-webhook"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(Map.of("webhookUrl", webhookUrl)))));
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cannot register payOS webhook", ex);
        }
    }

    @Override
    public boolean verifyWebhook(Channel channel, JsonNode data, String signature) {
        configured(channel);
        if (data == null || !data.isObject() || signature == null || !signature.matches("[0-9a-fA-F]{64}")) {
            return false;
        }
        TreeMap<String, String> sorted = new TreeMap<>();
        for (var field : data.properties()) {
            JsonNode value = field.getValue();
            sorted.put(field.getKey(), value.isNull() ? "" : value.isTextual() ? value.asText() : value.toString());
        }
        StringBuilder canonical = new StringBuilder();
        sorted.forEach((key, value) -> {
            if (!canonical.isEmpty()) canonical.append('&');
            canonical.append(key).append('=').append(value);
        });
        byte[] expected = hmac(channel, canonical.toString()).getBytes(StandardCharsets.US_ASCII);
        byte[] actual = signature.toLowerCase(java.util.Locale.ROOT).getBytes(StandardCharsets.US_ASCII);
        return MessageDigest.isEqual(expected, actual);
    }

    private JsonNode send(Channel channel, HttpRequest.Builder builder) {
        configured(channel);
        try {
            HttpRequest request = builder.header("x-client-id", channel.clientId()).header("x-api-key", channel.apiKey())
                    .timeout(Duration.ofSeconds(10)).build();
            HttpResponse<String> result = http.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode response = json.readTree(result.body());
            if (result.statusCode() < 200 || result.statusCode() >= 300
                    || !"00".equals(response.path("code").asText())) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "payOS request failed with HTTP " + result.statusCode());
            }
            return response;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "payOS unavailable", ex);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "payOS unavailable", ex);
        }
    }

    private String hmac(Channel channel, String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(channel.checksumKey().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return java.util.HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot sign payOS request", ex);
        }
    }

    private void configured(Channel channel) {
        if (channel == null || channel.clientId().isBlank() || channel.apiKey().isBlank()
                || channel.checksumKey().isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Provider payOS channel is not configured");
        }
    }
}
