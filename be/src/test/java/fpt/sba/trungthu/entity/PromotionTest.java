package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.entity.enumeration.PromotionType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PromotionTest {
    private static final BigDecimal PRICE = new BigDecimal("95000");

    @Test
    void percentOffAppliesFromMinQuantityAndRoundsDown() {
        Promotion p = Promotion.builder().type(PromotionType.PERCENT_OFF).minQuantity(5).percentOff(10).build();
        assertThat(p.discountFor(PRICE, 4)).isEqualByComparingTo("0");
        assertThat(p.discountFor(PRICE, 5)).isEqualByComparingTo("47500");
        assertThat(p.discountFor(new BigDecimal("33333"), 5)).isEqualByComparingTo("16666"); // 16666.5 -> 16666
        assertThat(p.label()).isEqualTo("Giảm 10% từ 5 cái");
    }

    @Test
    void buyXGetYCountsProportionallyForPartialBundles() {
        Promotion p = Promotion.builder().type(PromotionType.BUY_X_GET_Y).buyQuantity(3).freeQuantity(1).build();
        assertThat(p.discountFor(PRICE, 3)).isEqualByComparingTo("0");      // Chưa đủ 1 set
        assertThat(p.discountFor(PRICE, 4)).isEqualByComparingTo("95000");  // 1 set → 1 bánh tặng
        assertThat(p.discountFor(PRICE, 6)).isEqualByComparingTo("142500"); // 1 set + 2 lẻ → 1.5 bánh tặng
        assertThat(p.discountFor(PRICE, 9)).isEqualByComparingTo("213750"); // 2 set + 1 lẻ → 2.25 bánh tặng
        assertThat(p.discountFor(PRICE, 11)).isEqualByComparingTo("261250"); // 2 set + 3 lẻ → 2.75 bánh tặng
        assertThat(p.label()).isEqualTo("Mua 3 tặng 1");
    }

    @Test
    void runsOnlyWhenActiveInsideDateRange() {
        LocalDate today = LocalDate.of(2026, 9, 10);
        Promotion p = Promotion.builder().type(PromotionType.PERCENT_OFF)
                .startDate(today).endDate(today.plusDays(2)).active(true).build();
        assertThat(p.runsOn(today.minusDays(1))).isFalse();
        assertThat(p.runsOn(today.plusDays(2))).isTrue();
        p.setActive(false);
        assertThat(p.runsOn(today)).isFalse();
    }
}
