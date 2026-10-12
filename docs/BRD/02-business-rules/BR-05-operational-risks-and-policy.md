# 📜 Business Rule: BR-05 - Quản Lý Rủi Ro Vận Hành, Pháp Lý & Chính Sách Bán Hàng (Operational Risks & E-commerce Policies)

## 1. Goal (Mục tiêu)
Định nghĩa các quy tắc nghiệp vụ giải quyết các rủi ro vận hành đặc thù của thương mại điện tử bánh Trung Thu: Quy định đặt cọc theo loại đơn hàng, quản lý tồn kho đa tầng (Vỏ hộp vs Vị bánh), mô hình thanh toán trực tiếp không Escrow, quy trình xuất hóa đơn VAT doanh nghiệp, chính sách đổi trả bánh tươi và tuân thủ pháp lý sàn TMĐT tại Việt Nam.

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Quy Tắc Đặt Cọc Theo Loại Đơn Hàng (Customization & Value Deposit Rule)
- **Đơn Hàng Customize In Tên/Logo Riêng HOẶC Đơn Hàng Có Giá Trị $\ge 2.000.000$ VNĐ**:
  - **Bắt buộc thanh toán cọc tối thiểu 50%** (hoặc 100% online) thông qua mã VietQR trực tiếp tới tài khoản Provider trước khi hệ thống chuyển đơn xuống xưởng sản xuất/in ấn.
  - Tuyệt đối **không áp dụng COD 100%** đối với các đơn hàng này nhằm triệt tiêu rủi ro bùng hàng (hàng in tên riêng không thể tái bán).
- **Đơn Hàng Bánh Thường Không In Tên Và Có Giá Trị $< 2.000.000$ VNĐ**:
  - Khách hàng được phép lựa chọn hình thức thanh toán khi nhận hàng (`payment_method = 'COD'`).
  - Số tiền đặt cọc bằng 0 (`deposit_amount = 0`), thanh toán toàn bộ cho shipper khi nhận bánh.

### 2.2. Quy Tắc Quản Lý Tồn Kho Đa Tầng (Multi-level Real-time Inventory Rule)
- **Rủi ro**: Vỏ hộp còn nhưng vị bánh lẻ bị hết (hoặc ngược lại) dẫn đến vỡ đơn hàng ghép.
- **Quy tắc trừ kho**:
  - Khi khách hoàn tất chọn 1 Hộp tùy chỉnh (Set 4 bánh):
    $$\text{Tồn kho Vỏ Hộp Set 4} = \text{Tồn kho Vỏ Hộp Set 4} - 1$$
    $$\text{Tồn kho Bánh Vị A} = \text{Tồn kho Bánh Vị A} - N_A$$
  - Nếu bất kỳ 1 vị bánh lẻ hoặc loại vỏ hộp nào có tồn kho $= 0$, hệ thống tự động vô hiệu hóa (`Disabled`) vị bánh/vỏ hộp đó trên giao diện phối hộp theo thời gian thực.

### 2.3. Quy Tắc Hồ Sơ Năng Lực & An Toàn Thực Phẩm (Food Safety & Legal Compliance Page)
- **Yêu cầu B2B**: Doanh nghiệp mua bánh làm quà tặng bắt buộc kiểm tra chứng nhận ATTP và công bố chất lượng trước khi duyệt ngân sách.
- **Quy tắc trên Web**:
  - Xây dựng mục công khai **"Hồ Sơ Năng Lực & Chứng Nhận ATTP"** tại Footer và trang giới thiệu.
  - Cho phép tải về bộ file PDF bao gồm: *Giấy chứng nhận cơ sở đủ điều kiện ATTP, Bản tự công bố chất lượng từng vị bánh, Mẫu hợp đồng nguyên tắc B2B*.

### 2.4. Quy Tắc Xuất Hóa Đơn VAT Doanh Nghiệp (Corporate VAT Invoice Rule)
- Tại bước Checkout, bổ sung checkbox **"Yêu cầu xuất Hóa đơn VAT Doanh Nghiệp"**:
  - Các trường bắt buộc khi tick: **Mã Số Thuế (MST)**, **Tên Công Ty Theo ĐKKD**, **Địa Chỉ Xuất Hóa Đơn**, **Email Nhận Hóa Đơn (E-Invoice Email)**.
  - Dữ liệu được chuyển tiếp cho Provider để xuất hóa đơn điện tử hợp lệ tới doanh nghiệp.

