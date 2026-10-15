# 📖 Từ Điển Thuật Ngữ Nghiệp Vụ (Domain Glossary)

Tài liệu này chuẩn hóa các thuật ngữ chuyên môn được sử dụng trong toàn bộ tài liệu thiết kế và mã nguồn của **Nền Tảng Bán Bánh Trung Thu (trung_thu_web)**.

---

## 1. Thuật Ngữ Quản Lý Rủi Ro & Pháp Lý (Operational Risks & Compliance)

| Thuật ngữ (English / Vietnamese) | Mô tả chi tiết | Quy định / Giá trị áp dụng |
| :--- | :--- | :--- |
| **Đặt cọc đơn customize (Customization Deposit)** | Quy định bắt buộc người mua phải đặt cọc trước tối thiểu 50% khi đặt đơn hàng có in tên/logo riêng lên vỏ hộp hoặc đơn hàng $\ge 2.000.000$ VNĐ. | Loại bỏ rủi ro bùng hàng (No-show risk) đối với hàng in tên riêng. Đơn thường không custom $< 2.000.000$ VNĐ được phép chọn COD (Cọc 0đ). |
| **Tồn kho đa tầng (Multi-level Inventory)** | Cơ chế tự động trừ kho đồng thời cả Vỏ hộp lẫn từng vị Bánh lẻ khi người dùng chốt 1 bộ Hộp tùy chỉnh. | Đảm bảo không bị bán quá số lượng (Over-selling) một vị bánh hot. |
| **Thanh toán trực tiếp Provider (Direct Provider Settlement - No Escrow)** | Mô hình sàn Pure SaaS 0% hoa hồng, tiền đặt cọc và thanh toán chuyển thẳng tới tài khoản ngân hàng của từng Provider (hoặc COD). Sàn **KHÔNG giữ ví Escrow**. | Giảm gánh nặng pháp lý và dòng tiền cho Sàn. Quyền lực trọng tài của Sàn = Tiếp nhận khiếu nại, cảnh báo và khóa quyền mở bán của Provider vi phạm (Phase 2). |
| **Hoàn tiền giữ hàng (Keep-the-Item Refund)** | Chính sách cho phép hoàn tiền hoặc đổi mới bánh hỏng mà không yêu cầu khách gửi trả bánh tươi bị mốc/hỏng/sai tên về xưởng. | Tránh tốn phí ship 2 chiều vô ích cho thực phẩm tươi đã hư hỏng. |
| **Hồ sơ năng lực & ATTP (Food Safety Kit)** | Trang thông tin công khai cho phép tải về Giấy chứng nhận ATTP, Tự công bố sản phẩm và Hợp đồng mẫu. | Tăng độ tin cậy để chốt đơn sỉ B2B với doanh nghiệp. |
| **Hóa đơn VAT doanh nghiệp (Corporate E-Invoice)** | Tính năng cho phép khách B2B nhập Mã số thuế, Tên công ty và Email nhận hóa đơn điện tử tại bước Checkout. | Tự động chuyển thông tin về kế toán của Provider để xuất hóa đơn điện tử. |
| **Đăng ký Website TMĐT với Bộ Công Thương** | Nghĩa vụ pháp lý bắt buộc theo quy định pháp luật Việt Nam đối với nền tảng thương mại điện tử kết nối người mua và nhà bán hàng. | Nền tảng phải hoàn tất thủ tục đăng ký/thông báo website cung cấp dịch vụ TMĐT với Bộ Công Thương trước khi vận hành chính thức. |

---

## 2. Thuật Ngữ Quản Lý Lịch, Ngày Nướng & Vận Hành (Production, Bake Date & Delivery)

| Thuật ngữ (English / Vietnamese) | Mô tả chi tiết | Quy định / Giá trị áp dụng |
| :--- | :--- | :--- |
| **Ngày Ra Lò Bánh Tươi (Bake Date)** | Ngày thợ làm bánh tại xưởng thực hiện nướng và đóng hộp bánh tươi. Luôn được xác định trước ngày khách nhận đúng 1 ngày. | Công thức chuẩn: `bake_date = expected_delivery_date - 1`. Toàn bộ Hạn ngạch nướng (`daily_capacities`) và Phiếu Ra Lò (Daily Production Sheet) được tính toán và trừ slot theo **`bake_date`**. |
| **Ngày Nhận Bánh Dự Kiến (Expected Delivery Date)** | Ngày người mua mong muốn nhận bánh tươi tại địa chỉ giao hàng. | Khách hàng chọn ngày này trên giao diện. Ràng buộc lead-time: `expected_delivery_date >= order_date + 3`. |
| **Lịch sản xuất Song Lịch (Dual Production Calendar)** | Công cụ quản lý dành riêng cho Provider, hiển thị lịch trả bánh và nướng bánh đồng thời bằng **Dương Lịch và Âm Lịch**. | Lõi tính toán chạy 100% theo Dương Lịch chuẩn (`LocalDate`). Lịch Âm chỉ hiển thị nhãn chuỗi ký tự tham khảo (Ví dụ: `25/09/2026 (15/08 Âm Lịch)`). |
| **Hạn ngạch nướng ngày (Daily Capacity Cap)** | Số lượng chiếc bánh tối đa mà xưởng có thể nướng trong 1 ngày ra lò (`bake_date`). | Nếu tổng số bánh cần nướng trong ngày `bake_date` đạt $100\%$ Hạn ngạch, hệ thống tự động khóa ngày giao tương ứng (`bake_date + 1`) trên trang mua hàng. |
| **Kế hoạch ra lò bánh (Daily Production Sheet)** | Báo cáo tự động gom tổng số lượng từng loại bánh lẻ cần nướng trong ngày `bake_date` từ tất cả các đơn B2C & B2B. | Xuất file in A4 cho thợ làm bánh tại xưởng. |
| **Phí vận chuyển theo khu vực (Shipping Fee Calculation)** | Khoản phí giao hàng được cấu hình theo Quận/Huyện/Tỉnh thành và cộng vào hóa đơn checkout (không bao gồm ứng dụng shipper riêng). | Hiển thị thành dòng phí riêng biệt trên hóa đơn. 1 đơn hàng chỉ mua từ 1 Provider duy nhất. |

