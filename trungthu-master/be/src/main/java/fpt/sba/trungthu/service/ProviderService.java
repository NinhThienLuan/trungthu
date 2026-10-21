package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.response.UserResponse;

import java.util.UUID;

/**
 * Interface nghiệp vụ chuyên trách dành cho Provider (Chủ gian hàng bán bánh).
 * Quản lý thông tin gian hàng, trạng thái mùa vụ, hồ sơ định danh và cài đặt xưởng.
 */
public interface ProviderService {

    /**
     * Lấy thông tin chi tiết gian hàng của Provider đang đăng nhập.
     * @param providerEmail Email của Provider
     * @return Thông tin User/Gian hàng
     */
    UserResponse getMyStoreProfile(String providerEmail);

    /**
     * Cập nhật thông tin gian hàng (tên thương hiệu, địa chỉ).
     * @param providerEmail Email của Provider
     * @param storeName Tên thương hiệu gian hàng mới
     * @param address Địa chỉ xưởng/cửa hàng
     * @return Thông tin cập nhật
     */
    UserResponse updateStoreProfile(String providerEmail, String storeName, String address);

    /**
     * Bật/tắt công tắc mùa vụ (isSeasonActive) của Provider.
     * @param providerEmail Email của Provider
     * @param isActive Trạng thái mùa vụ
     * @return Thông tin cập nhật
     */
    UserResponse toggleSeasonActive(String providerEmail, boolean isActive);
}
