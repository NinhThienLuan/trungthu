package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.entity.ProviderShippingRate;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.ProviderShippingRateRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Locale;

@RestController
@RequestMapping("/api/provider/checkout-settings")
@PreAuthorize("hasRole('PROVIDER')")
@RequiredArgsConstructor
public class ProviderCheckoutSettingsController {
    private final SecurityContextService security;
    private final ProviderShippingRateRepository rates;
    private final fpt.sba.trungthu.repository.ProviderPayosAccountRepository payosAccounts;

    public record BankAccountRequest(
            @NotBlank @Pattern(regexp = "[A-Za-z0-9]{2,20}") String bankCode,
            @NotBlank @Pattern(regexp = "[0-9]{4,19}") String accountNumber,
            @NotBlank @Size(max = 150) String accountName) {}

    public record ShippingRateRequest(@NotBlank @Size(max = 100) String province,
            @NotBlank @Size(max = 100) String district,
            @NotNull @DecimalMin("0") @Digits(integer = 16, fraction = 2) BigDecimal fee) {}

    public record ShippingRateView(String province, String district, BigDecimal fee) {}

    /** Không trả khoá PayOS: chỉ cho biết đã cấu hình / đã đăng ký webhook chưa */
    public record SettingsView(String bankCode, String accountNumber, String accountName,
            java.util.List<ShippingRateView> shippingRates, boolean payosConfigured, boolean payosWebhookConfirmed) {}

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<SettingsView>> getSettings() {
        User provider = requireProvider();
        var payos = payosAccounts.findByProviderId(provider.getId());
        return ResponseEntity.ok(ApiResponseDTO.success(new SettingsView(provider.getBankCode(),
                provider.getBankAccountNumber(), provider.getBankAccountName(),
                rates.findByProviderIdOrderByProvinceAscDistrictAsc(provider.getId()).stream()
                        .map(r -> new ShippingRateView(r.getProvince(), r.getDistrict(), r.getFee())).toList(),
                payos.isPresent(), payos.map(a -> a.getWebhookConfirmedAt() != null).orElse(false))));
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

    @PutMapping("/shipping-rate")
    @Transactional
    public ResponseEntity<ApiResponseDTO<Void>> setShippingRate(@Valid @RequestBody ShippingRateRequest request) {
        User provider = requireProvider();
        if (request.fee().stripTrailingZeros().scale() > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shipping fee must be an integer amount of VND");
        }
        String province = normalize(request.province());
        String district = normalize(request.district());
        ProviderShippingRate rate = rates.findByProviderIdAndProvinceAndDistrict(provider.getId(), province, district)
                .orElseGet(() -> ProviderShippingRate.builder().provider(provider)
                        .province(province).district(district).build());
        rate.setFee(request.fee());
        rates.save(rate);
        return ResponseEntity.ok(ApiResponseDTO.success(null));
    }

    private User requireProvider() {
        User user = security.getCurrentUser();
        if (user.getRole() != UserRole.PROVIDER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Provider account required");
        }
        return user;
    }

    private String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
