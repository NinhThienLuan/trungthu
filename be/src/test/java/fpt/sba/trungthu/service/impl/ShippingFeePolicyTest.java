package fpt.sba.trungthu.service.impl;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ShippingFeePolicyTest {

    @Test
    void innerHcmIs35kEverythingElse70k() {
        assertThat(ShippingFeePolicy.fee("Hồ Chí Minh", "Quận 1")).isEqualByComparingTo("35000");
        assertThat(ShippingFeePolicy.fee("TP. Hồ Chí Minh", "Q.11")).isEqualByComparingTo("35000");
        assertThat(ShippingFeePolicy.fee("hcm", "TP Thủ Đức")).isEqualByComparingTo("35000");
        assertThat(ShippingFeePolicy.fee("Hồ Chí Minh", "Bình Thạnh")).isEqualByComparingTo("35000");
        assertThat(ShippingFeePolicy.fee("Hồ Chí Minh", "Huyện Củ Chi")).isEqualByComparingTo("70000");
        assertThat(ShippingFeePolicy.fee("Hồ Chí Minh", "Quận 2")).as("đã nhập vào Thủ Đức").isEqualByComparingTo("70000");
        assertThat(ShippingFeePolicy.fee("Hà Nội", "Quận 1")).isEqualByComparingTo("70000");
        assertThat(ShippingFeePolicy.fee("Đồng Nai", null)).isEqualByComparingTo("70000");
    }
}
