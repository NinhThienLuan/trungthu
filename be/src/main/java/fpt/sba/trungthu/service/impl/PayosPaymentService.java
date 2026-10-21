package fpt.sba.trungthu.service.impl;

import tools.jackson.databind.JsonNode;
import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.PayosPaymentResponse;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.PaymentTransaction;
import fpt.sba.trungthu.entity.enumeration.*;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.PaymentTransactionRepository;
import fpt.sba.trungthu.service.PayosGateway;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayosPaymentService {
    private final SecurityContextService security;
    private final OrderRepository orders;
    private final PaymentTransactionRepository payments;
    private final PayosGateway gateway;
    private final ProviderPayosAccountService accounts;

    @Transactional(rollbackFor = Exception.class)
    public PayosPaymentResponse getOrCreate(UUID orderId) {
        Order order = orders.findForUpdateById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getCustomer().getId().equals(security.getCurrentUserId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        if (order.getPaymentMethod() != PaymentMethod.PAYOS || order.getOrderStatus() != OrderStatus.PENDING_DEPOSIT
                || order.getHoldExpiresAt() == null || !Instant.now().isBefore(order.getHoldExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "PayOS payment period has ended");
        }
        PaymentTransaction payment = deposit(orderId);
        if (payment.getPayosOrderCode() == null || payment.getPaymentStatus() != TransactionStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "PayOS payment is unavailable");
        }
        if (payment.getPayosCheckoutUrl() == null) {
            long amount = payment.getAmount().longValueExact();
            String description = "TT" + payment.getPayosOrderCode();
            // A retry can recover a link created remotely before the local transaction committed.
            PayosGateway.Link link;
            PayosGateway.Channel channel = accounts.requireReady(order.getProvider().getId());
            try {
                link = gateway.create(channel, payment.getPayosOrderCode(), amount, description, order.getHoldExpiresAt());
            } catch (ResponseStatusException ex) {
                link = gateway.recover(channel, payment.getPayosOrderCode(), amount);
            }
            payment.setPayosPaymentLinkId(link.paymentLinkId());
            payment.setPayosCheckoutUrl(link.checkoutUrl());
            payment.setPayosQrCode(link.qrCode());
        }
        return new PayosPaymentResponse(orderId, payment.getPayosOrderCode(), payment.getAmount(),
                payment.getPayosPaymentLinkId(), payment.getPayosCheckoutUrl(), payment.getPayosQrCode(),
                order.getHoldExpiresAt());
    }

    @Transactional(rollbackFor = Exception.class)
    public void receiveWebhook(JsonNode payload) {
        JsonNode data = payload == null ? null : payload.path("data");
        if (data == null || !data.isObject()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing payOS data");
        long code = data.path("orderCode").asLong(0);
        PaymentTransaction payment = payments.findByPayosOrderCode(code).orElse(null);
        // payOS sends a signed test webhook when registering the URL.
        if (payment == null) return;
        Order order = orders.findForUpdateById(payment.getOrder().getId())
                .orElseThrow(() -> new IllegalStateException("PayOS order missing"));
        PayosGateway.Channel channel = accounts.forProvider(order.getProvider().getId());
        if (!gateway.verifyWebhook(channel, data, payload.path("signature").asText(null))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payOS webhook signature");
        }
        if (!payload.path("success").asBoolean(false) || !"00".equals(payload.path("code").asText())
                || !"00".equals(data.path("code").asText())) {
            return;
        }
        if (data.path("amount").asLong(-1) != payment.getAmount().longValueExact()
                || !"VND".equals(data.path("currency").asText())
                || payment.getPayosPaymentLinkId() == null
                || !payment.getPayosPaymentLinkId().equals(data.path("paymentLinkId").asText())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PayOS payment does not match the order");
        }
        if (payment.getPaymentStatus() == TransactionStatus.SUCCESS) return;
        String reference = data.path("reference").asText("");
        if (reference.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PayOS reference is missing");
        }
        payment.setPayosExternalReference(reference);
        if (order.getOrderStatus() != OrderStatus.PENDING_DEPOSIT
                || payment.getPaymentStatus() != TransactionStatus.PENDING
                || order.getHoldExpiresAt() == null || !Instant.now().isBefore(order.getHoldExpiresAt())) {
            log.error("PayOS payment {} reached cancelled or expired order {}; manual refund/reconciliation required",
                    reference, order.getId());
            return;
        }
        payment.setPaidAt(Instant.now());
        payment.transitionPaymentStatus(TransactionStatus.SUCCESS);
        order.transitionPaymentStatus(payment.getAmount().compareTo(order.getTotalAmount()) == 0
                ? OrderPaymentStatus.PAID_FULL : OrderPaymentStatus.DEPOSITED);
        order.transitionOrderStatus(OrderStatus.DEPOSITED);
        order.setHoldExpiresAt(null);
    }

    private PaymentTransaction deposit(UUID orderId) {
        return payments.findByOrderIdOrderByCreatedAtAsc(orderId).stream()
                .filter(tx -> tx.getTransactionType() == TransactionType.ORDER_DEPOSIT
                        && tx.getPaymentMethod() == PaymentMethod.PAYOS)
                .findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "PayOS deposit missing"));
    }
}
