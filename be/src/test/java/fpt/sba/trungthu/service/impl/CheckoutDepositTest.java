package fpt.sba.trungthu.service.impl;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class CheckoutDepositTest {
    @Test
    void minDepositFollowsTieredPolicy() {
        // Dưới 1 triệu: cọc 20% làm tròn lên nghìn
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("71000"))).isEqualByComparingTo("15000"); // 14.200 -> 15.000
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("220000"))).isEqualByComparingTo("44000");
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("500"))).isEqualByComparingTo("500");

        // Từ 1 triệu đến dưới 3 triệu: cọc 30%
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("1500000"))).isEqualByComparingTo("450000");
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("2000000"))).isEqualByComparingTo("600000");

        // Từ 3 triệu trở lên: cọc 50%
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("4000000"))).isEqualByComparingTo("2000000");

        // Có yêu cầu in lời chúc riêng: cọc 50% dù dưới 1 triệu
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("220000"), true)).isEqualByComparingTo("110000");
    }
}
