package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.service.ShippingFeePolicyService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Phí giao mỗi đơn: nội thành TP.HCM đồng giá 35.000đ, ngoại thành và tỉnh khác 70.000đ.
 * Mã phường nội thành được đối chiếu từ địa giới cũ; BE là nơi quyết định giá.
 */
@Service
public class ShippingFeePolicyServiceImpl implements ShippingFeePolicyService {

    static final BigDecimal INNER_CITY_FEE = new BigDecimal("35000");
    static final BigDecimal OUTER_FEE = new BigDecimal("70000");

    private static final Set<String> HCM_NAMES = Set.of("ho chi minh", "tp ho chi minh", "thanh pho ho chi minh", "hcm", "tphcm");
    private static final Set<String> HCM_INNER_WARD_CODES = loadInnerWardCodes();

    /** 16 quận + TP Thủ Đức (không dấu, chữ thường); huyện Bình Chánh, Hóc Môn, Củ Chi, Nhà Bè, Cần Giờ là ngoại thành */
    private static final Set<String> HCM_INNER_DISTRICTS = Set.of(
            "quan 1", "quan 3", "quan 4", "quan 5", "quan 6", "quan 7", "quan 8", "quan 10", "quan 11", "quan 12",
            "binh thanh", "go vap", "phu nhuan", "tan binh", "tan phu", "binh tan", "thu duc");

    @Override
    public BigDecimal fee(String province, String district, String wardCode) {
        if (!HCM_NAMES.contains(normalize(province))) return OUTER_FEE;
        if (wardCode != null && !wardCode.isBlank()) {
            return HCM_INNER_WARD_CODES.contains(wardCode) ? INNER_CITY_FEE : OUTER_FEE;
        }
        return HCM_INNER_DISTRICTS.contains(normalize(district))
                ? INNER_CITY_FEE : OUTER_FEE;
    }

    private static Set<String> loadInnerWardCodes() {
        InputStream stream = ShippingFeePolicyServiceImpl.class.getResourceAsStream("/hcm-inner-ward-codes.txt");
        if (stream == null) throw new IllegalStateException("Missing HCM inner ward codes");
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            return reader.lines().filter(line -> !line.isBlank()).collect(Collectors.toUnmodifiableSet());
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read HCM inner ward codes", e);
        }
    }

    /** "TP. Hồ Chí Minh" -> "tp ho chi minh"; "TP Thủ Đức" -> "thu duc"; "Q.1" -> "quan 1" */
    static String normalize(String value) {
        if (value == null) return "";
        String s = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
                .replace('đ', 'd').replace('Đ', 'D').toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();
        s = s.replaceFirst("^(thanh pho|tp) thu duc$", "thu duc");
        return s.replaceFirst("^q (\\d+)$", "quan $1");
    }
}
