package fpt.sba.trungthu.entity;

import fpt.sba.trungthu.common.infrastructure.BaseEntity;
import fpt.sba.trungthu.entity.enumeration.PromotionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

/** Sự kiện khuyến mãi của một xưởng; product null = áp cho mọi sản phẩm của xưởng (trừ set quà) */
@Entity
@Table(name = "PROMOTION", indexes = {
        @Index(name = "IX_PROMOTION_provider_id", columnList = "provider_id") })
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Promotion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false, foreignKey = @ForeignKey(name = "FK_PROMOTION_provider_id"))
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "FK_PROMOTION_product_id"))
    private Product product;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "promotion_type", nullable = false, length = 30)
    private PromotionType type;

    @Column(name = "min_quantity")
    private Integer minQuantity;

    @Column(name = "percent_off")
    private Integer percentOff;

    @Column(name = "buy_quantity")
    private Integer buyQuantity;

    @Column(name = "free_quantity")
    private Integer freeQuantity;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // Không dùng @ColumnDefault("1"): PostgreSQL (Heroku) không nhận 1 làm mặc định cho boolean nên không tạo được bảng
    @Builder.Default
    @Column(name = "active", nullable = false)
    private Boolean active = true;

    public boolean runsOn(LocalDate day) {
        return Boolean.TRUE.equals(active) && !day.isBefore(startDate) && !day.isAfter(endDate);
    }

    public boolean covers(Product target) {
        return product == null || product.getId().equals(target.getId());
    }

    /** Số tiền giảm cho một dòng `quantity` cái giá `unitPrice` (làm tròn xuống đồng) */
    public BigDecimal discountFor(BigDecimal unitPrice, int quantity) {
        return switch (type) {
            case PERCENT_OFF -> quantity < minQuantity ? BigDecimal.ZERO
                    : unitPrice.multiply(BigDecimal.valueOf((long) quantity * percentOff))
                            .divide(BigDecimal.valueOf(100), 0, RoundingMode.FLOOR);
            case BUY_X_GET_Y -> unitPrice.multiply(
                    BigDecimal.valueOf((long) (quantity / (buyQuantity + freeQuantity)) * freeQuantity));
        };
    }

    /** Nhãn ngắn hiện cho khách, vd "Mua 3 tặng 1", "Giảm 10% từ 5 cái" */
    public String label() {
        return switch (type) {
            case PERCENT_OFF -> "Giảm " + percentOff + "% từ " + minQuantity + " cái";
            case BUY_X_GET_Y -> "Mua " + buyQuantity + " tặng " + freeQuantity;
        };
    }
}
