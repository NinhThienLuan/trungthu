package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PayosSubscriptionWebhookController {
    private final SubscriptionService subscriptions;

    @PostMapping("/api/webhooks/payos/subscriptions")
    public ResponseEntity<Void> receive(@RequestBody Map<String, Object> payload) {
        subscriptions.handlePaymentWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
