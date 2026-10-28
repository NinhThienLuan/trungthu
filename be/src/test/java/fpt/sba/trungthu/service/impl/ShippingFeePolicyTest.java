package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.service.ShippingFeePolicyService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ShippingFeePolicyTest {
    private final ShippingFeePolicyService policy = new ShippingFeePolicyServiceImpl();

    @Test
    void innerHcmIs35kEverythingElse70k() {
        assertThat(policy.fee("Hồ Chí Minh", "Quận 1", null)).isEqualByComparingTo("35000");
        assertThat(policy.fee("TP. Hồ Chí Minh", "Q.11", null)).isEqualByComparingTo("35000");
        assertThat(policy.fee("hcm", "TP Thủ Đức", null)).isEqualByComparingTo("35000");
        assertThat(policy.fee("Hồ Chí Minh", "Bình Thạnh", null)).isEqualByComparingTo("35000");
        assertThat(policy.fee("Hồ Chí Minh", "Huyện Củ Chi", null)).isEqualByComparingTo("70000");
        assertThat(policy.fee("Hồ Chí Minh", "Quận 2", null)).as("đã nhập vào Thủ Đức").isEqualByComparingTo("70000");
        assertThat(policy.fee("Hà Nội", "Quận 1", null)).isEqualByComparingTo("70000");
        assertThat(policy.fee("Đồng Nai", null, null)).isEqualByComparingTo("70000");
    }

    @Test
    void currentWardCodesKeepTheSameTwoShippingPrices() {
        assertThat(policy.fee("Thành phố Hồ Chí Minh", null, "26737"))
                .as("Phường Tân Định").isEqualByComparingTo("35000");
        assertThat(policy.fee("Thành phố Hồ Chí Minh", null, "25807"))
                .as("Xã Thanh An").isEqualByComparingTo("70000");
        assertThat(policy.fee("Hà Nội", null, "26737"))
                .isEqualByComparingTo("70000");
    }
}
