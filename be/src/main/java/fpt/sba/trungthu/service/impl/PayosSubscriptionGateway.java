package fpt.sba.trungthu.service.impl;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import vn.payos.PayOS;
import vn.payos.core.ClientOptions;
import vn.payos.exception.APIException;
import vn.payos.exception.NotFoundException;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;

import java.net.URI;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;

@Component
public class PayosSubscriptionGateway {
    private final PayOS client;
    private final String returnUrl;

    public PayosSubscriptionGateway(@Value("${app.subscription-payment.payos.client-id:}") String clientId,
                                    @Value("${app.subscription-payment.payos.api-key:}") String apiKey,
                                    @Value("${app.subscription-payment.payos.checksum-key:}") String checksumKey,
                                    @Value("${app.subscription-payment.return-url:}") String returnUrl) {
        this.returnUrl = returnUrl;
        client = clientId.isBlank() || apiKey.isBlank() || checksumKey.isBlank() || returnUrl.isBlank() ? null
                : new PayOS(ClientOptions.builder().clientId(clientId).apiKey(apiKey).checksumKey(checksumKey)
                        .timeoutMs(5000).maxRetries(0).build());
    }

    public void requireConfigured() {
        if (client == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Thanh toán gói bán hàng chưa được cấu hình.");
        }
    }

    public CreatePaymentLinkResponse create(long orderCode, long amount, Instant expiresAt) {
        requireConfigured();
        return client.paymentRequests().create(CreatePaymentLinkRequest.builder()
                .orderCode(orderCode).amount(amount).description("PHI GOI")
                .returnUrl(returnUrl).cancelUrl(returnUrl).expiredAt(expiresAt.getEpochSecond()).build());
    }

    public PaymentLink find(long orderCode) {
        requireConfigured();
        try {
            return client.paymentRequests().get(orderCode);
        } catch (NotFoundException e) {
            return null;
        } catch (APIException e) {
            // payOS can return an application error inside an HTTP 200 response.
            if (e.getErrorCode().filter("231"::equals).isPresent()) return null;
            throw e;
        }
    }

    public PaymentLink cancel(long orderCode) {
        requireConfigured();
        return client.paymentRequests().cancel(orderCode, "Seller huy thanh toan goi");
    }

    public record PaymentNotice(long orderCode, String linkId, String code, String currency) {}

    public PaymentNotice verify(Map<String, Object> payload) {
        requireConfigured();
        if (!(payload.get("data") instanceof Map<?, ?> data) || !(payload.get("signature") instanceof String signature)
                || !signature.matches("[a-fA-F0-9]{64}")
                || !(data.get("orderCode") instanceof Integer || data.get("orderCode") instanceof Long)
                || !(data.get("paymentLinkId") instanceof String linkId)
                || !(data.get("code") instanceof String code) || !(data.get("currency") instanceof String currency)) {
            throw invalidWebhook();
        }
        // Sign the actual fields sent by payOS, including any new fields and explicit nulls.
        String expected = client.getCrypto().createSignatureFromObj(data, client.getOptions().getChecksumKey());
        HexFormat hex = HexFormat.of();
        if (!MessageDigest.isEqual(hex.parseHex(expected), hex.parseHex(signature))) {
            throw invalidWebhook();
        }
        return new PaymentNotice(((Number) data.get("orderCode")).longValue(), linkId, code, currency);
    }

    private static ResponseStatusException invalidWebhook() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Webhook payOS không hợp lệ.");
    }

    public static String trustedCheckoutUrl(String url) {
        URI uri = url == null ? URI.create("") : URI.create(url);
        if (!"https".equals(uri.getScheme()) || uri.getUserInfo() != null || uri.getPort() != -1
                || !("pay.payos.vn".equals(uri.getHost()) || "next.pay.payos.vn".equals(uri.getHost()))) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Đường dẫn thanh toán payOS không hợp lệ.");
        }
        return url;
    }

    @PreDestroy
    void close() {
        if (client != null) client.close();
    }
}
