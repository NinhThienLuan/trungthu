# 📜 Business Rule: BR-05 - Quản Lý Rủi Ro Vận Hành, Pháp Lý & Chính Sách Bán Hàng (Operational Risks & E-commerce Policies)

## 1. Goal (Mục tiêu)
Định nghĩa các quy tắc nghiệp vụ giải quyết các rủi ro vận hành đặc thù của thương mại điện tử bánh Trung Thu: Hạn chế rủi ro bùng đơn hàng customized, quản lý tồn kho đa tầng (Vỏ hộp vs Vị bánh), quy trình xuất hóa đơn VAT doanh nghiệp, đính kèm thiệp chúc mừng và hồ sơ pháp lý An toàn thực phẩm.

---

## 2. Core Rules (Quy tắc nghiệp vụ cốt lõi)

### 2.1. Quy Tắc Đặt Cọc Cho Đơn Hàng Customize & Đơn Số Lượng Lớn (Customization Deposit Rule)
- **Rủi ro**: Bánh tươi và vỏ hộp đã in tên/logo riêng không thể tái sử dụng hoặc bán lại cho khách khác nếu bị hủy đơn ngang.
- **Quy tắc đặt cọc**:
  - Mọi đơn B2C có tính năng **Customize in tên/lời chúc lên vỏ hộp** hoặc đơn có giá trị $\ge 2.000.000$ VNĐ: **Bắt buộc thanh toán cọc tối thiểu 50%** (hoặc 100% online) trước khi hệ thống chuyển đơn xuống xưởng sản xuất/in ấn.
  - Không áp dụng hình thức COD 100% đối với các đơn có custom tên riêng.

### 2.2. Quy Tắc Quản Lý Tồn Kho Đa Tầng (Multi-level Real-time Inventory Rule)
- **Rủi ro**: Vỏ hộp còn nhưng vị bánh lẻ bị hết (hoặc ngược lại) dẫn đến vỡ đơn hàng ghép.
- **Quy tắc trừ kho**:
  - Khi khách hoàn tất chọn 1 Hộp tùy chỉnh (Set 4 bánh):
    $$\text{Tồn kho Vỏ Hộp Set 4} = \text{Tồn kho Vỏ Hộp Set 4} - 1$$
    $$\text{Tồn kho Bánh Vị A} = \text{Tồn kho Bánh Vị A} - N_A$$
  - Nếu bất kỳ 1 vị bánh lẻ hoặc loại vỏ hộp nào có tồn kho $= 0$, hệ thống tự động ẩn hoặc làm mờ (`Disabled`) vị bánh/vỏ hộp đó trên giao diện ghép hộp theo thời gian thực.

### 2.3. Quy Tắc Hồ Sơ Năng Lực & An Toàn Thực Phẩm (Food Safety & Legal Compliance Page)
- **Yêu cầu B2B**: Doanh nghiệp mua bánh làm quà tặng bắt buộc kiểm tra chứng nhận ATTP và công bố chất lượng trước khi duyệt ngân sách.
- **Quy tắc trên Web**:
  - Xây dựng mục công khai **"Hồ Sơ Năng Lực & Chứng Nhận ATTP"** tại Footer và trang giới thiệu.
  - Cho phép tải về bộ file PDF bao gồm: *Giấy chứng nhận cơ sở đủ điều kiện ATTP, Bản tự công bố chất lượng từng vị bánh, Mẫu hợp đồng nguyên tắc B2B*.

### 2.4. Quy Tắc Xuất Hóa Đơn VAT Doanh Nghiệp (Corporate VAT Invoice Rule)
- Tại bước Checkout, bổ sung checkbox **"Yêu cầu xuất Hóa đơn VAT Doanh Nghiệp"**:
  - Các trường bắt buộc khi tick: **Mã Số Thuế (MST)**, **Tên Công Ty Theo ĐKKD**, **Địa Chỉ Xuất Hóa Đơn**, **Email Nhận Hóa Đơn 電子 (E-Invoice Email)**.
  - Tự động tra cứu & đối soát tên công ty theo Mã số thuế qua API Tổng cục Thuế (nếu tích hợp).

### 2.5. Quy Tắc Thiệp Chúc Mừng Đi Kèm (Greeting Card Attachment Rule)
- Tại bước đóng gói hộp quà, cung cấp tùy chọn chọn mẫu **Thiệp chúc mừng Tết Trung Thu** (Miễn phí hoặc phụ thu 5.000 VNĐ/thiệp).
- Cho phép nhập nội dung lời chúc (Tối đa 150 ký tự) để in/viết tay đính kèm bên trong hộp quà.

