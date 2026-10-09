# 📜 Business Rule: BR-02 - Yêu Cầu Báo Giá Đặt Hàng Số Lượng Lớn Đa Provider (Multi-Provider B2B Bulk RFQ & Quotation)

## 1. Goal (Mục tiêu)
Cho phép các doanh nghiệp, tổ chức có nhu cầu mua bánh Trung Thu số lượng lớn ($\ge 20$ hộp) gửi Yêu cầu báo giá (RFQ), **đăng ký danh sách các đợt giao bánh tươi nhỏ**, đính kèm logo in ấn và ngân sách dự kiến. Hệ thống tự động phân phối RFQ tới các Provider/Seller có đủ năng lực trên sàn để các Provider gửi **Báo giá cạnh tranh (`provider_quotations`)**. Khách hàng Doanh nghiệp so sánh báo giá và lựa chọn Provider phù hợp nhất để chốt hợp đồng.

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Điều Kiện Kích Hoạt & Khung Thời Gian Mùa Vụ (Trigger Conditions & Seasonality)
- **Thời gian hoạt động**: Form RFQ tiếp nhận trong mùa vụ Trung Thu (từ tháng 7 Âm lịch đến 10/8 Âm lịch).
- **Điều kiện số lượng**: Đơn hàng dự kiến có số lượng $\ge 20$ hộp (hoặc tổng giá trị dự kiến $\ge 10.000.000$ VNĐ).

### 2.2. Quy Định Dữ Liệu Form RFQ Doanh Nghiệp (`b2b_rfqs`)
- Các trường bắt buộc (`Required`):
  - **Tên Doanh Nghiệp / Tổ Chức**: Chuỗi văn bản ($\ge 3$ ký tự).
  - **Mã Số Thuế**: Mã định danh thuế doanh nghiệp.
  - **Họ và Tên Người Liên Hệ / Chức Vụ**: Chuỗi văn bản.
  - **Số Điện Thoại & Email**: Định dạng liên hệ hợp lệ.
  - **Số Lượng Dự Kiến**: Số nguyên $\ge 20$.
  - **Đăng Ký Các Đợt Giao Bánh Tươi (`order_batches`)**:
    - Nhập danh sách các Mốc ngày giao Dương lịch mong muốn và số lượng từng đợt (đặc thù do bánh tươi HSD 7-15 ngày, doanh nghiệp chia giao nhiều chi nhánh/đợt biếu tặng).
- Các trường tự chọn (`Optional`):
  - **File Logo Doanh Nghiệp**: Đính kèm file đè logo (PNG, SVG, AI, PDF $< 10\text{MB}$).
  - **Mức Ngân Sách Dự Kiến**: Ngân sách tổng chi trả cho đợt quà tặng.

### 2.3. Quy Trình Phân Phối RFQ & Đấu Thầu Báo Giá Đa Provider (Multi-Provider Bidding Workflow)
- **Tạo Mã RFQ**: Sinh mã định danh `RFQ-YYYYMMDD-XXXX`.
- **Phân Phối RFQ Đến Các Provider Đủ Năng Lực**:
  - RFQ được chuyển sang trạng thái `DISTRIBUTED`.
  - Hệ thống gửi thông báo Dashboard + Email đến các Seller/Kiot thỏa mãn điều kiện (đã duyệt `is_compliance_approved` và có gói Kiot hợp lệ).
- **Nộp Báo Giá Cạnh Tranh (`provider_quotations`)**:
  - Mỗi Provider có thể lập 1 bản Báo giá chi tiết (`ProviderQuotation`) bao gồm:
    - Bảng kê chi tiết đơn giá từng Biến thể bánh lẻ/Vỏ hộp (`variant_id`).
    - Tỷ lệ chiết khấu thương mại (`discount_percentage`).
    - Hạn chót hiệu lực báo giá (`valid_until`).
    - Đề xuất mẫu thử (Sample box), miễn phí in logo, hoặc hỗ trợ vận chuyển.
  - Trạng thái báo giá: `SUBMITTED`.
- **Lựa Chọn Báo Giá & Tự Động Sinh Đơn Hàng**:
  - Khách Doanh nghiệp đăng nhập Portal B2B, so sánh các bản Báo giá từ nhiều Provider.
  - Khách bấm **"Chấp Nhận Báo Giá"** (`ACCEPTED`):
    - Trạng thái RFQ chuyển thành `WON`.
    - Hệ thống tự động khởi tạo Đơn hàng tổng (`Order`) và các Đợt giao nhỏ (`OrderBatch`) tương ứng với báo giá trúng thầu.
    - Chuyển sang bước Đặt cọc $50\%$ theo điều khoản hợp đồng.

---

## 3. Data Flow (Luồng dữ liệu)

```
[Khách Doanh Nghiệp B2B]
    │
    ▼ Gửi Yêu Cầu RFQ (Số lượng, Logo, Ngân sách, Đăng ký Đợt Giao)
[Hệ Thống Web Portal (b2b_rfqs)]
    │
    ├─► Sinh Mã RFQ (RFQ-YYYYMMDD-XXXX)
    ├─► Trạng thái: DISTRIBUTED
    │
    ▼ Phân phối tới Dashboard các Seller/Kiot
[Các Provider / Seller Trên Sàn]
    │
    ├─► Xem chi tiết RFQ & Lịch đợt giao
    └─► Nộp Báo Giá Chi Tiết (provider_quotations) với Đơn giá & Chiết khấu
    │
    ▼
[Portal Khách B2B So Sánh Báo Giá]
    │
    ├─► Bấm "Chấp Nhận Báo Giá" (ACCEPTED) Provider phù hợp nhất
    │
    ▼
[Khởi Tạo Đơn Hàng Tổng & Các Order Batches]
    └─► Thanh toán cọc 50% & Lập lịch sản xuất nướng bánh tươi cho Provider trúng thầu
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không bắt buộc tất cả Provider phải gửi báo giá (Provider có quyền từ chối nếu hết Capacity nướng).
- Không công khai báo giá của Provider này cho Provider khác xem (Đấu thầu kín).
