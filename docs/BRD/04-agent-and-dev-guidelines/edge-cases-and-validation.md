# ⚠️ Ma Trận Xử Lý Trường Hợp Ngoại Lệ & Điều Kiện Biên (Edge Cases & Exception Matrix - Streamlined MVP)

Tài liệu này hướng dẫn cách xử lý các kịch bản lỗi, sự cố kết nối và trường hợp biên (Edge Cases) trong quá trình phát triển phần mềm và vận hành hệ thống.

---

## 1. 🌐 Ngoại Lệ Kết Nối Mạng & Giao Dịch (Network & Transaction Exceptions)

| Kịch Bản Ngoại Lệ (Edge Case) | Nguyên Nhân | Cách Xử Lý Hệ Thống (Handling Strategy) | Phản Hồi Cho Người Dùng (UI Response) |
| :--- | :--- | :--- | :--- |
| **Mất mạng khi đang quét ảnh VietQR Cọc** | Khách hiển thị mã QR nhưng bị rớt mạng hoặc chưa chuyển khoản ngay. | Đơn hàng vẫn lưu trạng thái `PENDING_DEPOSIT` trong **15 phút**. Tồn kho và slot hạn ngạch nướng (`bake_date`) được giữ nguyên. | Hiển thị Toast + Nút *"Xem lại mã VietQR đơn [Order_Code]"* kèm đồng hồ đếm ngược 15 phút. |
| **Hết hạn 15 phút chưa được xác nhận cọc** | Khách quét mã VietQR nhưng không hoàn tất chuyển khoản sau 15 phút. | Tiến trình `@Scheduled` tự động chuyển đơn sang `CANCELLED`, **hoàn trả 100% tồn kho** các biến thể bánh/vỏ hộp, và **giảm trừ `daily_capacities.booked_quantity`** của ngày `bake_date`. | Thông báo: *"Đơn hàng [Order_Code] đã hết hạn giữ chỗ (15 phút). Tồn kho và hạn ngạch nướng đã được giải phóng"*. |
| **Khách / Seller chủ động hủy đơn** | Đơn bị hủy khi đang ở trạng thái `PENDING_DEPOSIT`. | Hệ thống tự động hoàn kho và giảm trừ slot `booked_quantity` trên ngày `bake_date` tương ứng. | Toast: *"Đã hủy đơn hàng thành công và cập nhật lại hạn ngạch xưởng"*. |
| **Thao tác xác nhận cọc trùng lặp** | Seller bấm nút "Xác Nhận Đã Nhận Cọc" nhiều lần liên tiếp trên Dashboard. | **State Guard**: Tầng Service kiểm tra nghiêm ngặt `OrderStatus`, chỉ cho phép chuyển trạng thái khi đơn đang ở chính xác `PENDING_DEPOSIT`. Request thứ 2 sẽ bị từ chối an toàn. | Toast: *"Đơn hàng đã được xác nhận cọc trước đó"*. |

---

## 2. 🎂 Ngoại Lệ Tồn Kho & Ra Lò Bánh Tươi (Inventory & Baking Exceptions)

| Kịch Bản Ngoại Lệ (Edge Case) | Nguyên Nhân | Cách Xử Lý Hệ Thống (Handling Strategy) | Phản Hồi Cho Người Dùng (UI Response) |
| :--- | :--- | :--- | :--- |
| **Đầy hạn ngạch xưởng trong lúc đang chọn bánh** | Hai khách hàng cùng mở web chọn ngày giao, khách A checkout trước làm kín 100% Hạn ngạch nướng ngày `bake_date`. | Tại bước nhấn "Đặt Hàng", backend validate lại `Capacity Cap` atomic lần cuối theo `bake_date = expected_delivery_date - 1`. | Alert lỗi: *"Rất tiếc, ngày nhận [Date] (ra lò ngày [Bake_Date]) vừa đạt tối đa hạn ngạch. Vui lòng chọn ngày giao khác"*. |
| **Bánh hết kho khi đang ghép dở Hộp quà** | Vị bánh Nướng Thập Cẩm vừa hết kho do đơn khác chốt. | Validate tồn kho nguyên tử tại thời điểm Checkout kết hợp Polling nhẹ trạng thái tồn kho. | Vị bánh hết kho lập tức mờ đi (`Disabled`) kèm nhãn *"Hết hàng"*. |
| **Giỏ hàng chứa sản phẩm từ nhiều Provider** | Khách nhặt bánh của Xưởng A rồi bấm thêm bánh của Xưởng B. | Chặn thêm giỏ hàng đa xưởng. Mỗi đơn hàng chỉ thuộc về 1 Provider duy nhất. | Modal thông báo: *"Giỏ hàng hiện có sản phẩm của xưởng [A]. Bạn có muốn làm mới giỏ để mua từ xưởng [B] không?"*. |

---

## 3. 📝 Ngoại Lệ In Ấn & Customize Tên/Logo (Personalization Exceptions)

| Kịch Bản Ngoại Lệ (Edge Case) | Nguyên Nhân | Cách Xử Lý Hệ Thống (Handling Strategy) | Phản Hồi Cho Người Dùng (UI Response) |
| :--- | :--- | :--- | :--- |
| **Nhập ký tự đặc biệt / Emoji vào tên in vỏ hộp** | Khách nhập Emoji, ký tự HTML/Script nguy hiểm (XSS injection). | Sanitizes string input, loại bỏ ký tự HTML/Script tag và chỉ giữ lại văn bản UTF-8 chuẩn. | Cảnh báo: *"Văn bản in chỉ chấp nhận chữ cái, chữ số và dấu câu cơ bản (tối đa 50 ký tự)"*. |
| **Upload file Logo B2B sai định dạng hoặc quá 10MB** | Khách tải file `.exe` hoặc file ảnh quá nặng. | Backend MIME-type checking, chặn các file không thuộc (`.png`, `.svg`, `.pdf`, `.ai`) và dung lượng $> 10\text{MB}$. | Inline error: *"Vui lòng chọn file ảnh/vector có dung lượng < 10MB"*. |

---

## 4. 📆 Ngoại Lệ Thời Gian Nhận Hàng (Delivery Scheduling Exceptions)

| Kịch Bản Ngoại Lệ (Edge Case) | Nguyên Nhân | Cách Xử Lý Hệ Thống (Handling Strategy) | Phản Hồi Cho Người Dùng (UI Response) |
| :--- | :--- | :--- | :--- |
| **Khách chọn ngày nhận $< 3$ ngày kể từ lúc đặt** | Khách muốn nhận bánh gấp trong vòng 24h - 48h. | **MVP Chặn Cứng**: Backend validation từ chối tạo đơn nếu `expected_delivery_date < CURRENT_DATE + 3`. Không hỗ trợ đơn rush trong MVP. | Thông báo: *"Ngày nhận bánh tươi tối thiểu phải sau ngày đặt 3 ngày để xưởng chuẩn bị nguyên liệu và xếp lịch ra lò"*. |
