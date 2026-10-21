# BE3: Checkout, giá, vòng đời đơn, RFQ và thanh toán

Triển khai MVP trong `be/`. Schema được Hibernate cập nhật theo `ddl-auto=update` của môi trường dev; không reset dữ liệu. Với SQL Server đã tạo bảng ORDER trước khi thêm PAYOS, khởi động BE một lần để Hibernate thêm cột rồi chạy `be/src/main/resources/db/manual/payos_hold_state_sqlserver.sql` vì Hibernate không tự sửa CHECK constraint cũ và SQL Server cần filtered unique index cho mã PayOS nullable. Provider cần tài khoản ACTIVE, hồ sơ ATTP đã duyệt, công tắc nhận đơn bật và gói SaaS ACTIVE còn hạn.

## Giá và checkout

`POST /api/checkout/preview` chỉ đọc; `POST /api/checkout` kiểm tra lại và reserve trong một transaction cho toàn giỏ. Request ví dụ:

```json
{
  "receiverName": "Nguyen Van A",
  "receiverPhone": "0901234567",
  "shippingAddress": "12 Nguyen Hue, Quan 1, TP HCM",
  "groups": [{
    "deliveryDate": "2026-10-25",
    "province": "HCM",
    "district": "District 1",
    "paymentMethod": "PAYOS",
    "depositOption": "MIN_DEPOSIT",
    "items": [{ "variantId": "<UUID>", "quantity": 2, "personalizationText": "Chuc mung" }]
  }]
}
```

`providerId` của nhóm là tùy chọn và chỉ dùng đối chiếu; backend xác định chủ SKU từ database. `depositOption` nhận `MIN_DEPOSIT` hoặc `FULL`; có thể dùng `payInFull: true`. `vat` theo `CreateOrdersCommand.VatInfo` là tùy chọn. Preview cho phép để trống người nhận/địa chỉ nhưng vẫn cần tỉnh và quận/huyện để tính ship. Response có `groups` với `lines`, `merchandiseAmount`, `personalizationFee`, `subtotalAmount`, `shippingFee`, `totalAmount`, `minDepositAmount`, `depositAmount`, `codAllowed`; ngoài cùng có `grandTotal`.

MVP dùng giá niêm yết quanh năm. In chữ trên `BOX_SHELL` là 20.000 VNĐ/hộp nếu một đơn Provider in dưới 5 hộp; từ 5 hộp miễn phí. Tiền in là snapshot riêng ở `OrderItem`. Giao dưới 3 ngày theo giờ Việt Nam, SKU hết kho, slot ngày nướng thiếu, Provider chưa đủ điều kiện, địa bàn chưa có cước đều bị chặn. Custom box tự phối trong `boxes` trả 400 vì thuộc Phase 2. COD chỉ cho đơn dưới 2 triệu và không in riêng. QR cọc tối thiểu 50% làm tròn lên VNĐ, hoặc trả đủ.

Phí ship lấy từ `PROVIDER_SHIPPING_RATE`, khóa `(provider_id, province, district)`; chuỗi khu vực được trim và đổi chữ thường. Provider thiết lập bằng `PUT /api/provider/checkout-settings/shipping-rate` với `{ "province": "HCM", "district": "District 1", "fee": 30000 }`. Chưa có cước thì checkout trả 409, không tự đặt phí bằng 0 và không tin giá client.

Submit trả `ApiResponseDTO<List<OrderDetailResponse>>`, một Order/Provider với cùng `checkoutId` nội bộ. Stock Variant và `DailyCapacity` được khóa khi ghi; BE4 lưu Order/Batch/Item/Payment trong cùng transaction. Một nhóm lỗi thì toàn bộ rollback.

## Thanh toán PayOS và lifecycle

Với `paymentMethod: "PAYOS"`, checkout tạo một Order và một `PAYMENT_TRANSACTION` PENDING cho mỗi Provider. Mỗi transaction có `payosOrderCode` duy nhất. `holdExpiresAt = orderedAt + 5 giờ` và payOS `expiredAt` dùng chính mốc này; PayOS không được gia hạn. Nếu giỏ có nhiều seller, FE gọi `POST /api/orders/{id}/payos` cho **từng** Order trong response checkout. API này chỉ dành cho Customer sở hữu đơn, tạo hoặc trả lại link PayOS đã lưu, gồm `checkoutUrl`, chuỗi EMV `qrCode`, `amount`, `expiresAt`. FE có thể hiển thị QR từ chuỗi này hoặc dẫn khách tới `checkoutUrl`. Link được tạo sau transaction checkout để lỗi mạng PayOS không làm bỏ dở một nửa giỏ; nếu link chưa tạo được, đơn vẫn giữ hàng đến hạn và FE có thể gọi lại endpoint.

Backend nhận `POST /api/payments/payos/webhook` công khai cho payOS, xác thực HMAC SHA-256 bằng Checksum Key, so `orderCode`, số tiền, VND và `paymentLinkId`, sau đó xác nhận cọc đúng một lần. Trang `returnUrl` chỉ dùng để đưa trình duyệt về FE; FE phải đọc lại trạng thái đơn từ backend. Webhook tới sau khi đơn đã hủy/hết hạn được ghi `payosExternalReference` để đối soát/hoàn tiền thủ công, không tự giữ lại hàng. Khi hủy đơn, backend yêu cầu payOS hủy link sau khi transaction DB đã commit. Nếu payOS tạm lỗi, cần đối soát link còn mở; mốc `expiredAt` vẫn giới hạn thời gian thanh toán.

