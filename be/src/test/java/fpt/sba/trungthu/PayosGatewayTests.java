package fpt.sba.trungthu;

import fpt.sba.trungthu.service.PayosGateway;
import fpt.sba.trungthu.service.impl.PayosHttpGateway;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.*;

class PayosGatewayTests {
    @Test
    void webhookSignatureCoversAllPaymentFields() throws Exception {
        var gateway = new PayosHttpGateway(new ObjectMapper(), "http://localhost/return", "http://localhost/cancel");
        var channel = new PayosGateway.Channel("client", "api", "checksum-key");
        var data = new ObjectMapper().createObjectNode();
        data.put("reference", "BANK-1").put("orderCode", 123L).put("amount", 10000);
        String canonical = "amount=10000&orderCode=123&reference=BANK-1";
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("checksum-key".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String signature = HexFormat.of().formatHex(mac.doFinal(canonical.getBytes(StandardCharsets.UTF_8)));
        assertThat(gateway.verifyWebhook(channel, data, signature)).isTrue();
        data.put("amount", 10001);
        assertThat(gateway.verifyWebhook(channel, data, signature)).isFalse();
        assertThat(gateway.verifyWebhook(new PayosGateway.Channel("other", "api", "different-key"),
                data, signature)).isFalse();
    }
}
