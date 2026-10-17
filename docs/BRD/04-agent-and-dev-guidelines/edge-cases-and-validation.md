# ⚠️ Ma Trận Xử Lý Trường Hợp Ngoại Lệ & Điều Kiện Biên (Edge Cases & Exception Matrix - Streamlined MVP)

> Cập nhật 2026-10-16: Áp dụng [hợp đồng Backend](backend-ownership-and-order-contract.md); giỏ đa Provider được phép, rollback toàn Checkout khi một nhóm thất bại.

Tài liệu này hướng dẫn cách xử lý các kịch bản lỗi, sự cố kết nối và trường hợp biên (Edge Cases) trong quá trình phát triển phần mềm và vận hành hệ thống.

---

## 1. 🌐 Ngoại Lệ Kết Nối Mạng & Giao Dịch (Network & Transaction Exceptions)

| Kịch Bản Ngoại Lệ (Edge Case) | Nguyên Nhân | Cách Xử Lý Hệ Thống (Handling Strategy) | Phản Hồi Cho Người Dùng (UI Response) |
| :--- | :--- | :--- | :--- |
| **Mất mạng khi đang quét ảnh VietQR Cọc** | Khách hiển thị mã QR nhưng bị rớt mạng hoặc chưa chuyển khoản ngay. | Đơn hàng vẫn lưu trạng thái `PENDING_DEPOSIT` đến `hold_expires_at` hiện tại (ban đầu 15 phút, có thể gia hạn một lần). Tồn kho và slot hạn ngạch nướng (`bake_date`) được giữ nguyên. | Hiển thị Toast + Nút *"Xem lại mã VietQR đơn [Order_Code]"* kèm đồng hồ theo holdExpiresAt hiện tại. |
| **Hết deadline chưa xác nhận cọc** | Khách quét mã VietQR nhưng chưa được Seller xác nhận trước deadline hiện tại. | Cron chỉ xử lý VIETQR/PENDING_DEPOSIT với `now >= hold_expires_at`, khóa Order rồi trong cùng transaction chuyển đơn sang `CANCELLED`, **hoàn trả 100% tồn kho** các biến thể bánh/vỏ hộp, và **giảm trừ `daily_capacities.reserved_quantity`** của ngày `bake_date`. | Thông báo: *"Đơn hàng [Order_Code] đã hết hạn giữ chỗ. Tồn kho và hạn ngạch nướng đã được giải phóng"*. |
| **Khách / Seller chủ động hủy đơn** | Đơn ở PENDING_DEPOSIT hoặc COD/CONFIRMED chưa sản xuất. | Hệ thống tự động hoàn kho và giảm trừ slot `reserved_quantity` trên ngày `bake_date` tương ứng. | Toast: *"Đã hủy đơn hàng thành công và cập nhật lại hạn ngạch xưởng"*. |
| **Thao tác xác nhận cọc trùng lặp** | Seller bấm nút "Xác Nhận Đã Nhận Cọc" nhiều lần liên tiếp trên Dashboard. | **State Guard**: Tầng Service kiểm tra nghiêm ngặt `OrderStatus`, khóa Order, chỉ xác nhận khi PENDING_DEPOSIT và chưa hết hạn; cập nhật giao dịch và đơn cùng transaction. Request thứ 2 sẽ bị từ chối an toàn. | Toast: *"Đơn hàng đã được xác nhận cọc trước đó"*. |

---

## 2. 🎂 Ngoại Lệ Tồn Kho & Ra Lò Bánh Tươi (Inventory & Baking Exceptions)

| Kịch Bản Ngoại Lệ (Edge Case) | Nguyên Nhân | Cách Xử Lý Hệ Thống (Handling Strategy) | Phản Hồi Cho Người Dùng (UI Response) |
| :--- | :--- | :--- | :--- |
| **Đầy hạn ngạch xưởng trong lúc đang chọn bánh** | Hai khách hàng cùng mở web chọn ngày giao, khách A checkout trước làm kín 100% Hạn ngạch nướng ngày `bake_date`. | Tại bước nhấn "Đặt Hàng", backend validate lại `Capacity Cap` atomic lần cuối theo `bake_date = expected_delivery_date - 1`. | Alert lỗi: *"Rất tiếc, ngày nhận [Date] (ra lò ngày [Bake_Date]) vừa đạt tối đa hạn ngạch. Vui lòng chọn ngày giao khác"*. |
| **Bánh hết kho khi đang ghép dở Hộp quà** | Vị bánh Nướng Thập Cẩm vừa hết kho do đơn khác chốt. | Validate tồn kho nguyên tử tại thời điểm Checkout kết hợp Polling nhẹ trạng thái tồn kho. | Vị bánh hết kho lập tức mờ đi (`Disabled`) kèm nhãn *"Hết hàng"*. |
| **Giỏ hàng chứa sản phẩm từ nhiều Provider** | Khách nhặt bánh của Xưởng A rồi bấm thêm bánh của Xưởng B. | Cho phép thêm đa Provider; Checkout tách một Order/Provider trong một transaction. Một nhóm lỗi phải rollback tất cả. | Hiển thị các nhóm Provider, tiền/ship/cọc riêng; lỗi nhóm nào chỉ rõ nhóm đó, chưa tạo đơn thành công từng phần. |

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

## 5. COD, gia hạn và cạnh tranh

| Tình huống | Xử lý |
| --- | --- |
| COD hợp lệ | CONFIRMED/UNPAID, không deadline/QR; cron hold bỏ qua, vẫn reserve tài nguyên. |
| Gia hạn hold | Seller sở hữu, trước hạn, một lần +15 phút vào deadline, lý do/audit; không reserve thêm. |
| Gia hạn lần hai hoặc tại/sau hạn | 409, không thay deadline; không hồi sinh đơn. |
| Cron chạy cùng xác nhận cọc/gia hạn | Khóa cùng Order, đọc lại trạng thái/thời gian; chỉ một thao tác thắng, nhả tài nguyên đúng một lần. |
| Lỗi nhả tài nguyên | Rollback cả trạng thái hủy và nhả, để retry; không commit hủy trước. |
| Provider thứ hai hết stock/slot | Rollback cả đơn/giao dịch/tài nguyên của Provider thứ nhất. |
| Tiền chuyển đến sau hạn | Provider đối soát/hoàn tiền ngoài hệ thống; không tự mở lại đơn hay chiếm slot đã nhả. |
