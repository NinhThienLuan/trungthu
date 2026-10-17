# 📜 Business Rule: BR-04 - Dashboard Quản Lý Lịch Sản Xuất & Lịch Ra Lò (Admin Production Calendar - Streamlined MVP)

> Cập nhật 2026-10-16: BE4 sở hữu `v_bake_lines`, BE2 sở hữu API xuất, FE2 in; lifecycle do BE3 theo [hợp đồng Backend](../04-agent-and-dev-guidelines/backend-ownership-and-order-contract.md).

## 1. Goal (Mục tiêu)
Cung cấp cho **Chủ xưởng / Provider (Seller)** công cụ quản lý toàn bộ đơn hàng và lịch ra lò bánh tươi theo ngày Dương Lịch chuẩn, tự động tổng hợp số lượng từng vị bánh cần nướng theo **Ngày Ra Lò (`bake_date`)** và thiết lập hạn ngạch nhận đơn tối đa của xưởng theo phạm vi tinh gọn cho nhóm 6 người trong 4 tuần.

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Quyền Quản Lý & Vận Hành (Seller Access Control)
- **Bên Bán (Seller / Provider)**:
  - Trực tiếp quản lý Dashboard Lịch Sản Xuất theo ngày Dương Lịch, xem chi tiết đơn hàng (người mua, vị bánh chọn, ghi chú in vỏ hộp, ngày nướng và ngày nhận).
  - VIETQR: PENDING_DEPOSIT → DEPOSITED → BAKING_QUEUED → DELIVERING → COMPLETED; COD: CONFIRMED → BAKING_QUEUED → DELIVERING → COMPLETED.
  - Seller gia hạn hold trước hạn một lần +15 phút, bắt buộc lý do. COD không có hold cọc.
  - Xác nhận cọc: Sau khi kiểm tra sao kê ngân hàng cá nhân, Provider bấm nút **"Xác Nhận Đã Nhận Cọc"** để chuyển đơn sang `DEPOSITED`.
  - Thiết lập Hạn ngạch nướng bánh theo ngày (`daily_capacities.max_quantity`) và in **Phiếu Ra Lò Bánh Tươi (Daily Production Sheet)** trực tiếp qua lệnh in trình duyệt.
- **Quản Trị Sàn (Platform Admin)**:
  - Giám sát toàn bộ hoạt động giao dịch và xử lý các vi phạm của Provider trên sàn.

### 2.2. Hiển Thị Lịch Dương Lịch Chuẩn (Solar-First Core)
- **Quy tắc Kỹ thuật (Solar-First Core)**: Toàn bộ hệ thống Backend, CSDL, API, Hạn ngạch xưởng (`max_quantity`) và Ngày giao bánh hoạt động **100% theo Ngày Dương Lịch chuẩn (`LocalDate` - `YYYY-MM-DD`)**.
- **Nhãn Âm Lịch**: Được xếp vào nhóm tính năng mở rộng (`Phase 2 / Optional`). Dương Lịch là căn cứ duy nhất để vận hành và kiểm tra logic nghiệp vụ.

### 2.3. Quy Tắc Ngày Ra Lò vs Ngày Nhận & Gom Đơn (Bake Date vs Delivery Date Aggregation)
- **Quy tắc chuyển đổi Ngày Ra Lò**:
  $$\text{bake\_date} = \text{expected\_delivery\_date} - 1$$
- **Tự động gom đơn xuất Kế hoạch sản xuất (Daily Production Sheet)**:
  - Khi xem kế hoạch cho ngày `bake_date` bất kỳ, đọc view `v_bake_lines` theo Provider hiện tại; loại PENDING_DEPOSIT/CANCELLED. Set đóng sẵn báo theo SKU/set và số bánh/set, không đoán vị bên trong khi chưa có định mức. Công thức phân rã từng vị bên dưới chỉ áp dụng khi có dữ liệu thành phần (Phase 2):
    - Hệ thống tự động thực hiện truy vấn SQL gom tất cả các đơn hàng có $\text{expected\_delivery\_date} = \text{bake\_date} + 1$.
    - Tổng hợp ra **Bản Kế Hoạch Ra Lò (Daily Bake Matrix)**:
      $$\text{Tổng Bánh Vị X} = \sum (\text{Bánh lẻ vị X}) + \sum (\text{Bánh vị X trong Hộp quà B2C})$$
    - Hỗ trợ in nhanh ra giấy bằng CSS `@media print` của trình duyệt. **Không tạo bảng lưu trữ `production_batches` riêng** để tối ưu hóa thời gian phát triển.

### 2.4. Quản Lý Hạn Ngạch Sản Xuất Tối Đa (Daily Production Capacity Cap)
- Provider cài đặt **Số lượng chiếc bánh tối đa xưởng có thể nướng trong 1 ngày ra lò** (`daily_capacities.max_quantity` áp dụng cho `bake_date`).
- Khi tổng số bánh đã đặt (`reserved_quantity`) cho ngày `bake_date` đạt $100\%$ hạn ngạch:
  - Ngày nhận bánh tương ứng (`bake_date + 1`) trên lịch đặt hàng B2C sẽ tự động bị khóa (`is_locked = true`), chuyển sang trạng thái **"FULL - Đã kín hạn ngạch nướng"**.

### 2.5. Phạm Vi Giao Hàng & Phí Vận Chuyển (Shipping Fee Management)
- **Out of Scope (Không thực hiện)**: Không xây dựng app tài xế/shipper, không định vị GPS lộ trình thời gian thực.
- **In Scope (Thực hiện)**:
  - Phí giao hàng được áp dụng theo mức cấu hình phẳng (flat shipping fee) của Provider và lưu trực tiếp vào trường `orders.shipping_fee`.

### 2.6. Công Tắc Nhận Đơn Thủ Công (Manual Store Toggle)
- **Tên thuộc tính chuẩn hóa**: `users.is_season_active` (boolean, mặc định `true`).
- **Quy tắc không khóa tự động**: Hệ thống không tự động khóa gian hàng khi hết mùa vụ. Việc đóng/mở gian hàng hoàn toàn do Provider tự quyết định.
- **Khi Provider gạt tắt (`is_season_active = false`)**:
  - Nút đặt hàng trên giao diện chuyển sang trạng thái `[ Tạm Ngừng Nhận Đơn ]`.

---

## 3. Data Flow (Luồng dữ liệu Admin Calendar)

```
[Đơn Hàng B2C]
    │
    ▼ Lưu Ngày Nhận (expected_delivery_date)
[Hệ Thống Tính Toán Ngày Ra Lò]
    │
    ├─► bake_date = expected_delivery_date - 1
    ├─► Cộng dồn reserved_quantity vào daily_capacities tại bake_date
    ├─► Nếu reserved_quantity >= max_quantity ──► Khóa ngày nhận (is_locked = true)
    │
    ▼
[Dashboard Admin Provider - Tab Kế Hoạch Ra Lò]
    │
    ├─► Chọn ngày bake_date
    ├─► BE2 đọc v_bake_lines của BE4, gom SKU/set của đơn hợp lệ theo bake_date
    └─► Bấm nút In Phiếu Ra Lò (CSS @media print)
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không kết nối IoT trực tiếp tới lò nướng công nghiệp.
- Không tự động quản lý ca kíp của thợ làm bánh.
- Bỏ bảng `production_batches`, `seasonal_waitlists`, `shipping_rates`.