### 2.5. Quy Tắc Thiệp Chúc Mừng Đi Kèm (Greeting Card Attachment Rule)
- Tại bước đóng gói hộp quà, cung cấp tùy chọn chọn mẫu **Thiệp chúc mừng Tết Trung Thu** (Miễn phí hoặc phụ thu 5.000 VNĐ/thiệp).
- Cho phép nhập nội dung lời chúc (Tối đa 150 ký tự) để in/viết tay đính kèm bên trong hộp quà.

### 2.6. Quy Tắc Thanh Toán Trực Tiếp & Phân Xử Khiếu Nại (Direct Settlement & Dispute Policy - No Escrow)
- **Mô Hình Thanh Toán 0% Commission (No Escrow)**:
  - Nền tảng **KHÔNG thu giữ tiền đơn hàng qua ví Escrow (24h-48h)**. Toàn bộ tiền cọc hoặc thanh toán chuyển thẳng vào tài khoản ngân hàng của từng Provider thông qua mã VietQR động.
- **Chính sách Miễn trừ Đổi trả do đổi ý (No Change-of-mind Return)**:
  - Đơn hàng bánh tươi hoặc có custom in tên/logo riêng KHÔNG áp dụng chính sách đổi trả do đổi ý.
- **Chính sách Hoàn tiền / Đổi mới không cần trả lại bánh cũ (Keep-the-Item Refund)**:
  - Nếu sự cố thuộc lỗi Bên Bán (giao sai tên in, bánh mốc trước HSD, giao sai vị bánh), Bên Bán có trách nhiệm trực tiếp hoàn tiền hoặc gửi đổi bánh mới hỏa tốc mà không yêu cầu Người Mua phải gửi trả bánh hỏng về xưởng.
- **Cơ chế Giám sát & Trọng tài của Sàn (Dispute Resolution)**:
  - **Trong MVP**: Người mua liên hệ trực tiếp Provider theo thông tin đơn hàng để giải quyết hoàn tiền/đổi mới.
  - **Trong Phase 2**: Cung cấp cổng khiếu nại trong 24h trên web kèm Video unboxing. Nền tảng ghi nhận lịch sử vào bảng `complaints`. Nếu Provider vi phạm tỷ lệ khiếu nại $> 3\%$ hoặc từ chối bồi thường thỏa đáng, Sàn sẽ phát cảnh báo vi phạm và **tạm khóa quyền mở bán của Provider** trên toàn sàn.

### 2.7. Tuân Thủ Pháp Lý Sàn Thương Mại Điện Tử (Legal & Regulatory Compliance)
- Nền tảng thương mại điện tử kết nối Người mua và các Nhà sản xuất bánh phải thực hiện đầy đủ thủ tục **Thông báo/Đăng ký website cung cấp dịch vụ TMĐT với Bộ Công Thương Việt Nam** theo Nghị định 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP trước khi chính thức đi vào hoạt động.

---

## 3. Data Flow (Luồng thanh toán & giải quyết khiếu nại)

```
[Khách Hàng Đặt Hàng]
    │
    ├─► Đơn có in tên riêng HOẶC Tổng tiền >= 2.000.000đ?
    │      ├─► NẾU CÓ ──► Bắt buộc chọn VIETQR, Thanh toán cọc >= 50% trực tiếp tới Provider
    │      └─► NẾU KHÔNG ──► Cho phép chọn COD (Cọc 0đ, thanh toán khi nhận hàng)
    │
    ├─► Giữ chỗ tồn kho & Capacity Cap trong 15 phút
    │
    ├─► Tùy chọn Xuất Hóa Đơn VAT (Nhập MST & Email hóa đơn)
    │
    └─► Bánh giao đến tay khách
           │
           ├─► Bánh đúng chuẩn ──► Đơn hoàn thành (COMPLETED)
           └─► Có sự cố bánh hỏng/sai tên ──► Áp dụng Keep-the-Item Refund (Provider bồi thường trực tiếp)
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Nền tảng không đóng vai trò ví tiền tệ trung gian giữ tiền ký quỹ (Escrow).
- Nền tảng không chịu trách nhiệm bồi thường tài chính thay cho Provider nếu Provider giao hàng lỗi.
