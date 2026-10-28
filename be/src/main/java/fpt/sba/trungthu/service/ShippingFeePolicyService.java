package fpt.sba.trungthu.service;

import java.math.BigDecimal;

/** Tính phí giao cho một đơn theo địa chỉ nhận hàng. */
public interface ShippingFeePolicyService {
    BigDecimal fee(String province, String district, String wardCode);
}