---

## 3. Thuật Ngữ Mùa Vụ & Đặt Trước (Seasonality & Freshness)

| Thuật ngữ (English / Vietnamese) | Mô tả chi tiết | Quy định / Giá trị áp dụng |
| :--- | :--- | :--- |
| **Khung thời gian linh hoạt (Flexible Window)** | Hệ thống mở nhận đơn hàng B2C và yêu cầu B2B RFQ quanh năm, **không chặn cứng** theo khoảng thời gian mùa vụ Trung Thu (tháng 7 - 8 Âm Lịch). | Xưởng chủ động quản lý việc nhận đơn qua công tắc `is_season_active` và hạn ngạch `capacity_cap`. |
| **Hạn sử dụng bánh tươi (Fresh Shelf Life)** | Tính năng quản lý HSD tự động theo ngày ra lò. | **Đã cắt giảm khỏi phạm vi hệ thống** để tinh gọn luồng tạo sản phẩm và đơn hàng. |
| **Ràng buộc ngày đặt bánh (Order Lead-Time Rule)** | Thời gian tối thiểu giữa lúc bấm đặt hàng và ngày nhận bánh để xưởng kịp chuẩn bị nguyên liệu và xếp lịch ra lò. | Tối thiểu **3 ngày** (`expected_delivery_date >= CURRENT_DATE + 3`). **MVP chặn cứng mọi yêu cầu nhận dưới 3 ngày**, không hỗ trợ same-day/rush. |
| **Giao hàng theo đợt (Multi-batch Delivery)** | Giải pháp dành cho đơn hàng sỉ B2B: chia tổng số lượng đặt mua thành nhiều đợt giao vào các ngày/địa chỉ khác nhau để bánh luôn mới. | **MVP**: Toàn bộ đơn hàng giao 1 đợt duy nhất.<br>**Phase 2**: Cho phép chia tách đa đợt giao nhiều địa chỉ chi nhánh. |

---

## 4. Thuật Ngữ Giá Cả & Khuyến Mãi (Pricing & Discounts)

| Thuật ngữ (English / Vietnamese) | Mô tả chi tiết | Quy định / Giá trị áp dụng |
| :--- | :--- | :--- |
| **Giá Niêm Yết Chuẩn (Standard Listing Price)** | Đơn giá cơ sở của từng biến thể SKU do Provider thiết lập trong gian hàng. | Áp dụng mặc định quanh năm trong MVP (Hệ số mùa vụ $= 0.0$). Công thức: `Tổng giá = (Giá Bánh + Vỏ Hộp) * (1 + Hệ Số Mùa Vụ) + Phí In`. |
| **Chiến Dịch Giá Mùa Vụ (Seasonal Campaign Toggle - Phase 2)** | Cơ chế tùy chọn cho phép Admin/Provider kích hoạt chiến dịch: Early Bird (giảm 10-15%) hoặc Rush Peak (phụ thu 10-20% từ 06/08 đến 14/08 Âm lịch). | Không tự động ép buộc trong MVP. Chuyển sang Phase 2. |
| **Phí Sản Xuất Ưu Tiên Giao Gấp (Rush Production Fee - Phase 2)** | Phụ phí áp dụng khi khách hàng muốn nhận bánh khẩn cấp trong vòng 24h - 48h. | **MVP chặn cứng $< 3$ ngày**. Tính năng thu phí giao gấp 50k/hộp chuyển sang Phase 2. |
| **Báo Giá Thương Lượng B2B (B2B Custom Quotation)** | Mức giá và chiết khấu đặc biệt dành cho đơn hàng sỉ $\ge 20$ hộp. | Trong mô hình RFQ, do Provider tự đề xuất trong báo giá riêng, không áp cứng tự động trên sàn. |
