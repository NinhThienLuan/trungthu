package fpt.sba.trungthu.entity.enumeration;

/**
 * Phương thức thanh toán được hỗ trợ trên nền tảng.
 */
public enum PaymentMethod {
    // Chuyển khoản quét mã VietQR tự động
    VIETQR,

    // Cổng thanh toán trực tuyến PayOS
    PAYOS,

    // Cổng thanh toán VNPay
    VNPAY,

    // Ví điện tử MoMo
    MOMO,

    // Chuyển khoản ngân hàng trực tiếp cho Provider
    DIRECT_BANK,

    // Thanh toán khi nhận hàng (Cash on Delivery)
    COD
}
