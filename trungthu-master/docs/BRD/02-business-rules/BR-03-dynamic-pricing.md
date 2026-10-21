# 📜 Business Rule: BR-03 - Chính Sách Giá Biến Động & Phí Phụ Thu Theo Thời Gian (Dynamic Pricing & Surcharges)

## 1. Goal (Mục tiêu)
Định nghĩa cơ chế tính toán giá bán, các loại phụ phí in ấn tùy chỉnh, phí vận chuyển theo khu vực, và cấu hình chiến dịch giá linh hoạt (Dynamic Pricing).

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Biến Động Giá Theo Mùa Vụ (Seasonality Matrix - Chế Độ Chiến Dịch Phase 2)

> [!NOTE]
> **Quy tắc MVP**: Mặc định áp dụng **Đơn giá niêm yết chuẩn (Hệ số mùa vụ $= 0.0$)** quanh năm.
> Bảng hệ số bên dưới là **tính năng tùy chọn theo chiến dịch (Campaign Toggle - Phase 2)** do Admin hoặc Provider tự kích hoạt khi bước vào đợt cao điểm hoặc khuyến mãi:

$$\text{Giá Bán Cơ Bản} = \text{Giá Niêm Yết} \times (1 + \text{Hệ Số Mùa Vụ})$$

| Giai Đoạn Chiến Dịch | Khung Thời Gian Tham Khảo (Âm Lịch) | Mức Giá / Hệ Số (Tùy Chọn) | Ghi Chú Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| **Giai Đoạn Đặt Sớm (Early Bird)** | 01/07 - 15/07 Âm lịch | **Giảm 10% - 15%** (Hệ số -0.10 đến -0.15) | Khuyến khích đặt sớm khi kích hoạt chiến dịch. |
| **Giai Đoạn Tiêu Chuẩn (Mặc định)** | Quanh năm | **Giá Niêm Yết (100%)** (Hệ số 0.0) | Mặc định vận hành trong MVP. |
| **Giai Đoạn Cao Điểm Gấp (Rush Peak)** | 06/08 - 14/08 Âm lịch | **Phụ thu 10% - 20%** (Hệ số +0.10 đến +0.20) | Chỉ áp dụng khi xưởng quá tải và chủ động kích hoạt. |
| **Giai Đoạn Xả Hàng (Post-Festival)** | Sau rằm Trung Thu | **Giảm 30% - 50%** (Dành cho bánh lẻ có sẵn) | Xả hàng tồn kho bánh có sẵn (tùy chọn). |

---

### 2.2. Công Thức Tính Tổng Giá Đơn Hàng Chuẩn (Order Total Calculation Formula)

$$\text{Tổng Giá Đơn Hàng} = (\text{Giá Bánh} + \text{Giá Vỏ Hộp}) \times (1 + \text{Hệ Số Mùa Vụ}) + \text{Phí Customize} + \text{Phí Vận Chuyển}$$

Trong đó:
- **`Giá Bánh`**: Tổng đơn giá niêm yết của các biến thể bánh lẻ được chọn.
- **`Giá Vỏ Hộp`**: Đơn giá biến thể vỏ hộp quà (Set 2, Set 4, Set 6).
- **`Hệ Số Mùa Vụ`**: Mặc định $= 0.0$ trong MVP (nếu không bật chiến dịch).

---

### 2.3. Các Yếu Tố Phụ Phí Chi Tiết (Surcharge Factors)

#### Yếu tố 1: Ràng Buộc Thời Gian Đặt Hàng (Delivery Lead Time)
- **Giao Tiêu Chuẩn ($\ge 3$ ngày kể từ lúc đặt)**: Áp dụng đơn giá chuẩn + Phí vận chuyển tiêu chuẩn.
- **Yêu Cầu Giao Gấp $< 3$ ngày (24h - 48h)**:
  - **Quy tắc MVP**: **Chặn cứng tuyệt đối (Strict Block)**. Hệ thống không cho phép chọn ngày nhận $< 3$ ngày để bảo đảm chất lượng bánh tươi thủ công.
  - **Quy tắc Phase 2**: Mở rộng hỗ trợ tính năng Đặt Gấp kèm phụ thu **Phí Sản Xuất Ưu Tiên (Rush Production Fee)** $+50.000$ VNĐ/hộp.

#### Yếu tố 2: Mức Độ Customize & In Tên/Logo (Personalization Surcharge)
- **In chữ tiêu chuẩn lên vỏ hộp (Text Personalization - MVP)**:
  - Đơn B2C lẻ từ 1 đến 4 hộp: Phí in $20.000$ VNĐ / hộp.
  - Đơn B2C $\ge 5$ hộp: **Miễn phí** in chữ lên vỏ hộp.
- **In Logo Doanh Nghiệp (B2B Custom Logo Printing - Phase 2)**:
  - Doanh nghiệp tải logo lên form RFQ, chi phí in khuôn logo do Provider tự thỏa thuận trong báo giá riêng.

#### Yếu tố 3: Phí Vận Chuyển Theo Khu Vực (Shipping Fee - In Scope MVP)
- Tính phí vận chuyển dựa trên địa chỉ giao hàng (Quận/Huyện/Tỉnh thành) do Provider cấu hình trong bảng cước phí.
- Hiển thị thành một dòng phí riêng biệt trên hóa đơn đơn hàng.

#### Yếu tố 4: Chiết Khấu Sỉ Số Lượng Lớn (Volume Tier Discount - B2B)
- **Quy tắc MVP**: Đối với các đơn sỉ $\ge 20$ hộp, khách gửi B2B RFQ và nhận mức chiết khấu thương lượng trực tiếp từ Provider.
- **Quy tắc Phase 2**: Hệ thống cho phép Provider cấu hình khung chiết khấu tự động trên sàn ($\ge 50$ hộp giảm 10%, $\ge 100$ hộp giảm 18%).

---

## 3. Data Flow (Luồng tính giá đơn hàng)

```
[Người Dùng Chọn Sản Phẩm]
    │
    ├─► Lấy Đơn Giá Niêm Yết Biến Thể Bánh & Vỏ Hộp
    ├─► Kiểm tra Hệ số Mùa Vụ (Mặc định: 1 + 0.0 = 1.0)
    ├─► Kiểm tra Tùy chọn In Tên Vỏ Hộp:
    │      ├─► NẾU Số lượng < 5 hộp ──► Cộng 20.000 VNĐ / hộp
    │      └─► NẾU Số lượng >= 5 hộp ──► Miễn phí in tên (0 VNĐ)
    ├─► Tính Phí Vận Chuyển theo Quận/Huyện giao hàng
    │
    ▼
[Bảng Tính Giá Chi Tiết (Price Breakdown)]
    ├─► Tiền hàng (Bánh + Hộp)
    ├─► Phí In Tên Cá Nhân Hóa
    ├─► Phí Vận Chuyển
    └─► TỔNG TIỀN THANH TOÁN (total_amount)
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không nhận đơn giao hỏa tốc cùng ngày hoặc dưới 3 ngày trong MVP.
- Không tự động tăng giá bất hợp pháp vượt quá 30% so với giá niêm yết công khai.
