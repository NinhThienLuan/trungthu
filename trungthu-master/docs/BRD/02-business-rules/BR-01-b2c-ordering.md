# 📜 Business Rule: BR-01 - Đặt Hàng B2C & Giỏ Hàng Tách Đơn Theo Provider (B2C Ordering & Split Orders)

> Cập nhật 2026-10-16: Cho phép giỏ đa Provider. Transaction, COD và gia hạn hold tuân theo [hợp đồng Backend](../04-agent-and-dev-guidelines/backend-ownership-and-order-contract.md).

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
    - VIETQR hiển thị mã chuyển khoản riêng; COD hợp lệ không có QR.
  - Không có Order cha đa Provider; `checkout_id` chỉ liên kết các đơn cùng lần đặt. MVP mỗi Order có đúng một OrderBatch giao hàng.

### 2.2. Quy tắc Biến Thể Sản Phẩm (Product & ProductVariant)
- Sản phẩm được quản lý theo mô hình **Product & ProductVariant**:
  - `Product`: Dòng sản phẩm ("Bánh Thập Cẩm Gà Quay", "Hộp Quà Đoàn Viên"), loại sản phẩm (`LOOSE_CAKE`, `BOX_SHELL`, `GREETING_CARD`, `ADDON_SERVICE`).
  - `ProductVariant`: Mã SKU, trọng lượng (150g, 200g, 250g), dung tích vỏ hộp (Set 2, 4, 6), đơn giá (`price`), tồn kho (`stock_quantity`).

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
  - Nếu ngày `bake_date` của xưởng đã kín 100% hạn ngạch (`max_quantity`), ngày nhận tương ứng của xưởng đó sẽ bị mờ trên giao diện chọn ngày.

### 2.5. Hold, COD và gia hạn
- VIETQR: tạo `PENDING_DEPOSIT`, giữ stock/capacity theo `bake_date`, `hold_expires_at = ordered_at + 15 phút`.
- COD hợp lệ: đơn tiêu chuẩn không in riêng, tổng từng Order < 2 triệu; cọc 0, `CONFIRMED`/`UNPAID`, vẫn giữ tài nguyên, không có deadline và không bị cron hold hủy.
- Seller sở hữu được gia hạn hold một lần thêm 15 phút vào deadline hiện tại (trần 30 phút từ lúc đặt), trước hạn, có lý do và audit. Không cho Buyer tự gia hạn hoặc gia hạn bằng tải lại QR.
- `now >= hold_expires_at`: chặn xác nhận cọc/gia hạn; cron mỗi phút hủy đơn chờ cọc, hoàn stock và giảm reserved capacity đúng một lần trong cùng transaction.
- Xác nhận cọc/hủy/gia hạn/cron phải khóa cùng Order và kiểm tra lại trạng thái, deadline sau khóa.

### 2.6. Transaction Checkout đa Provider
- BE3 điều phối một transaction cho toàn bộ Checkout. BE2 reserve stock/capacity; BE4 tách nhóm và lưu Order/Batch/Item/giao dịch, cùng tham gia transaction này.
- Một Provider thiếu stock/slot hoặc bất kỳ bước lưu lỗi: rollback toàn bộ, không giữ đơn thành công từng phần. Preview không giữ tài nguyên; submit phải kiểm tra lại.
- Sau commit, các Order độc lập. Hủy/hết hạn một Order không ảnh hưởng các Order khác. URL QR được dựng từ dữ liệu ngân hàng, không gọi mạng trong transaction.

### 2.7. Luồng trạng thái
- VIETQR: `PENDING_DEPOSIT → DEPOSITED → BAKING_QUEUED → DELIVERING → COMPLETED`.
- COD: `CONFIRMED → BAKING_QUEUED → DELIVERING → COMPLETED`.
- Hủy thường chỉ từ `PENDING_DEPOSIT` hoặc `CONFIRMED` COD trước sản xuất; không tự hủy/hoàn tiền đơn đã cọc.
- Hoàn thành chỉ khi đã thu đủ tiền; xác nhận cọc/COD không trừ kho hoặc slot lần hai. Chi tiết payment status và cạnh tranh xem hợp đồng Backend.


---

## 3. Data Flow (Luồng Đặt Hàng & Tách Đơn Hướng A)

```
[Khách Hàng Chọn Sản Phẩm Đa Xưởng Vào Cart]
    │
    ▼ Khách Bấm "Tiến Hành Đặt Hàng"
[BE3 mở một transaction: BE2 reserve, BE4 tách/lưu; tất cả cùng commit hoặc rollback]
    │
    ├─► Đơn Hàng Con 1 (Provider A):
    │      ├─► Tính Ngày Nướng bake_date = delivery_date - 1
    │      ├─► Reserve stock/capacity Provider A (VIETQR: hold 15 phút; COD: CONFIRMED)
    │      └─► Dựng URL VietQR nếu chọn VIETQR, COD không có QR; Provider A
    │
    └─► Đơn Hàng Con 2 (Provider B):
           ├─► Tính Ngày Nướng bake_date = delivery_date - 1
           ├─► Reserve stock/capacity Provider B (VIETQR: hold 15 phút; COD: CONFIRMED)
           └─► Dựng URL VietQR nếu chọn VIETQR, COD không có QR; Provider B
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không gộp nhiều xưởng vào chung 1 đơn con (tránh xung đột nướng và xung đột tài khoản nhận tiền).
- Tính năng tự gắp bánh vào ô slot Custom Box dời sang Phase 2.
