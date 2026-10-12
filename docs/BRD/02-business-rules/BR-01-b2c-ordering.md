# 📜 Business Rule: BR-01 - Đặt Hàng B2C & Giỏ Hàng Tách Đơn Theo Provider (B2C Ordering & Split Orders)

## 1. Goal (Mục tiêu)
Cho phép khách hàng cá nhân (B2C) lựa chọn mua các sản phẩm bánh lẻ (`LOOSE_CAKE`) hoặc các set hộp quà Trung Thu đóng sẵn tiêu chuẩn (`BOX_SHELL`) từ nhiều xưởng khác nhau. Hệ thống hỗ trợ **Giỏ Hàng Chung Đa Provider**, và tự động tách thành các Đơn Hàng con độc lập theo từng Provider lúc Checkout (**Hướng A**), chọn ngày nhận bánh tươi và đặt hàng trực tuyến với quy tắc đặt cọc VietQR trực tiếp.

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Quy tắc Giỏ Hàng Đa Provider & Tách Đơn Lúc Checkout (Approach A - Split Orders)
- **Giỏ Hàng Chung**: Khách hàng được tự do duyệt sản phẩm trên sàn và nhặt sản phẩm của nhiều xưởng (Provider A, Provider B) vào chung một Giỏ Hàng (`Cart`).
- **Tự Động Tách Đơn Lúc Checkout**:
  - Khi khách nhấn "Tiến Hành Đặt Hàng", hệ thống tự động phân tách giỏ hàng thành các **Đơn Hàng con độc lập (`Order`)** theo từng `provider_id`.
  - Mỗi Đơn Hàng con vận hành độc lập:
    - Có mã đơn hàng riêng (`order_code`).
    - Tính phí vận chuyển riêng theo xưởng (`shipping_fee`).
    - Tính số tiền cọc riêng (`deposit_amount`).
    - Hiển thị mã ảnh VietQR chuyển tiền trực tiếp tới số tài khoản ngân hàng của Provider đó.

### 2.2. Quy tắc Biến Thể Sản Phẩm & Hạn Sử Dụng Bánh Tươi (Product Variant & Fresh Shelf Life)
- Sản phẩm được quản lý theo mô hình **Product & ProductVariant**:
  - `Product`: Dòng sản phẩm ("Bánh Thập Cẩm Gà Quay", "Hộp Quà Đoàn Viên"), loại sản phẩm (`LOOSE_CAKE`, `BOX_SHELL`, `GREETING_CARD`, `ADDON_SERVICE`), HSD bánh tươi (`shelf_life_days`).
  - `ProductVariant`: Mã SKU, trọng lượng (150g, 200g, 250g), dung tích vỏ hộp (Set 2, 4, 6), đơn giá (`price`), tồn kho (`stock_quantity`).
- **Hiển thị Hạn Sử Dụng (Shelf Life Display)**:
  - Bánh dẻo tươi: **7 - 10 ngày**.
  - Bánh nướng tươi: **10 - 15 ngày**.
  - Luôn hiển thị khuyến cáo HSD tính từ **Ngày Ra Lò (`bake_date`)**.

### 2.3. Quy tắc Hộp Quà Chuẩn Trong MVP vs Tự Phối Custom Box Trong Phase 2
- **Trong MVP**: Khách hàng mua các Set hộp quà đóng sẵn tiêu chuẩn (sản phẩm hoàn chỉnh) hoặc bánh lẻ mua theo số lượng thông qua bảng `order_items`.
- **Trong Phase 2 (`custom_boxes`, `custom_box_items`)**: Mở rộng tính năng tự phối hộp quà (khách chọn vỏ hộp 2, 4, 6 ô rồi tự gắp từng vị bánh vào ô slot) và Live Preview in tên/lời chúc lên vỏ hộp bằng CSS Absolute Overlay.

### 2.4. Quy tắc Ngày Ra Lò & Lịch Giao Bánh Tươi (Bake Date vs Delivery Date Rule)
- **Ràng buộc Ngày Nhận (Delivery Lead-Time)**:
  - Ngày nhận bánh Dương lịch (`expected_delivery_date`) phải sau ngày đặt hàng tối thiểu **3 ngày** (`expected_delivery_date >= CURRENT_DATE + 3`).
  - **MVP Chặn Cứng**: Tuyệt đối **không nhận đơn giao khẩn cấp $< 3$ ngày** (chặn cứng tại cả Frontend lẫn Backend). Không có đơn same-day/rush trong MVP.
- **Quy tắc Tính Ngày Ra Lò (Bake Date Calculation)**:
  $$\text{bake\_date} = \text{expected\_delivery\_date} - 1$$
  - Xưởng nướng bánh trước ngày khách nhận đúng 1 ngày.
  - Slot hạn ngạch nướng xưởng (`daily_capacities`) và Phiếu Ra Lò (Daily Production Sheet) được tính toán, kiểm tra và trừ trực tiếp vào ngày **`bake_date`**.
  - Nếu ngày `bake_date` của xưởng đã kín 100% hạn ngạch (`capacity_cap`), ngày nhận tương ứng của xưởng đó sẽ bị mờ trên giao diện chọn ngày.

### 2.5. Quy tắc Giữ Chỗ 15 Phút & Tự Động Hoàn Trả (Hold Reservation & Auto-Release)
- Khi khách bấm tạo đơn hàng con, đơn chuyển sang trạng thái `PENDING_DEPOSIT` và hệ thống tạm giữ tồn kho cũng như cộng dồn `daily_capacities.reserved_quantity` theo `bake_date`.
- Thời gian giữ chỗ tối đa là **15 phút**.
- Nếu sau 15 phút Seller chưa bấm xác nhận cọc hoặc khi đơn bị hủy (`CANCELLED`):
  - Tiến trình `@Scheduled` tự động chuyển trạng thái đơn sang `CANCELLED`.
  - Tự động hoàn trả số lượng tồn kho của các biến thể bánh.
  - Tự động giảm trừ số lượng đã đặt trên hạn ngạch xưởng của ngày `bake_date`.

---

## 3. Data Flow (Luồng Đặt Hàng & Tách Đơn Hướng A)

```
[Khách Hàng Chọn Sản Phẩm Đa Xưởng Vào Cart]
    │
    ▼ Khách Bấm "Tiến Hành Đặt Hàng"
[Hệ Thống Tự Động Tách Giỏ Hàng (Split Orders)]
    │
    ├─► Đơn Hàng Con 1 (Provider A):
    │      ├─► Tính Ngày Nướng bake_date = delivery_date - 1
    │      ├─► Giữ chỗ 15 phút tại DailyCapacity của Provider A
    │      └─► Sinh ảnh VietQR trực tiếp tới STK Ngân Hàng của Provider A
    │
    └─► Đơn Hàng Con 2 (Provider B):
           ├─► Tính Ngày Nướng bake_date = delivery_date - 1
           ├─► Giữ chỗ 15 phút tại DailyCapacity của Provider B
           └─► Sinh ảnh VietQR trực tiếp tới STK Ngân Hàng của Provider B
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không gộp nhiều xưởng vào chung 1 đơn con (tránh xung đột nướng và xung đột tài khoản nhận tiền).
- Tính năng tự gắp bánh vào ô slot Custom Box dời sang Phase 2.
