# 📜 Business Rule: BR-02 - Yêu Cầu Báo Giá Đặt Hàng Số Lượng Lớn Đa Provider (Multi-Provider B2B Bulk RFQ)

## 1. Goal (Mục tiêu)
Cho phép các doanh nghiệp, tổ chức có nhu cầu mua bánh Trung Thu số lượng lớn ($\ge 20$ hộp hoặc $\ge 10.000.000$ VNĐ) gửi Yêu cầu báo giá (B2B RFQ), đính kèm logo in ấn, ngân sách dự kiến và mốc ngày nhận bánh tươi mong muốn. Hệ thống tự động phân phối RFQ tới các Provider có đủ năng lực trên sàn (đã duyệt ATTP và có gói SaaS hoạt động).

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Điều Kiện Kích Hoạt & Thời Gian Tiếp Nhận
- **Thời gian hoạt động**: Form RFQ tiếp nhận quanh năm theo nhu cầu quà tặng/sự kiện của doanh nghiệp, không giới hạn chỉ mở theo mùa vụ.
- **Điều kiện số lượng**: Đơn hàng dự kiến có số lượng $\ge 20$ hộp (hoặc tổng giá trị dự kiến $\ge 10.000.000$ VNĐ).

### 2.2. Quy Định Dữ Liệu Form RFQ Doanh Nghiệp (`b2b_rfqs`)
- Các trường bắt buộc (`Required`):
  - **Tên Doanh Nghiệp / Tổ Chức**: Chuỗi văn bản ($\ge 3$ ký tự).
  - **Mã Số Thuế**: Mã định danh thuế doanh nghiệp.
  - **Họ và Tên Người Liên Hệ / Chức Vụ**: Chuỗi văn bản.
  - **Số Điện Thoại & Email**: Định dạng liên hệ hợp lệ của người phụ trách.
  - **Số Lượng Hộp Dự Kiến**: Số nguyên $\ge 20$.
  - **Ngày Nhận Bánh Mong Muốn (`expected_delivery_date`)**: Ngày nhận Dương lịch ($\ge \text{Ngày gửi} + 3$). Trong MVP, yêu cầu xác định 1 mốc ngày nhận chính.
- Các trường tự chọn (`Optional`):
  - **File Logo Doanh Nghiệp**: Đính kèm file vector/ảnh logo (PNG, SVG, AI, PDF $\le 10\text{MB}$).
  - **Mức Ngân Sách Dự Kiến**: Ngân sách tổng chi trả cho đợt quà tặng (VNĐ).

### 2.3. Quy Trình Phân Phối RFQ Trong MVP vs Phase 2
- **Tạo Mã RFQ**: Hệ thống tự động sinh mã định danh `RFQ-YYYYMMDD-XXXX`.
- **Phân Phối RFQ Đến Các Provider Đủ Năng Lực (MVP Scope)**:
  - RFQ được chuyển sang trạng thái `DISTRIBUTED`.
  - Hệ thống gửi thông báo và hiển thị RFQ trên Dashboard của toàn bộ các Provider thỏa mãn:
    1. Đã được duyệt hồ sơ pháp lý (`users.is_compliance_approved = true`).
    2. Đang có gói SaaS Provider hoạt động (`provider_subscriptions.status = ACTIVE`).
  - **Cơ chế tương tác trong MVP**: Provider xem chi tiết yêu cầu, tải file logo, và chủ động liên hệ trực tiếp với người phụ trách của doanh nghiệp (qua SĐT/Email đính kèm trong RFQ) để gửi báo giá chi tiết, gửi hộp mẫu và thương lượng hợp đồng.
- **Hệ Thống Đấu Thầu & Chốt Báo Giá Trực Tuyến (Phase 2 Scope)**:
  - Cho phép Provider nộp bảng kê báo giá trực tiếp lên hệ thống (`provider_quotations`).
  - Cổng Portal so sánh ma trận báo giá trực tuyến và nút "Chốt thầu" tự động sinh đơn hàng.

---

## 3. Data Flow (Luồng dữ liệu B2B RFQ)

```
[Khách Doanh Nghiệp B2B]
    │
    ▼ Gửi Form RFQ (Tên công ty, MST, SĐT, Email, Số lượng >= 20, Logo, Ngày nhận)
[Hệ Thống Sàn (b2b_rfqs)]
    │
    ├─► Sinh Mã RFQ (RFQ-YYYYMMDD-XXXX)
    ├─► Trạng thái: DISTRIBUTED
    │
    ▼ Tự động phân phối tới Dashboard Provider đủ điều kiện
[Dashboard Các Provider Có Gói SaaS Active & Duyệt ATTP]
    │
    ├─► [MVP]: Provider xem chi tiết, tải logo, liên hệ trực tiếp qua SĐT/Email
    └─► [Phase 2]: Provider nộp báo giá trực tuyến (provider_quotations)
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không bắt buộc tất cả Provider phải phản hồi báo giá nếu xưởng đã quá tải hạn ngạch.
- Trong MVP không xây dựng cơ chế đấu thầu tự động hoặc so sánh giá tự động trên hệ thống (doanh nghiệp và xưởng làm việc trực tiếp theo thông tin RFQ phân phối).
