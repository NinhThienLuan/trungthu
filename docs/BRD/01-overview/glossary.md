# 📖 Từ Điển Thuật Ngữ Nghiệp Vụ (Domain Glossary)

Tài liệu này chuẩn hóa các thuật ngữ chuyên môn được sử dụng trong toàn bộ tài liệu thiết kế và mã nguồn của **Nền Tảng Bán Bánh Trung Thu**.

---

## 1. Thuật Ngữ Quản Lý Rủi Ro & Pháp Lý (Operational Risks & Compliance)

| Thuật ngữ (English / Vietnamese) | Mô tả chi tiết | Quy định / Giá trị áp dụng |
| :--- | :--- | :--- |
| **Đặt cọc đơn customize (Customization Deposit)** | Quy định bắt buộc người mua phải đặt cọc trước (tối thiểu 50% hoặc 100% online) khi đặt đơn hàng có in tên/logo riêng lên vỏ hộp. | Nhằm loại bỏ rủi ro hủy đơn/bùng hàng (No-show risk) đối với hàng in tên riêng. |
| **Tồn kho đa tầng (Multi-level Inventory)** | Cơ chế tự động trừ kho đồng thời cả Vỏ hộp lẫn từng vị Bánh lẻ khi người dùng chốt 1 bộ Hộp tùy chỉnh. | Đảm bảo không bị bán quá số lượng (Over-selling) một vị bánh hot. |
| **Tạm giữ tiền thanh toán (Escrow Hold)** | Cơ chế nền tảng giữ tiền thanh toán/cọc 24h-48h trước khi chuyển cho Bên Bán. | Dùng làm căn cứ xử lý khiếu nại và hoàn tiền cho Người Mua nếu Bên Bán giao lỗi. |
| **Hoàn tiền giữ hàng (Keep-the-Item Refund)** | Chính sách cho phép hoàn tiền hoặc đổi mới bánh hỏng mà không yêu cầu khách gửi trả bánh tươi bị mốc/hỏng về xưởng. | Tránh tốn phí ship 2 chiều vô ích cho thực phẩm tươi đã hư hỏng. |
| **Hồ sơ năng lực & ATTP (Food Safety Kit)** | Trang thông tin công khai cho phép tải về Giấy chứng nhận ATTP, Tự công bố sản phẩm và Hợp đồng mẫu. | Tăng độ tin cậy để chốt đơn sỉ B2B với doanh nghiệp. |
| **Hóa đơn VAT doanh nghiệp (Corporate E-Invoice)** | Tính năng cho phép khách B2B nhập Mã số thuế, Tên công ty và Email nhận hóa đơn điện tử tại bước Checkout. | Tự động chuyển thông tin về kế toán để xuất hóa đơn. |

---

## 2. Thuật Ngữ Quản Lý Lịch & Vận Hành Admin (Admin & Production Calendar)

| Thuật ngữ (English / Vietnamese) | Mô tả chi tiết | Quy định / Giá trị áp dụng |
| :--- | :--- | :--- |
| **Lịch sản xuất Song Lịch (Dual Production Calendar)** | Công cụ quản lý dành riêng cho Chủ cửa hàng & Quản lý trang, hiển thị lịch trả bánh đồng thời bằng **Dương Lịch và Âm Lịch**. | Ví dụ: `25/09/2026 (15/08 Âm Lịch)`. Cho phép xem theo tháng Âm lịch. |
| **Hạn ngạch sản xuất ngày (Daily Capacity Cap)** | Số lượng chiếc bánh tối đa mà xưởng có thể nướng trong 1 ngày. | Nếu tổng đơn trong ngày đạt $100\%$ Hạn ngạch, hệ thống tự động khóa ngày đó trên trang mua hàng. |
| **Kế hoạch ra lò bánh (Daily Production Sheet)** | Báo cáo tự động gom tổng số lượng từng loại bánh lẻ cần nướng trong ngày từ tất cả các đơn B2C & B2B. | Xuất file in cho thợ làm bánh tại xưởng. |
| **Phí vận chuyển (Shipping Fee Calculation)** | Khoản phí giao hàng được tính toán và cộng vào hóa đơn checkout dựa trên địa chỉ/khu vực (không bao gồm ứng dụng quản lý shipper). | Hiển thị thành dòng phí riêng biệt trên hóa đơn. |

