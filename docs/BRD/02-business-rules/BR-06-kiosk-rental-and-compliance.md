# 📜 Business Rule: BR-06 - Đăng Ký Gói Dịch Vụ SaaS Provider & Quản Lý Hồ Sơ Pháp Lý (Provider SaaS Subscription & Compliance - Streamlined MVP)

## 1. Goal (Mục tiêu)
Quy định chi tiết mô hình kinh doanh **Pure Provider SaaS Model**: các gói dịch vụ SaaS đăng ký cho Provider/Nhà sản xuất, thời hạn hiển thị, phân quyền niêm yết SKU, và quy trình kiểm duyệt bắt buộc đối với Hồ sơ Pháp lý Cửa hàng (Giấy chứng nhận ATTP, Giấy phép ĐKKD, Định danh KYC) theo phạm vi tinh gọn cho nhóm 6 người trong 4 tuần.

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Quy tắc Gói Đăng Ký Provider SaaS (`provider_subscriptions`)
- **Cấu hình Đăng Ký**: Mỗi Provider khi tham gia Sàn phải đăng ký và duy trì ít nhất **1 Gói dịch vụ SaaS hoạt động (`ACTIVE`)**.
- **Các Gói Đăng Ký SaaS Provider (Subscription Packages)**:
  - **Gói Tiêu Chuẩn (`STANDARD` - MVP Scope)**:
    - Mức phí đăng ký: $1.000.000$ VNĐ / thời hạn 3 tháng (90 ngày).
    - Giới hạn niêm yết tối đa: **20 biến thể SKU** (`max_products_allowed = 20`).
    - Quyền lợi: Mở gian hàng trên sàn, hiển thị sản phẩm trong danh mục tìm kiếm chung, tiếp nhận đơn B2C lẻ/custom và nhận thông báo B2B RFQ.
  - **Gói VIP Nổi Bật (`VIP` - MVP Scope)**:
    - Mức phí đăng ký: $3.000.000$ VNĐ / thời hạn 3 tháng (90 ngày).
    - Giới hạn niêm yết tối đa: **100 biến thể SKU** (`max_products_allowed = 100`).
    - Quyền lợi: Toàn bộ quyền lợi gói Tiêu chuẩn + Được gắn cờ `is_featured = true` hiển thị ưu tiên ở đầu danh sách gian hàng.
- **Thanh Toán Phí Đăng Ký SaaS & Đối Soát Thủ Công**:
  - Provider thực hiện chuyển khoản phí dịch vụ trực tiếp vào tài khoản ngân hàng của Sàn (Platform Admin) với cú pháp nội dung `SUB-[SellerId]`. Giao dịch ghi nhận loại `SUBSCRIPTION_FEE` ở trạng thái `PENDING`.
  - Platform Admin kiểm tra sao kê ngân hàng và bấm nút "Xác Nhận Kích Hoạt Gói" trên Dashboard Admin $\rightarrow$ Chuyển trạng thái gói sang `ACTIVE`. Không sử dụng webhook tự động để đơn giản hóa kiến trúc và hạn chế phụ thuộc bên thứ ba.

### 2.2. Quy tắc Kiểm Duyệt Hồ Sơ Pháp Lý & An Toàn Thực Phẩm (Compliance & Food Safety Verification)
- **Danh Mục Tài Liệu Bắt Buộc (`store_compliance_docs`)**:
  - Provider tải lên hồ sơ pháp lý qua 1 form upload chung (chấp nhận `.pdf`, `.png`, `.jpg` $\le 10\text{MB}$) bao gồm Giấy chứng nhận ATTP và Giấy phép ĐKKD/CCCD.
- **Luồng Duyệt Hồ Sơ Của Admin**:
  - Khi Provider nộp file, trạng thái tài liệu là `PENDING`.
  - Platform Admin rà soát và chuyển sang `APPROVED` hoặc `REJECTED` (kèm `rejection_reason`).
  - Khi tài liệu được `APPROVED`, hệ thống cập nhật `users.is_compliance_approved = true`.

### 2.3. Quy tắc Tạm Ngừng & Khóa Quyền Mở Bán (Auto-Suspension & Safeguard Rules)
- **Chặn Mở Bán Khi Thiếu Compliance (MVP Scope)**:
  - Provider chưa được duyệt `is_compliance_approved = true` hoặc chưa có gói SaaS `ACTIVE` **bị chặn tuyệt đối quyền xuất bản sản phẩm ra ngoài sàn và không nhận được B2B RFQ**.
- **Tự Động Tạm Ngừng Khi Hết Hạn (Phase 2 Scope)**:
  - Tiến trình nền tự động rà soát hàng ngày: nếu Giấy ATTP hoặc Gói SaaS chạm mốc hết hạn (`expiry_date < CURRENT_DATE` hoặc `end_date < CURRENT_DATE`), hệ thống chuyển trạng thái sang `SUSPENDED` (Dời sang Phase 2).

---

## 3. Data Flow (Luồng dữ liệu)

```
[Provider Đăng Ký Tài Khoản]
    │
    ├─► 1. Tải lên Hồ sơ Pháp lý (Form upload KYC chung) ──► Admin duyệt (is_compliance_approved = true)
    │
    ├─► 2. Chọn Gói SaaS Provider (STANDARD - 20 SKU hoặc VIP - 100 SKU)
    │
    ▼
[Chuyển Khoản Phí SaaS Cho Admin Sàn]
    │
    ├─► Provider chuyển khoản với cú pháp SUB-[SellerId]
    ├─► Platform Admin đối soát sao kê và bấm "Xác Nhận Kích Hoạt Gói"
    │
    ▼
[Kích Hoạt Gói SaaS (Status = ACTIVE)]
    │
    ├─► Niêm yết danh mục Product & ProductVariant
    ├─► Bật tính năng nhận đơn B2C & Tiếp nhận B2B RFQ
    │
    ▼
[Vận Hành Gian Hàng]
    └─► Điều khiển nhận đơn qua công tắc thủ công: users.is_season_active (true/false)
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không miễn phí gói dịch vụ SaaS cho bất kỳ thương hiệu nào (100% Provider phải đăng ký gói hợp lệ).
- Không tự động gia hạn gói SaaS (Provider chủ động bấm gia hạn và thanh toán).
- Bỏ hạng gói `EXCLUSIVE_POPUP` và logic quảng cáo carousel phức tạp trong MVP.
