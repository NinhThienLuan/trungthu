package fpt.sba.trungthu.entity.enumeration;

import java.math.BigDecimal;

/** Bảng giá gói bán hàng mỗi mùa (seller chỉ chọn mã gói; giá và giới hạn do sàn quy định ở đây) */
public enum SubscriptionPlan {
    BASIC("Cơ bản", new BigDecimal("990000"), 20),
    STANDARD("Tiêu chuẩn", new BigDecimal("1990000"), 50),
    PREMIUM("Cao cấp", new BigDecimal("3990000"), 200);

    private final String label;
    private final BigDecimal price;
    private final int maxProducts;

    SubscriptionPlan(String label, BigDecimal price, int maxProducts) {
        this.label = label;
        this.price = price;
        this.maxProducts = maxProducts;
    }

    public String label() { return label; }
    public BigDecimal price() { return price; }
    public int maxProducts() { return maxProducts; }
}
