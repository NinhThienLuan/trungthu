package fpt.sba.trungthu.entity.enumeration;

/**
 * Phân loại lý do khiếu nại chất lượng sản phẩm / dịch vụ.
 */
public enum ComplaintType {
    // Bánh bị dập nát, hỏng hộp trong lúc vận chuyển
    DAMAGED,

    // Bánh có hiện tượng mốc, chua, quá hạn sử dụng
    MOLDED,

    // Sai loại nhân bánh, sai trọng lượng hoặc thiếu số lượng
    WRONG_SPECIFICATION,

    // Giao trễ so với ngày cam kết trong đợt giao
    LATE_DELIVERY,

    // Khiếu nại dịch vụ / thái độ hoặc lý do khác
    OTHER
}