### 2.6. Quy Tắc Hoàn Hàng, Đổi Trả & Phân Xử Tranh Chấp (Return, Refund & Perishable Dispute Policy)
- **Vấn đề & Rủi ro**: 
  - Hàng custom in tên/logo riêng bị từ chối nhận (bùng đơn COD) không thể tái bán cho người khác.
  - Thực phẩm tươi có HSD ngắn (7-15 ngày) nếu giao trả quay đầu 3-5 ngày sẽ hư hỏng hoàn toàn.
- **Quy tắc xử lý**:
  - **Miễn trừ Đổi trả do đổi ý (No Change-of-mind Return)**: Đơn hàng có custom in tên/logo riêng KHÔNG áp dụng chính sách đổi trả do đổi ý.
  - **Chính sách Hoàn tiền / Đổi mới không cần trả lại bánh cũ (Keep-the-Item Refund)**: Nếu sự cố thuộc lỗi Bên Bán (giao sai tên custom, bánh mốc trước HSD, giao sai vị bánh), Bên Bán hoàn tiền hoặc gửi đổi bánh mới hỏa tốc mà không yêu cầu Người Mua phải gửi trả bánh hỏng về xưởng.
  - **Cửa sổ Khai báo Khiếu nại 24h & Upload Video Unboxing**: Người Mua có 24h kể từ khi nhận hàng để gửi khiếu nại qua `/order-tracking/[id]`, bắt buộc kèm Video quay clip mở hộp (Unboxing Video) hoặc ảnh cận cảnh lỗi.
  - **Cơ chế Tạm giữ tiền (Escrow Hold)**: Nền tảng tạm giữ tiền thanh toán/cọc 24h-48h. Nền tảng đóng vai trò Trọng tài căn cứ vào bằng chứng video để duyệt hoàn tiền từ tài khoản Bên Bán cho Người Mua nếu Bên Bán lỗi.

### 2.7. Phân Định Trách Nhiệm Quản Lý Hạn Sử Dụng & Lịch Nướng Bánh Tươi (Shelf-Life & Baking Policy)
- **Trách nhiệm của Bên Bán (Seller)**:
  - Trực tiếp chịu trách nhiệm về công thức chế biến, nhãn HSD (7-10 ngày dẻo / 10-15 ngày nướng) và vệ sinh an toàn thực phẩm.
  - Căn cứ vào `Ngày Nhận Bánh` của khách để chủ động nướng bánh mới ra lò trước đúng 1 ngày giao.
- **Trách nhiệm của Nền Tảng (Platform)**:
  - Ràng buộc trên giao diện chọn ngày nhận bánh tươi phải sau ngày đặt tối thiểu 3 ngày (`Expected Delivery Date >= Order Date + 3`).
  - Tự động gom lịch nướng bánh vào **Daily Production Sheet** trên Lịch Admin của Bên Bán.
  - Hiển thị nhãn HSD và khuyến cáo bảo quản nổi bật trên UI.
- **Quy tắc Miễn Trừ Trách Nhiệm Bảo Quản (Storage Disclaimer)**:
  - Nếu Bên Bán chứng minh được bánh giao đi còn $\ge 80\%$ thời lượng HSD (dựa trên tem niêm phong ngày sản xuất), Bên Bán và Nền Tảng được miễn trừ trách nhiệm đối với các hư hỏng do Người Mua bảo quản sai cách sau khi ký nhận hàng.

---

## 3. Data Flow (Luồng quản lý rủi ro & VAT)

```
[Khách Hàng Đặt Hàng]
    │
    ├─► Kiểm tra Đơn có Customize in tên?
    │      ├─► NẾU CÓ ──► Bắt buộc Thanh toán Cọc/Online $\ge 50\%$
    │      └─► NẾU KHÔNG ──► Cho phép chọn COD / Online
    │
    ├─► Kiểm tra Tồn kho Đa tầng (Trừ đồng thời Vỏ hộp & Vị bánh lẻ)
    │
    ├─► Tùy chọn Xuất Hóa Đơn VAT (Nhập MST & Email hóa đơn)
    │
    └─► Tùy chọn Nhập Lời Chúc Thiệp Trung Thu
```

---

## 4. Non-goals (Phạm vi không thực hiện trong BR này)
- Không giải quyết tranh chấp pháp lý ngoài hợp đồng kinh tế đã ký kết.
- Không chịu trách nhiệm bảo quản bánh nếu người nhận không tuân thủ hướng dẫn bảo quản ghi trên bao bì.
