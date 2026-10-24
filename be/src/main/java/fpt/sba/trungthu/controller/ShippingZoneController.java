package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.repository.ProviderShippingRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Công khai: khu vực seller giao được + phí, để checkout cho khách chọn thay vì gõ tự do
 * (gõ lệch chữ -> SHIPPING_RATE_MISSING). Giá trị trả về đúng dạng CheckoutService so khớp.
 */
@RestController
@RequiredArgsConstructor
public class ShippingZoneController {
    private final ProviderShippingRateRepository rates;

    public record ShippingZone(String province, String district, BigDecimal fee) {}

    @GetMapping("/api/providers/{providerId}/shipping-zones")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<ShippingZone>>> zones(@PathVariable UUID providerId) {
        return ResponseEntity.ok(ApiResponseDTO.success(rates.findByProviderIdOrderByProvinceAscDistrictAsc(providerId)
                .stream().map(r -> new ShippingZone(r.getProvince(), r.getDistrict(), r.getFee())).toList()));
    }
}
