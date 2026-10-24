package fpt.sba.trungthu.entity.enumeration;

/**
 * Phương thức thanh toán được hỗ trợ trên nền tảng.
 */
public enum PaymentMethod {
    // Chuyển khoản quét mã VietQR; provider đối soát và xác nhận thủ công
    VIETQR,

    // Cổng thanh toán VNPay
    VNPAY,

    // Ví điện tử MoMo
    MOMO,

    // Chuyển khoản ngân hàng trực tiếp cho Provider
    DIRECT_BANK,

    // Thanh toán khi nhận hàng (Cash on Delivery)
    COD
}