---

## 3. Thuật Ngữ Đặc Thù Mùa Vụ & Hạn Sử Dụng (Seasonality & Freshness)

| Thuật ngữ (English / Vietnamese) | Mô tả chi tiết | Quy định / Giá trị áp dụng |
| :--- | :--- | :--- |
| **Mùa vụ Trung Thu (Seasonality Window)** | Khoảng thời gian kinh doanh cao điểm của sản phẩm, kéo dài khoảng **1.5 đến 2 tháng** (từ đầu tháng 7 Âm lịch đến hết ngày 15/8 Âm lịch). | Hệ thống mở nhận đơn hàng B2C/B2B trong khung thời gian này. |
| **Hạn sử dụng bánh tươi (Fresh Shelf Life)** | Thời gian bảo quản tối đa của bánh Trung Thu tươi (handmade, không chất bảo quản). | **7 - 10 ngày** đối với bánh dẻo tươi;<br>**10 - 15 ngày** đối với bánh nướng tươi. |
| **Đặt hàng chọn ngày ra lò (Pre-order Date Scheduling)** | Tính năng cho phép khách B2C/B2B chọn trước ngày muốn nhận bánh tươi, xưởng sẽ căn ngày sản xuất bánh mới ra lò trước khi giao. | Ngày chọn phải thuộc khung mùa vụ và sau ngày đặt tối thiểu 2-3 ngày. |
| **Giao hàng theo đợt (Multi-batch Delivery)** | Giải pháp dành cho đơn hàng sỉ B2B: chia tổng số lượng đặt mua thành nhiều đợt giao vào các ngày khác nhau để bánh luôn mới. | Đơn 100 hộp có thể chia 2 đợt: đợt 1 giao 50 hộp (mùng 1 Âm lịch), đợt 2 giao 50 hộp (10/8 Âm lịch). |

---

## 4. Thuật Ngữ Giá Cả Linh Hoạt (Dynamic Pricing & Surcharges)

| Thuật ngữ (English / Vietnamese) | Mô tả chi tiết | Quy định / Giá trị áp dụng |
| :--- | :--- | :--- |
| **Giá Đặt Sớm (Early Bird Discount)** | Ưu đãi giảm giá (10-15%) áp dụng cho khách hàng đặt hàng trong nửa đầu tháng 7 Âm lịch (trước Rằm > 30 ngày). | Khuyến khích chốt đơn sớm để chủ động nguyên liệu. |
| **Phụ Thu Cao Điểm Gấp (Rush Peak Surcharge)** | Mức phụ thu (10-20%) áp dụng trong 7 ngày cao điểm sát Tết Trung Thu (từ 08/08 đến 14/08 Âm lịch). | Bù đắp chi phí tăng ca, tăng giá nguyên liệu & cước vận chuyển. |
| **Phí Giao Gấp / Hỏa Tốc (Rush Delivery Surcharge)** | Phụ phí áp dụng khi khách hàng muốn nhận bánh tươi khẩn cấp trong vòng 24h - 48h. | Phí sản xuất ưu tiên + Phí giao hàng hỏa tốc thực tế. |
| **Chiết Khấu Bậc Thang (Volume Tier Discount)** | Mức giảm giá theo tỷ lệ phần trăm áp dụng cho các đơn hàng B2B số lượng lớn ($\ge 20, 50, 100$ hộp). | Do bộ phận Sales thương lượng & duyệt báo giá PDF. |
