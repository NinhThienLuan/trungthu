package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@RestController
@RequestMapping("/api/provider/checkout-settings")
@PreAuthorize("hasRole('PROVIDER')")
@RequiredArgsConstructor
public class ProviderCheckoutSettingsController {
    private final SecurityContextService security;

    public record BankAccountRequest(
            @NotBlank @Pattern(regexp = "[A-Za-z0-9]{2,20}") String bankCode,
            @NotBlank @Pattern(regexp = "[0-9]{4,19}") String accountNumber,
            @NotBlank @Size(max = 150) String accountName) {}

    /** Phí giao không còn do seller khai báo: cố định theo ShippingFeePolicy (nội thành HCM 35k, còn lại 70k) */
    public record SettingsView(String bankCode, String accountNumber, String accountName) {}

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<SettingsView>> getSettings() {
        User provider = requireProvider();
        return ResponseEntity.ok(ApiResponseDTO.success(new SettingsView(provider.getBankCode(),
                provider.getBankAccountNumber(), provider.getBankAccountName())));
    }

    @PutMapping("/bank-account")
    @Transactional
    public ResponseEntity<ApiResponseDTO<Void>> setBankAccount(@Valid @RequestBody BankAccountRequest request) {
        User provider = requireProvider();
        provider.setBankCode(request.bankCode().trim().toUpperCase(Locale.ROOT));
        provider.setBankAccountNumber(request.accountNumber().trim());
        provider.setBankAccountName(request.accountName().trim());
        return ResponseEntity.ok(ApiResponseDTO.success(null));
    }

    private User requireProvider() {
        User user = security.getCurrentUser();
        if (user.getRole() != UserRole.PROVIDER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Provider account required");
        }
        return user;
    }
}
