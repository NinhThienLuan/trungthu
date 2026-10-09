# 📜 Business Rule: BR-01 - Đặt Hàng Cá Nhân & Tùy Chỉnh Hộp Quà (B2C Custom Box Ordering)

## 1. Goal (Mục tiêu)
Cho phép khách hàng cá nhân (B2C) dễ dàng lựa chọn mua các biến thể bánh lẻ (`LOOSE_CAKE` variants: 150g, 200g, 250g) hoặc tự cấu hình bộ hộp quà Trung Thu (`BOX_SHELL` variants: Set 2, 4, 6 bánh), điền thông tin in ấn/tùy chỉnh tên tổ chức/lời chúc lên vỏ hộp, **lựa chọn đợt giao bánh tươi ra lò (`order_batches`)** và thực hiện đặt hàng trực tuyến.

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Quy tắc Biến Thể Sản Phẩm & Hạn Sử Dụng Bánh Tươi (Product Variant & Fresh Shelf Life Rule)
- Sản phẩm được quản lý theo mô hình **Product & ProductVariant**:
  - `Product`: Tên dòng sản phẩm ("Bánh Thập Cẩm Gà Quay", "Thiệp Ép Kim"), loại sản phẩm/dịch vụ (`LOOSE_CAKE`, `BOX_SHELL`, `GREETING_CARD`, `ADDON_SERVICE`), HSD bánh tươi (`shelf_life_days`).
  - `ProductVariant`: Mã SKU, biến thể trọng lượng (150g, 200g, 250g), dung tích vỏ hộp (Set 2, 4, 6), mẫu thiệp hoặc phí dịch vụ đi kèm (thắt nơ/gói quà), giá bán (`price`), tồn kho (`stock_quantity`).
- **Hiển thị Hạn Sử Dụng (Shelf Life Display)**:
  - Mọi bánh tươi hiển thị rõ HSD tính từ ngày ra lò sản xuất:
    - Bánh dẻo tươi: **7 - 10 ngày**.
    - Bánh nướng tươi: **10 - 15 ngày**.
  - Ngày giao bánh Dương lịch phải đảm bảo cách ngày sản xuất không quá 24-48 giờ để giữ độ tươi ngon nhất.

### 2.2. Quy tắc Tùy Chỉnh Hộp Quà Biến Thể (Custom Box Rule)
- **Chọn Vỏ Hộp Biến Thể**: Khách chọn 1 trong các dung tích vỏ hộp biến thể cố định:
  - `BOX-SET-2`: Hộp chứa đúng 2 chiếc bánh (hỗ trợ bánh 150g-200g).
  - `BOX-SET-4`: Hộp chứa đúng 4 chiếc bánh (hỗ trợ bánh 150g-250g).
  - `BOX-SET-6`: Hộp chứa đúng 6 chiếc bánh (hỗ trợ bánh 150g-200g).
- **Ghép Biến Thể Bánh Vào Ô Slot Hộp**:
  - Khách hàng phải chọn đủ số lượng biến thể bánh tương ứng với dung tích vỏ hộp (`custom_box_items`).
  - Cho phép chọn trùng biến thể bánh (VD: 4 chiếc biến thể 200g Thập Cẩm trong 1 hộp 4).
- **Tính Giá Hộp Quà**:
  $$\text{Tổng giá Hộp Quà} = \text{Giá Vỏ Hộp Variant} + \sum (\text{Giá các Biến Thể Bánh Lẻ}) + \text{Phí Personalize (nếu có)}$$

### 2.3. Quy tắc In Tên Tổ Chức / Cá Nhân Lên Vỏ Hộp (Box Personalization & Live Preview)
- Cung cấp ô nhập liệu **"Nội dung in lên vỏ hộp"** (tối đa 50 ký tự) và **"Thiệp chúc mừng"** (tối đa 150 ký tự).
- **CSS Absolute Overlay Live Preview**: Hiển thị dòng chữ in đè trực tiếp lên ảnh phôi vỏ hộp PNG bằng vị trí tọa độ tuyệt đối CSS (`position: absolute`), mượt mà 60fps trên di động.
- **Validation Tồn Kho 2 Cấp Tại Bước Checkout**: Hệ thống validate tồn kho biến thể 2 cấp (`Vỏ Hộp Variant > 0` AND `Bánh Lẻ Variant >= N`) tại thời điểm bấm Checkout.

### 2.4. Quy tắc Tách Đợt Giao Hàng & Chọn Ngày Giao Bánh Tươi (Order Batching & Schedule Rule)
- Đơn hàng B2C có thể bao gồm **1 hoặc nhiều Đợt giao hàng (`order_batches`)** tới các ngày Dương lịch khác nhau hoặc địa điểm nhận khác nhau.
- Đối với mỗi đợt giao:
  - **Điều kiện ngày giao**: Ngày nhận bánh Dương lịch (`expected_delivery_date`) phải nằm trong mùa vụ Trung Thu và cách ngày đặt tối thiểu **3 ngày** để xưởng xếp lịch nướng bánh (`daily_capacities`).
  - Hệ thống tự động quy đổi và hiển thị nhãn Âm Lịch tham khảo: `[Ngày Dương] (Tham khảo: [Ngày Âm])`.

---

## 3. Data Flow (Luồng dữ liệu)

```
[Khách Hàng B2C] 
    │
    ├─► Chọn Biến Thể Bánh Lẻ (150g/200g/250g) hoặc Vỏ Hộp (Set 2/4/6)
    ├─► Ghép các biến thể bánh vào ô slot Hộp Custom (nếu chọn mua hộp)
    ├─► Nhập Văn Bản In Tên Vỏ Hộp / Thiệp Chúc (Live Preview CSS 60fps)
    │
    ▼
[Chia Đợt Giao Hàng (Order Batches)]
    │
    ├─► Chọn Ngày Nhận Bánh Tươi Dương Lịch (Min: Current + 3 days)
    ├─► Hiển thị nhãn Âm Lịch tham khảo
    │
    ▼
[Checkout & Validate Tồn Kho 2 Cấp Biến Thể]
    │
    ├─► Đặt cọc 50% / Thanh toán qua VietQR / PayOS
    └─► Giữ chỗ Hạn ngạch nướng (DailyCapacity) theo từng Đợt giao hàng
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không giao bánh tươi ngay trong ngày (Same-day delivery) do bánh tươi sản xuất theo đợt ra lò thủ công.
- Không áp dụng chính sách chiết khấu sỉ cho đơn B2C lẻ dưới 20 hộp.