Mỗi seller có **kênh PayOS riêng**. Server đặt `PAYOS_MASTER_KEY` (base64 của 32 byte ngẫu nhiên) trong biến môi trường hoặc `secrets.properties` đã bị Git bỏ qua. Seller đã đăng nhập gửi `PUT /api/provider/payos/account` với `{ "clientId": "...", "apiKey": "...", "checksumKey": "..." }`. API Key và Checksum Key được mã hóa AES-GCM trước khi lưu DB; API không trả lại khóa. Backend chọn kênh theo Provider của Order khi tạo link, hủy link và xác minh webhook. Không cấu hình kênh thì API tạo link trả 409; thiếu master key trả 503. Cần sao lưu master key an toàn: mất key sẽ không giải mã được khóa đã lưu. `PAYOS_RETURN_URL` và `PAYOS_CANCEL_URL` trỏ về FE. Đặt `PAYOS_WEBHOOK_URL=https://<backend-domain>/api/payments/payos/webhook`; sau khi nhập khóa, mỗi seller gọi `POST /api/provider/payos/account/webhook` để đăng ký URL trên kênh của mình. payOS sẽ gửi webhook mẫu để kiểm tra URL. Checkout PayOS chỉ mở khi đăng ký webhook thành công; thay khóa sẽ yêu cầu đăng ký lại. Cấu hình chung nằm trong `application.properties`, không thêm profile SQL riêng.

PowerShell tạo master key một lần: `[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))`. Giữ khóa này cố định và sao lưu ngoài Git. Mỗi kênh seller cần đủ ba giá trị từ payOS: Client ID, API Key, Checksum Key.

### VietQR cũ

Provider thiết lập ngân hàng bằng `PUT /api/provider/checkout-settings/bank-account` với `bankCode`, `accountNumber`, `accountName`. `GET /api/orders/{id}/vietqr` trả thông tin chuyển khoản và Quick Link ảnh QR cho Buyer/Seller sở hữu khi hold còn hạn. Backend chỉ dựng URL; không tải ảnh/gọi mạng trong transaction checkout. Buyer/Seller phải đối soát tiền thực nhận, ảnh QR không xác nhận thanh toán tự động.

- `POST /api/provider/orders/{id}/confirm-deposit`: `{ "receivedAmount": 115000 }`.
- `POST /api/provider/orders/{id}/extend-hold`: `{ "reason": "Buyer needs more time" }`; một lần, thêm 15 phút, trước hạn.
- `POST /api/orders/{id}/cancel`: chỉ pending deposit hoặc COD chưa sản xuất.
- `PATCH /api/provider/orders/{id}/status`: `{ "status": "BAKING_QUEUED" }`, sau đó `DELIVERING`, cuối cùng `{ "status": "COMPLETED", "collectedAmount": 115000 }` nếu còn tiền phải thu.

Cron mỗi phút khóa lại từng Order quá hạn và hủy/nhả stock/slot trong transaction riêng. Các thao tác xác nhận cọc, gia hạn, hủy và cron đều khóa cùng Order; không nhả lần hai. Giao dịch `SUCCESS` mới được cộng vào số đã thanh toán.

## RFQ

`POST /api/rfqs` dành cho Customer với `companyName`, `taxCode`, `contactName`, `contactPosition`, `contactPhone`, `contactEmail`, `requestedQuantity >= 20`, `expectedDeliveryDate >= hôm nay + 3`, và tùy chọn `expectedBudget`, `description`, `logoUrl`. `GET /api/rfqs/me` trả tối đa 100 yêu cầu của Buyer. `GET /api/provider/rfqs` chỉ trả yêu cầu DISTRIBUTED cho Provider đủ điều kiện. `logoUrl` là đường dẫn do tầng upload/storage cung cấp; BE3 không nhận file trực tiếp. Báo giá trực tuyến là Phase 2.

## Ghép FE

FE có giao diện PayOS theo từng seller: nhập `province`/`district` để preview cước, submit checkout rồi mỗi thẻ đơn gọi `POST /api/orders/{id}/payos` và vẽ `qrCode` ngay trong trình duyệt. Đồng hồ dùng `holdExpiresAt`; trang trả về `/orders` phải đọc lại trạng thái từ backend, không tin query string của `returnUrl`. `USE_MOCK.checkout`/`USE_MOCK.orders` còn bật cho demo (mã QR demo có cảnh báo); khi catalog/cart dùng UUID thật của backend và seller đã cấu hình PayOS, chuyển các cờ này sang `false` để dùng API thật. Không gửi `boxes` tự phối trong MVP. VietQR là luồng cũ và vẫn có `GET /api/orders/{id}/vietqr`.

Quick Link tuân theo [cú pháp VietQR](https://www.vietqr.io/qr-dong). Ảnh do bên thứ ba tạo khi trình duyệt tải URL; kiểm tra tài khoản ngân hàng Provider trước khi cho đặt cọc.
