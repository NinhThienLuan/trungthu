# BE3: Checkout, giá, vòng đời đơn, RFQ và thanh toán

Triển khai MVP trong `be/`. Schema được Hibernate cập nhật theo `ddl-auto=update` của môi trường dev; không reset dữ liệu. Provider cần tài khoản ACTIVE, hồ sơ ATTP đã duyệt, công tắc nhận đơn bật và gói SaaS ACTIVE còn hạn.

## Giá và checkout

`POST /api/checkout/preview` chỉ đọc; `POST /api/checkout` kiểm tra lại và reserve trong một transaction cho toàn giỏ. Request ví dụ:

```json
{
  "receiverName": "Nguyen Van A",
  "receiverPhone": "0901234567",
  "shippingAddress": "12 Nguyen Hue, Quan 1, TP HCM",
  "groups": [{
    "deliveryDate": "2026-11-05",
    "province": "HCM",
    "district": "District 1",
    "paymentMethod": "VIETQR",
    "depositOption": "MIN_DEPOSIT",
    "items": [{ "variantId": "<UUID>", "quantity": 2, "personalizationText": "Chuc mung" }]
  }]
}
```

`providerId` của nhóm là tùy chọn và chỉ dùng đối chiếu; backend xác định chủ SKU từ database. `depositOption` nhận `MIN_DEPOSIT` hoặc `FULL`; có thể dùng `payInFull: true`. `vat` theo `CreateOrdersCommand.VatInfo` là tùy chọn. Preview cho phép để trống người nhận/địa chỉ nhưng vẫn cần tỉnh và quận/huyện để tính ship. Response có `groups` với `lines`, `merchandiseAmount`, `personalizationFee`, `subtotalAmount`, `shippingFee`, `totalAmount`, `minDepositAmount`, `depositAmount`, `codAllowed`; ngoài cùng có `grandTotal`.

MVP dùng giá niêm yết quanh năm. In chữ trên `BOX_SHELL` là 20.000 VNĐ/hộp nếu một đơn Provider in dưới 5 hộp; từ 5 hộp miễn phí. Tiền in là snapshot riêng ở `OrderItem`. Giao dưới 3 ngày theo giờ Việt Nam, SKU hết kho, slot ngày nướng thiếu, Provider chưa đủ điều kiện, địa bàn chưa có cước đều bị chặn. Custom box tự phối trong `boxes` trả 400 vì thuộc Phase 2. COD chỉ cho đơn dưới 2 triệu và không in riêng. QR cọc tối thiểu 50% làm tròn lên VNĐ, hoặc trả đủ.

Phí ship lấy từ `PROVIDER_SHIPPING_RATE`, khóa `(provider_id, province, district)`; chuỗi khu vực được trim và đổi chữ thường. Provider thiết lập bằng `PUT /api/provider/checkout-settings/shipping-rate` với `{ "province": "HCM", "district": "District 1", "fee": 30000 }`. Chưa có cước thì checkout trả 409, không tự đặt phí bằng 0 và không tin giá client.

Submit trả `ApiResponseDTO<List<OrderDetailResponse>>`, một Order/Provider với cùng `checkoutId` nội bộ. Stock Variant và `DailyCapacity` được khóa khi ghi; BE4 lưu Order/Batch/Item/Payment trong cùng transaction. Một nhóm lỗi thì toàn bộ rollback.

## Thanh toán VietQR và lifecycle

Provider thiết lập ngân hàng bằng `PUT /api/provider/checkout-settings/bank-account` với `bankCode`, `accountNumber`, `accountName`. `GET /api/orders/{id}/vietqr` trả thông tin chuyển khoản và Quick Link ảnh QR cho Buyer/Seller sở hữu khi hold còn hạn. Backend chỉ dựng URL; không tải ảnh/gọi mạng trong transaction checkout. Buyer/Seller phải đối soát tiền thực nhận, ảnh QR không xác nhận thanh toán tự động.

Với `paymentMethod: "VIETQR"`, checkout tạo một Order và một `PAYMENT_TRANSACTION` PENDING cho mỗi Provider. `holdExpiresAt = orderedAt + 5 giờ`; không gia hạn. Mỗi seller nhận vào tài khoản ngân hàng riêng. Nếu checkout một giỏ có nhiều seller, frontend gọi `GET /api/orders/{id}/vietqr` cho từng Order trong response.

- `POST /api/provider/orders/{id}/confirm-deposit`: `{ "receivedAmount": 115000 }`.
- `POST /api/orders/{id}/cancel`: chỉ pending deposit hoặc COD chưa sản xuất.
- `PATCH /api/provider/orders/{id}/status`: `{ "status": "BAKING_QUEUED" }`, sau đó `DELIVERING`, cuối cùng `{ "status": "COMPLETED", "collectedAmount": 115000 }` nếu còn tiền phải thu.

Cron mỗi phút khóa lại từng Order quá hạn và hủy/nhả stock/slot trong transaction riêng. Các thao tác xác nhận cọc, hủy và cron đều khóa cùng Order; không nhả lần hai. Giao dịch `SUCCESS` mới được cộng vào số đã thanh toán.

## RFQ

`POST /api/rfqs` dành cho Customer với `companyName`, `taxCode`, `contactName`, `contactPosition`, `contactPhone`, `contactEmail`, `requestedQuantity >= 20`, `expectedDeliveryDate >= hôm nay + 3`, và tùy chọn `expectedBudget`, `description`, `logoUrl`. `GET /api/rfqs/me` trả tối đa 100 yêu cầu của Buyer. `GET /api/provider/rfqs` trả RFQ đang mở cho Provider đủ điều kiện, ẩn thông tin liên hệ cho đến khi báo giá được chấp nhận. `logoUrl` là đường dẫn do tầng upload/storage cung cấp; form hiện tại chưa có upload logo.

Luồng báo giá trực tuyến: Provider dùng `GET /api/provider/rfqs/quotes/me` và `POST /api/provider/rfqs/{requestId}/quotes`; Buyer dùng `GET /api/rfqs/{requestId}/quotes` để so sánh và `POST /api/rfqs/{requestId}/quotes/{quoteId}/accept` để chọn một báo giá. Mỗi Provider gửi tối đa một báo giá cho một RFQ. Chọn báo giá chuyển RFQ sang `WON`, báo giá được chọn sang `ACCEPTED`, các báo giá khác sang `REJECTED`. Chưa tự tạo đơn hàng B2B, hợp đồng, thanh toán hoặc hóa đơn VAT từ RFQ được chọn.

## Ghép FE

FE nhập `province`/`district` để preview cước, submit checkout rồi mỗi thẻ đơn gọi `GET /api/orders/{id}/vietqr`. Đồng hồ dùng `holdExpiresAt`; sau khi seller xác nhận cọc, buyer đọc lại trạng thái từ backend. `USE_MOCK.checkout`/`USE_MOCK.orders` đang là `false` để gọi API thật; sản phẩm trong giỏ phải có UUID thật của backend và seller phải cấu hình ngân hàng. Không gửi `boxes` tự phối trong MVP.

Quick Link tuân theo [cú pháp VietQR](https://www.vietqr.io/qr-dong). Ảnh do bên thứ ba tạo khi trình duyệt tải URL; kiểm tra tài khoản ngân hàng Provider trước khi cho đặt cọc.
