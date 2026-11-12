package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.request.BulkDeliveryRequest;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.BulkOrderResponse;
import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.entity.BulkOrder;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.BulkOrderStatus;
import fpt.sba.trungthu.repository.BulkOrderRepository;
import fpt.sba.trungthu.service.impl.BulkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class BulkOrderController {
    private final BulkOrderService service;
    private final BulkOrderRepository orders;
    private final SecurityContextService security;

    public record BulkVietQrResponse(String imageUrl, String bankCode, String accountNumber,
            String accountName, BigDecimal amount, String transferContent) {}

    @GetMapping("/api/bulk-orders/{id}/vietqr")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<BulkVietQrResponse>> vietQr(@PathVariable UUID id) {
        BulkOrder order = orders.findById(id)
                .filter(item -> item.getQuote().getRequest().getCustomer().getId().equals(security.getCurrentUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn sỉ"));
        if (order.getStatus() != BulkOrderStatus.WAITING_DEPOSIT
                || !LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).isBefore(order.getDepositDeadline()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Đã hết thời gian chuyển cọc");
        User provider = order.getQuote().getProvider();
        String bank = provider.getBankCode();
        String account = provider.getBankAccountNumber();
        String name = provider.getBankAccountName();
        if (bank == null || !bank.matches("[A-Za-z0-9]{2,20}")
                || account == null || !account.matches("[0-9]{4,19}")
                || name == null || name.isBlank())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Xưởng chưa cấu hình tài khoản nhận tiền");
        String content = order.getQuote().getRequest().getRequestCode().replace("-", "");
        String url = "https://img.vietqr.io/image/" + bank + "-" + account
                + "-compact2.svg?amount=" + order.getDepositAmount().toBigIntegerExact()
                + "&addInfo=" + URLEncoder.encode(content, StandardCharsets.UTF_8).replace("+", "%20")
                + "&accountName=" + URLEncoder.encode(name, StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok(ApiResponseDTO.success(new BulkVietQrResponse(url, bank, account,
                name, order.getDepositAmount(), content)));
    }

    @GetMapping("/api/bulk-orders/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<List<BulkOrderResponse>>> mine() {
        return ResponseEntity.ok(ApiResponseDTO.success(service.mine()));
    }

    @GetMapping("/api/provider/bulk-orders")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<List<BulkOrderResponse>>> providerOrders() {
        return ResponseEntity.ok(ApiResponseDTO.success(service.providerOrders()));
    }

    @PutMapping("/api/bulk-orders/{id}/delivery")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> delivery(@PathVariable UUID id,
            @Valid @RequestBody BulkDeliveryRequest input) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.setDelivery(id, input)));
    }

    @PostMapping("/api/bulk-orders/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.cancel(id)));
    }

    @PostMapping("/api/provider/bulk-orders/{id}/deposit")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> deposit(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.confirmDeposit(id)));
    }

    @PostMapping("/api/provider/bulk-orders/{id}/days/{dayId}/complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> completeDay(@PathVariable UUID id, @PathVariable UUID dayId) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.completeDay(id, dayId)));
    }

    @PostMapping("/api/provider/bulk-orders/{id}/dispatch")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> dispatch(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.dispatch(id)));
    }

    @PostMapping("/api/provider/bulk-orders/{id}/delivered")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> delivered(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.delivered(id)));
    }

    @PostMapping("/api/provider/bulk-orders/{id}/balance")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponseDTO<BulkOrderResponse>> balance(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponseDTO.success(service.confirmBalance(id)));
    }
}
