package fpt.sba.trungthu.service.impl;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class CheckoutDepositTest {
    @Test
    void minDepositIsHalfRoundedUpToThousandButNeverAboveTotal() {
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("71000"))).isEqualByComparingTo("36000"); // không còn 35.500
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("220000"))).isEqualByComparingTo("110000");
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("95001"))).isEqualByComparingTo("48000");
        assertThat(CheckoutServiceImpl.minDeposit(new BigDecimal("500"))).isEqualByComparingTo("500");
    }
}
