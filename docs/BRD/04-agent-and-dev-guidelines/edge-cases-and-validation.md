# ⚠️ Ma Trận Xử Lý Trường Hợp Ngoại Lệ & Điều Kiện Biên (Edge Cases & Exception Matrix)

Tài liệu này hướng dẫn cách xử lý các kịch bản lỗi, sự cố kết nối và trường hợp biên (Edge Cases) trong quá trình phát triển phần mềm và vận hành hệ thống.

---

## 1. 🌐 Ngoại Lệ Kết Nối Mạng & Giao Dịch (Network & Transaction Exceptions)

| Kịch Bản Ngoại Lệ (Edge Case) | Nguyên Nhân | Cách Xử Lý Hệ Thống (Handling Strategy) | Phản Hồi Cho Người Dùng (UI Response) |
| :--- | :--- | :--- | :--- |
| **Mất mạng khi đang chuyển khoản Cọc** | Khách chọn thanh toán VNPAY/Momo nhưng bị rớt mạng Internet. | Đơn hàng vẫn lưu trạng thái `PENDING_DEPOSIT` trong 15 phút. Giữ nguyên giỏ hàng. | Hiển thị Toast + Nút *"Thử thanh toán lại mã cọc [Order_ID]"*. |
| **Thanh toán Cọc trùng lặp (Double Deposit Payment)** | Khách bấm nút thanh toán nhiều lần liên tiếp. | Tích hợp **Idempotency Key** dựa trên `Order_ID` cho mọi API thanh toán. | Chặn request trùng, chỉ xử lý 1 giao dịch duy nhất. |

---

## 2. 🎂 Ngoại Lệ Tồn Kho & Ra Lò Bánh Tươi (Inventory & Baking Exceptions)

| Kịch Bản Ngoại Lệ (Edge Case) | Nguyên Nhân | Cách Xử Lý Hệ Thống (Handling Strategy) | Phản Hồi Cho Người Dùng (UI Response) |
| :--- | :--- | :--- | :--- |
| **Đầy hạn ngạch xưởng trong lúc đang chọn bánh** | Hai khách hàng cùng mở web chọn ngày 12/08 Âm lịch, khách A checkout trước làm kín 100% Hạn ngạch. | Tại bước nhấn "Đặt Hàng", backend validate lại `Capacity Cap` atomic lần cuối. | Alert lỗi: *"Rất tiếc, ngày nhận [Date] vừa đạt tối đa hạn ngạch. Vui lòng chọn ngày giao khác"*. |
| **Bánh hết kho khi đang ghép dở Hộp quà** | Vị bánh Nướng Thập Cẩm vừa hết kho do đơn khác chốt. | Cập nhật kho thời gian thực qua WebSocket/Polling. | Vị bánh hết kho lập tức mờ đi (`Disabled`) kèm nhãn *"Hết hàng"*. |

---

## 3. 📝 Ngoại Lệ In Ấn & Customize Tên/Logo (Personalization Exceptions)

| Kịch Bản Ngoại Lệ (Edge Case) | Nguyên Nhân | Cách Xử Lý Hệ Thống (Handling Strategy) | Phản Hồi Cho Người Dùng (UI Response) |
| :--- | :--- | :--- | :--- |
| **Nhập ký tự đặc biệt / Emoji vào tên in vỏ hộp** | Khách nhập Emoji, ký tự HTML/Script nguy hiểm (XSS injection). | Sanitizes string input, loại bỏ ký tự HTML/Script tag và chỉ giữ lại văn bản UTF-8 chuẩn. | Cảnh báo: *"Văn bản in chỉ chấp nhận chữ cái, chữ số và dấu câu cơ bản"*. |
| **Upload file Logo B2B sai định dạng hoặc quá 10MB** | Khách tải file `.exe` hoặc file `.png` quá nặng. | Backend MIME-type checking, chặn các file không thuộc (`.png`, `.svg`, `.pdf`, `.ai`) và dung lượng $> 10\text{MB}$. | Inline error: *"Vui lòng chọn file ảnh/vector có dung lượng < 10MB"*. |

---

## 4. 📆 Ngoại Lệ Lịch Âm Lịch & Mùa Vụ (Calendar & Seasonality Edge Cases)

| Kịch Bản Ngoại Lệ (Edge Case) | Nguyên Nhân | Cách Xử Lý Hệ Thống (Handling Strategy) | Phản Hồi Cho Người Dùng (UI Response) |
| :--- | :--- | :--- | :--- |
| **Khách chọn ngày nhận nằm NGOÀI Mùa vụ Trung Thu** | Khách cố tình can thiệp HTML chọn ngày 20/09 Âm lịch. | Backend validation chặn ngày chọn ngoài khoảng `[01/07 Âm Lịch .. 15/08 Âm Lịch]`. | Chuyển Date Picker về ngày hợp lệ gần nhất trong mùa vụ. |
| **Năm Nhuận Âm Lịch (Leap Lunar Month)** | Năm có 2 tháng 7 Âm lịch. | Sử dụng thư viện thuật toán Âm Lịch Việt Nam chuẩn (`LunarCalendar.js`) có xử lý tháng Nhuận (`isLeapMonth`). | Hiển thị rõ nhãn "(Tháng 7 Nhuận)" trên giao diện Admin. |
