# 📜 Business Rule: BR-06 - Đăng Ký Gói Dịch Vụ SaaS Provider & Quản Lý Hồ Sơ Pháp Lý (Provider Subscription & Compliance)

## 1. Goal (Mục tiêu)
Chuyển đổi mô hình kinh doanh chính của sàn thành **Mô Hình Đăng Ký Gói Dịch Vụ SaaS Provider (Pure Provider SaaS Model)**. Quy định chi tiết các gói dịch vụ SaaS đăng ký cho Seller/Provider/Nhà sản xuất, thời hạn hiển thị, phân quyền niêm yết SKU, và quy trình kiểm duyệt bắt buộc đối với Hồ sơ Pháp lý Cửa hàng (Giấy chứng nhận An toàn Vệ sinh Thực phẩm - ATTT, Giấy phép ĐKKD, Định danh KYC).

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Quy tắc Gói Đăng Ký Provider Subscription (`provider_subscriptions`)
- **Cấu hình Đăng Ký Provider**: Mỗi Seller/Nhà sản xuất khi tham gia Sàn phải đăng ký ít nhất **1 Gói dịch vụ SaaS hoạt động (`ACTIVE`)**.
- **Các Gói Đăng Ký SaaS Provider (Subscription Packages)**:
  - **Gói Tiêu Chuẩn (`STANDARD`)**:
    - Mức phí đăng ký: $1.000.000$ VNĐ / mùa vụ (3 tháng).
    - Giới hạn niêm yết tối đa: 20 biến thể SKU (`product_variants`).
    - Tính năng: Hiển thị sản phẩm trong danh mục chung, tiếp nhận đơn B2C lẻ/custom.
  - **Gói VIP Top Banner (`VIP_TOP_BANNER`)**:
    - Mức phí đăng ký: $3.000.000$ VNĐ / mùa vụ (3 tháng).
    - Giới hạn niêm yết: Không giới hạn SKU.
    - Tính năng: Xuất hiện vị trí Banner ưu tiên Trang chủ, ưu tiên nhận thông báo B2B RFQ từ khách doanh nghiệp.
  - **Gói Pop-up Mùa Vụ (`EXCLUSIVE_POPUP`)**:
    - Mức phí đăng ký: $5.000.000$ VNĐ / gói độc quyền 1 tháng cao điểm.
    - Tính năng: Độc quyền thương hiệu khu vực Pop-up Banner, tích hợp nút gọi Báo giá nhanh.
- **Thanh Toán Phí Đăng Ký & Kích Hoạt Quyền Bán**:
  - Phí đăng ký được thanh toán $100\%$ trả trước thông qua cổng thanh toán (`payment_transactions` với `type = PROVIDER_SUBSCRIPTION_FEE`).
  - Gói đăng ký tự động chuyển trạng thái `ACTIVE` ngay khi hệ thống nhận webhook thanh toán thành công.

### 2.2. Quy tắc Kiểm Duyệt Hồ Sơ Pháp Lý & An Toàn Thực Phẩm (Compliance & Food Safety Verification)
- **Danh Mục Tài Liệu Bắt Buộc (`store_compliance_docs`)**:
  1. **Giấy chứng nhận An toàn Vệ sinh Thực phẩm (`FOOD_SAFETY_CERT`)**: Bắt buộc với 100% Seller sản xuất/bán bánh.
  2. **Giấy phép Đăng ký Kinh doanh / Hộ kinh doanh (`BUSINESS_LICENSE`)**: Bắt buộc.
  3. **Định danh KYC Đại diện pháp luật (`IDENTITY_KYC`)**: CCCD/Mã định danh cá nhân.
- **Luồng Duyệt Hồ Sơ Của Admin**:
  - Khi Seller nộp file đính kèm, trạng thái tài liệu là `PENDING`.
  - Platform Admin rà soát và chuyển sang `APPROVED` hoặc `REJECTED` (kèm `rejection_reason`).
  - Khi đủ tài liệu cơ bản được `APPROVED`, hệ thống cập nhật `users.is_compliance_approved = true`.

### 2.3. Quy tắc Tạm Ngừng & Khóa Quyền Mở Bán (Auto-Suspension & Safeguard Rules)
- **Chặn Mở Bán Khi Thiếu Compliance**:
  - Seller chưa được duyệt `is_compliance_approved = true` **KHÔNG được phép công khai gian hàng hoặc nhận đơn hàng mới**.
- **Tự Động Tạm Ngừng Khi Giấy Phép / Gói Dịch Vụ Hết Hạn**:
  - Nếu Giấy chứng nhận ATTT (`FOOD_SAFETY_CERT`) hoặc Gói đăng ký SaaS (`provider_subscriptions`) chạm mốc hết hạn (`expiry_date < CURRENT_DATE` hoặc `end_date < CURRENT_DATE`):
    - Hệ thống chuyển trạng thái gói đăng ký sang `SUSPENDED` / `EXPIRED`.
    - Tất cả sản phẩm/dịch vụ biến thể của Provider bị ẩn khỏi Trang tìm kiếm B2C & B2B RFQ.
    - Đơn hàng đã đặt cọc trước đó vẫn tiếp tục được giao, nhưng không được phép phát sinh đơn đặt hàng mới.

---

## 3. Data Flow (Luồng dữ liệu)

```
[Seller Đăng Ký Tài Khoản]
    │
    ├─► 1. Tải lên Hồ sơ Pháp lý (Giấy ATTT, GPKD, CCCD) ──► Admin duyệt (is_compliance_approved = true)
    │
    ├─► 2. Chọn Gói SaaS Provider Subscription (Standard / VIP Top Banner / Exclusive)
    │
    ▼
[Thanh Toán Phí Gói SaaS (VietQR / PayOS)]
    │
    ├─► Nhận Webhook PROVIDER_SUBSCRIPTION_FEE thành công
    │
    ▼
[Kích Hoạt Gói SaaS (Status = ACTIVE)]
    │
    ├─► Niêm yết danh mục Product & ProductVariant (LOOSE_CAKE, BOX_SHELL, GREETING_CARD, ADDON_SERVICE)
    ├─► Bật tính năng nhận đơn B2C & Đấu thầu B2B RFQ
    │
    ▼
[Quản Lý Hạn Gói SaaS & ATTT (Cron Auto-check)]
    ├─► (Nếu hết hạn ATTT/Gói SaaS) ──► Chuyển trạng thái sang SUSPENDED & Tạm ẩn sản phẩm
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không miễn phí gói đăng ký Provider cho bất kỳ thương hiệu nào (100% Seller phải chọn gói đăng ký hợp lệ).
- Không tự động gia hạn gói SaaS khi hết hạn (Seller phải bấm gia hạn và thanh toán chủ động).
