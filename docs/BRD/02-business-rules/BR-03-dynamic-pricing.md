# 📜 Business Rule: BR-03 - Chính Sách Giá Biến Động & Phí Phụ Thu Theo Thời Gian (Dynamic Pricing & Surcharges)

## 1. Goal (Mục tiêu)
Định nghĩa cơ chế tính giá linh hoạt (Dynamic Pricing) dựa trên thời điểm đặt hàng, thời gian nhận hàng (giao thường vs giao hỏa tốc), cấp độ mùa vụ và các yếu tố tùy chỉnh sản phẩm.

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Biến Động Giá Theo Khung Thời Gian Mùa Vụ (Seasonality Pricing Matrix)

$$\text{Giá Bán Cơ Bản} = \text{Giá Niêm Yết} \times (1 + \text{Hệ Số Mùa Vụ})$$

| Giai Đoạn Mùa Vụ | Khung Thời Gian (Âm Lịch) | Mức Giá / Hệ Số | Lý Do Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| **Giai Đoạn Đặt Sớm (Early Bird)** | 01/07 - 15/07 Âm lịch | **Giảm 10% - 15%** (Hệ số -0.10 đến -0.15) | Khuyến khích đặt sớm, giúp xưởng chủ động lên kế hoạch nguyên liệu & nhân công. |
| **Giai Đoạn Tiêu Chuẩn (Standard)** | 16/07 - 05/08 Âm lịch | **Giá Niêm Yết (100%)** (Hệ số 0.0) | Nhu cầu mua sắm bắt đầu tăng đều, công suất xưởng hoạt động ổn định. |
| **Giai Đoạn Cao Điểm Gấp (Rush Peak)** | 06/08 - 14/08 Âm lịch (7 ngày trước Rằm) | **Phụ thu 10% - 20%** (Hệ số +0.10 đến +0.20) | Xưởng quá tải công suất, giá nguyên liệu tăng, phí vận chuyển/shipper tăng cao. |
| **Giai Đoạn Xả Hàng (Post-Festival)** | Từ 15/08 Âm lịch trở đi | **Giảm 30% - 50%** (Dành cho bánh lẻ có sẵn) | Xả hàng tồn kho bánh có sẵn (không áp dụng cho bánh customize). |

---

## 2.2. Các Yếu Tố Ảnh Hưởng Đến Biến Động Giá (Price Fluctuation Factors)

$$\text{Tổng Giá Đơn Hàng} = (\text{Giá Bánh} + \text{Giá Vỏ Hộp}) \times \text{Hệ Số Mùa Vụ} + \text{Phí Customize} + \text{Phí Giao Gấp} + \text{Phí Giao Nhiều Đợt}$$

### Yếu tố 1: Thời Gian Nhận Hàng (Delivery Lead Time / Rush Order Fee)
- **Giao Tiêu Chuẩn ($\ge 3$ ngày kể từ lúc đặt)**: Phí vận chuyển tiêu chuẩn.
- **Giao Gấp / Hỏa Tốc (24h - 48h)**:
  - Phụ thu **Phí Sản Xuất Ưu Tiên (Rush Production Fee)**: +50.000 VNĐ / hộp.
  - Phụ thu **Phí Shipper Hỏa Tốc**: Tính theo cước thực tế của đối tác giao vận (GrabExpress/Ahamove surge pricing).

### Yếu tố 2: Mức Độ Customize & In Tên/Logo (Personalization Surcharge)
- **In chữ tiêu chuẩn lên vỏ hộp (Text Personalization)**:
  - Đơn B2C lẻ (1-4 hộp): Phí in 20.000 VNĐ / hộp.
  - Đơn B2C $\ge 5$ hộp: **Miễn phí** in chữ.
- **In Logo Doanh Nghiệp (B2B Custom Logo Printing)**:
  - Phí khuôn in & thiết kế ban đầu (Setup fee): 200.000 VNĐ / mẫu (Miễn phí nếu đơn $\ge 50$ hộp).

### Yếu tố 3: Loại Nhân & Nguyên Liệu Bánh (Ingredient Premium)
- Nhóm nhân truyền thống (Đậu xanh, Hạt sen, Dừa sữa): Giá cơ sở.
- Nhóm nhân cao cấp (Gà quay vi cá, Yến sào, Bào ngư, Trứng chảy): Phụ thu từ 20.000 - 60.000 VNĐ / chiếc.

### Yếu tố 4: Số Lượng Đặt Hàng (Volume Tier Discount - B2B)
- Đơn từ 20 - 49 hộp: Chiết khấu 5% - 8% (Sales đàm phán).
- Đơn từ 50 - 99 hộp: Chiết khấu 10% - 15%.
- Đơn $\ge 100$ hộp: Chiết khấu 18% - 25% + Miễn phí vận chuyển & In logo.

### Yếu tố 5: Lịch Giao Hàng Nhiều Đợt (Multi-batch Delivery Fee)
- Giao 1 đợt duy nhất: Miễn phí quản lý đợt.
- Giao từ 2 đợt trở lên (do bánh tươi HSD 7-15 ngày): Mỗi đợt giao phát sinh tính phí vận chuyển theo địa điểm & phụ phí điều phối +30.000 VNĐ / đợt.

---

## 3. Data Flow (Luồng tính giá dynamic)

```
[Người Dùng Chọn Sản Phẩm & Lịch Giao]
    │
    ├─► Lấy Ngày Nhận Hàng ──► Kiểm tra Hệ số Mùa Vụ (Early Bird / Standard / Rush Peak)
    ├─► Kiểm tra Khoảng thời gian đặt ──► Nếu < 3 ngày ──► Cộng Phí Giao Gấp / Hỏa Tốc
    ├─► Kiểm tra Tùy chọn In Tên/Logo ──► Cộng Phí Customize
    ├─► Kiểm tra Số lượng & Đợt giao ──► Áp dụng Chiết khấu sỉ / Phụ phí đợt giao
    │
    ▼
[Bảng Tính Giá Chi Tiết (Price Breakdown Component)]
    ├─► Hiển thị chi tiết từng khoản (Giá bánh + Phí mùa vụ + Phí in + Phí giao gấp)
    └─► Xuất Tổng tiền thanh toán
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không tự động thay đổi giá bán theo thời tiết hoặc giờ trong ngày.
- Không áp dụng hệ số tăng giá bất hợp pháp vượt quá 30% so với giá niêm yết công khai.
