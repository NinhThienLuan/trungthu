package fpt.sba.trungthu.entity.enumeration;

/** Kiểu sự kiện khuyến mãi do seller tạo */
public enum PromotionType {
    /** Giảm percentOff% đơn giá khi mua từ minQuantity cái trở lên (cùng một phân loại) */
    PERCENT_OFF,
    /** Mua buyQuantity tặng freeQuantity (cùng một phân loại), lặp lại theo từng bộ */
    BUY_X_GET_Y
}
