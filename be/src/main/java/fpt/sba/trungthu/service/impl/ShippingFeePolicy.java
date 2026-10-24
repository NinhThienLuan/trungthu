package fpt.sba.trungthu.service.impl;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;

/**
 * Phí giao mỗi đơn: nội thành TP.HCM đồng giá 35.000đ, ngoại thành và tỉnh khác 70.000đ.
 * FE: fe/src/constants/shipping.ts (danh sách quận/huyện cho ô chọn). BE là nơi quyết định giá.
 */
final class ShippingFeePolicy {
    private ShippingFeePolicy() {}

    static final BigDecimal INNER_CITY_FEE = new BigDecimal("35000");
    static final BigDecimal OUTER_FEE = new BigDecimal("70000");

    private static final Set<String> HCM_NAMES = Set.of("ho chi minh", "tp ho chi minh", "thanh pho ho chi minh", "hcm", "tphcm");

    /** 16 quận + TP Thủ Đức (không dấu, chữ thường); huyện Bình Chánh, Hóc Môn, Củ Chi, Nhà Bè, Cần Giờ là ngoại thành */
    private static final Set<String> HCM_INNER_DISTRICTS = Set.of(
            "quan 1", "quan 3", "quan 4", "quan 5", "quan 6", "quan 7", "quan 8", "quan 10", "quan 11", "quan 12",
            "binh thanh", "go vap", "phu nhuan", "tan binh", "tan phu", "binh tan", "thu duc");

    static BigDecimal fee(String province, String district) {
        return HCM_NAMES.contains(normalize(province)) && HCM_INNER_DISTRICTS.contains(normalize(district))
                ? INNER_CITY_FEE : OUTER_FEE;
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
