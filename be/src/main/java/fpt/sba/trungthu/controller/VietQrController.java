package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import fpt.sba.trungthu.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class VietQrController {
    private final SecurityContextService security;
    private final OrderRepository orders;

    public record VietQrResponse(String imageUrl, String bankCode, String accountNumber,
            String accountName, BigDecimal amount, String transferContent, Instant holdExpiresAt) {}

    @GetMapping("/{id}/vietqr")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'PROVIDER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<VietQrResponse>> getVietQr(@PathVariable UUID id) {
        Order order = orders.findOwnedOrder(id, security.getCurrentUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (order.getPaymentMethod() != PaymentMethod.VIETQR
                || order.getOrderStatus() != OrderStatus.PENDING_DEPOSIT
                || order.getHoldExpiresAt() == null || !Instant.now().isBefore(order.getHoldExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Deposit hold is no longer active");
        }
        String content = order.getOrderCode().replace("-", "");
        return ResponseEntity.ok(ApiResponseDTO.success(
                build(order.getProvider(), order.getDepositAmount(), content, order.getHoldExpiresAt())));
    }

    /** Mã VietQR chuyển tiền vào tài khoản của xưởng; dùng chung cho đơn lẻ và đơn sỉ. */
    static VietQrResponse build(User provider, BigDecimal amount, String content, Instant holdExpiresAt) {
        String bank = provider.getBankCode();
        String account = provider.getBankAccountNumber();
        String name = provider.getBankAccountName();
        if (bank == null || !bank.matches("[A-Za-z0-9]{2,20}")
                || account == null || !account.matches("[0-9]{4,19}")
                || name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Xưởng chưa cấu hình tài khoản nhận tiền");
        }
        String url = "https://img.vietqr.io/image/" + bank + "-" + account
                + "-compact2.svg?amount=" + amount.setScale(0, RoundingMode.CEILING).toBigInteger()
                + "&addInfo=" + encode(content) + "&accountName=" + encode(name);
        return new VietQrResponse(url, bank, account, name, amount, content, holdExpiresAt);
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
