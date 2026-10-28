# Kế hoạch hóa đơn điện tử VAT

## Hiện trạng

Checkout đã nhận tên công ty, mã số thuế, địa chỉ và email khi khách tích yêu cầu hóa đơn. Backend lưu bản chụp này trên từng `Order` (`requireVatInvoice`, `vat*`). Hệ thống chưa lập hóa đơn điện tử, chưa có trạng thái hóa đơn và chưa trả tệp hóa đơn cho người mua. Cần đổi nhãn checkout thành **“Yêu cầu hóa đơn VAT”** cho đến khi hoàn tất tích hợp phát hành.

## Quyết định nghiệp vụ trước khi phát triển

1. Xác nhận **đơn vị bán hàng và xuất hóa đơn**: hiện một giỏ tạo một đơn cho mỗi xưởng. Theo mô hình hiện tại, mỗi xưởng cần hồ sơ pháp lý, mã số thuế, chữ ký số và tài khoản nhà cung cấp hóa đơn riêng; nếu nền tảng là bên bán trên chứng từ thì phải thiết kế lại theo mô hình đó.
2. Kế toán xác nhận giá sản phẩm và phí vận chuyển đang là giá đã gồm VAT hay chưa, thuế suất áp dụng theo từng mặt hàng/dịch vụ, cách làm tròn và cách thể hiện giảm giá. Không tự cộng một thuế suất cố định khi khách tích ô hóa đơn; tổng thanh toán checkout phải giữ đúng giá đã công bố.
3. Kế toán xác nhận thời điểm lập hóa đơn cho hàng hóa theo trạng thái giao/chuyển quyền sở hữu và luồng đặt cọc; không phát hành ngay lúc tạo đơn. Căn cứ triển khai: [Nghị định 254/2026/NĐ-CP](https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-so-254-2026-nd-cp-ve-hoa-don-dien-tu-chung-tu-dien-tu-119260713164251972.htm), đặc biệt quy định thời điểm lập hóa đơn tại Điều 9.
4. Chọn nhà cung cấp hóa đơn điện tử có API phát hành, tra cứu, điều chỉnh/thay thế và gửi email; xác nhận loại hóa đơn mà từng xưởng được sử dụng.

## Luồng đề xuất

1. **Checkout:** khách tích yêu cầu hóa đơn, nhập và xác nhận thông tin doanh nghiệp. Backend kiểm tra định dạng, lưu bản chụp trên từng đơn của từng xưởng. Hiển thị “Đã tiếp nhận yêu cầu”, không hiển thị “Đã xuất hóa đơn”.
2. **Sau đặt hàng:** người bán xem yêu cầu và đối chiếu thông tin trước khi phát hành. Cho phép khách đề nghị sửa thông tin khi hóa đơn chưa phát hành; ghi lịch sử thay đổi.
3. **Đến thời điểm phải lập hóa đơn:** backend tạo một tác vụ phát hành cho mỗi đơn/xưởng, lấy các dòng hàng và phí vận chuyển từ dữ liệu giá đã chốt trên server, tính thuế theo cấu hình được kế toán duyệt, rồi gửi API nhà cung cấp hóa đơn. Dùng khóa idempotency theo `orderId` và loại tác vụ để tránh phát hành trùng khi retry.
4. **Phản hồi:** lưu mã số hóa đơn, ký hiệu, thời điểm phát hành, trạng thái, mã tra cứu, tệp XML/PDF hoặc URL bảo mật và lỗi tích hợp. Gửi hóa đơn qua email nhà cung cấp; hiển thị trạng thái và liên kết tra cứu/tải trên chi tiết đơn hàng cho đúng người mua và xưởng.
5. **Đơn hủy/hoàn tiền/đổi trả:** nếu chưa phát hành, hủy tác vụ; nếu đã phát hành, đi theo luồng điều chỉnh hoặc thay thế theo nhà cung cấp và quy định áp dụng. Không xóa chứng từ đã phát hành.

## Thay đổi kỹ thuật

- Bổ sung hồ sơ xuất hóa đơn của xưởng và cấu hình thuế theo loại hàng/dịch vụ; chỉ seller/admin được sửa, lưu lịch sử.
- Bổ sung bảng `invoice` liên kết `order_id`, `provider_id`, trạng thái (`REQUESTED`, `PENDING`, `ISSUED`, `FAILED`, `ADJUSTED`), dữ liệu người mua/bán tại thời điểm phát hành, số tiền và thuế theo từng dòng, mã nhà cung cấp, tệp/URL và audit timestamps.
- Tách `InvoiceService` và adapter cho nhà cung cấp hóa đơn; phát hành qua queue/outbox có retry, idempotency, webhook xác thực và tác vụ đối soát cho trường hợp callback mất.
- API tối thiểu: seller xem/duyệt yêu cầu; buyer xem trạng thái và tải/tra cứu; admin xem lỗi và retry theo quyền. Tất cả thao tác kiểm tra quyền theo `orderId` và `providerId`.
- Kiểm thử: giỏ nhiều xưởng, COD/VietQR đặt cọc/trả đủ, phát hành một lần dù retry, lỗi nhà cung cấp, sửa thông tin trước phát hành, hủy trước/sau phát hành, tổng tiền hóa đơn khớp đơn và thuế suất được duyệt.

## Thứ tự triển khai

1. Chốt 4 quyết định nghiệp vụ ở trên với kế toán và các xưởng.
2. Làm trạng thái yêu cầu, màn hình xác nhận thông tin và hồ sơ người bán.
3. Tích hợp môi trường thử nghiệm của nhà cung cấp hóa đơn và kiểm tra đối soát.
4. Chạy thử với một xưởng, sau đó mở cho các xưởng còn lại.
