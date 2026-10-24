# VietQR trên máy cá nhân: xác nhận cọc thủ công

Luồng này không cần deploy backend hoặc đăng ký VietQR Callback. QR chuyển tiền vào tài khoản ngân hàng của từng seller. VietQR tạo QR, còn seller kiểm tra tiền vào ngân hàng và tự xác nhận cọc; backend không thể tự biết giao dịch đã thành công.

## Luồng đơn hàng

1. Seller đăng nhập và lưu tài khoản nhận tiền bằng `PUT /api/provider/checkout-settings/bank-account`:

   ```json
   {"bankCode":"VCB","accountNumber":"123456789","accountName":"TEN CHU TAI KHOAN"}
   ```

2. Buyer chọn sản phẩm, ngày nhận, khu vực giao hàng và `VIETQR` (cọc tối thiểu 50% hoặc trả đủ). `POST /api/checkout/preview` chỉ tính giá; `POST /api/checkout` tạo một đơn cho mỗi seller, giữ hàng và suất sản xuất. Nếu một seller hết hàng hoặc suất, toàn bộ checkout rollback.
3. Mỗi đơn `PENDING_DEPOSIT` có `holdExpiresAt = orderedAt + 5 giờ`. Buyer xem QR bằng `GET /api/orders/{id}/vietqr`. Mỗi QR chứa đúng tài khoản seller, số tiền phải chuyển và mã đơn trong nội dung chuyển khoản.
4. Seller xem giao dịch đến trong ứng dụng ngân hàng, kiểm tra **tài khoản nhận, số tiền, nội dung chuyển khoản** với đơn tương ứng. Khi đã nhận tiền, seller đăng nhập và gọi `POST /api/provider/orders/{id}/confirm-deposit`:

   ```json
   {"receivedAmount":115000}
   ```

   Backend chỉ cho provider sở hữu đơn xác nhận khi đơn còn trong thời hạn. Đơn chuyển sang `DEPOSITED`. Buyer mở lại chi tiết đơn để thấy trạng thái mới.
5. Nếu đến hạn mà chưa được xác nhận, job chạy khoảng mỗi phút huỷ đơn và trả hàng/suất sản xuất. Không gia hạn vượt quá 5 giờ. Nếu khách chuyển tiền khi đơn đã hết hạn, seller cần đối soát và xử lý hoàn tiền hoặc tạo đơn mới ngoài luồng tự động.

## Thử trên localhost với backend thật

1. Chạy SQL Server, Spring Boot ở `localhost:8080` (`cd be; .\mvnw.cmd spring-boot:run`) và Vite ở `localhost:5173` (`cd fe; npm run dev`). Vite proxy `/api` sang Spring Boot. Nếu SQL Server chưa chạy, có thể chạy `cd be; .\mvnw.cmd test` để kiểm thử logic bằng H2, nhưng không thể thử checkout thực trên web.
2. Frontend hiện dùng API thật cho sản phẩm, checkout và orders (`USE_MOCK.products`, `USE_MOCK.checkout`, `USE_MOCK.orders` đều là `false` trong `fe/src/apis/mock.ts`). Tạo dữ liệu sản phẩm/variant thật và làm mới giỏ hàng để dùng UUID thật. Nếu bật lại mock để demo, QR demo **không dùng để chuyển tiền**.
3. Chuẩn bị cho **mỗi seller**: tài khoản `PROVIDER` ACTIVE, hồ sơ được duyệt, công tắc nhận đơn bật, subscription ACTIVE còn hạn, variant còn hàng, cước ship theo khu vực và suất sản xuất cho ngày nướng nếu có bánh. Đăng nhập seller qua `POST /api/auth/login` với `{ "email": "...", "password": "..." }`. Dùng `PUT /api/provider/checkout-settings/bank-account` để nhập đúng ngân hàng/số tài khoản/tên chủ tài khoản; dùng `PUT /api/provider/checkout-settings/shipping-rate` với `{ "province": "HCM", "district": "District 1", "fee": 30000 }` cho khu vực thử.
4. Đăng nhập buyer, gọi `POST /api/checkout/preview` rồi `POST /api/checkout` với cùng request. Ngày nhận cần ít nhất 3 ngày sau hôm nay. Ví dụ một seller (đổi UUID và ngày):

   ```json
   {
     "receiverName": "Nguyen Van A",
     "receiverPhone": "0901234567",
     "shippingAddress": "12 Nguyen Hue, TP HCM",
     "groups": [{
       "deliveryDate": "2026-10-29",
       "province": "HCM",
       "district": "District 1",
       "paymentMethod": "VIETQR",
       "depositOption": "MIN_DEPOSIT",
       "items": [{ "variantId": "<UUID_VARIANT_THAT>", "quantity": 1 }]
     }]
   }
   ```

   Với hai seller, thêm một `group` chứa variant của seller thứ hai. Checkout trả hai `id` riêng, mỗi đơn có `status=PENDING_DEPOSIT` và `holdExpiresAt` sau 5 giờ.
5. Buyer gọi `GET /api/orders/{id}/vietqr` cho **từng** đơn. Kiểm tra `accountNumber`, `amount`, `transferContent` và mở `imageUrl`; với hai seller, `accountNumber` phải đúng tài khoản từng seller và `transferContent` khác nhau. Chỉ quét chuyển tiền nếu đây là thông tin tài khoản thật và bạn chủ động muốn thử giao dịch thật.
6. Seller đăng nhập, kiểm tra tiền đã vào ngân hàng và đối chiếu đúng tài khoản, số tiền, nội dung chuyển khoản. Gọi `POST /api/provider/orders/{id}/confirm-deposit` với `{ "receivedAmount": 115000 }` (thay bằng số tiền thực nhận, ít nhất bằng cọc và không vượt tổng đơn). Buyer tải lại `GET /api/orders/{id}`: kỳ vọng `status=DEPOSITED`, `holdExpiresAt=null`. Seller khác không xác nhận được đơn này.
7. Để thử hết hạn, dùng dữ liệu test và kiểm tra khi `holdExpiresAt` qua mốc 5 giờ: job chạy khoảng mỗi phút, đơn chuyển `CANCELLED`, hàng/suất được trả lại. Không chuyển khoản vào đơn đã hết hạn.

Có thể gọi các API trên bằng Swagger tại `http://localhost:8080/swagger-ui.html` sau khi đăng nhập đúng vai trò; dùng phiên riêng cho buyer và từng seller. Trang quản lý đơn seller hiện là giao diện mẫu, nên thao tác xác nhận cọc trong bước thử backend thực hiện qua API.

## Nếu dùng lại SQL Server đã có dữ liệu PayOS

Source code không còn nhận PayOS. Hibernate `ddl-auto=update` không tự xóa bảng/cột PayOS cũ. Trước khi chạy ứng dụng trên database cũ, kiểm tra bằng lệnh chỉ đọc:

```sql
SELECT COUNT(*) AS payos_order_count FROM dbo.[ORDER] WHERE payment_method = 'PAYOS';
SELECT COUNT(*) AS payos_transaction_count FROM dbo.PAYMENT_TRANSACTION WHERE payment_method = 'PAYOS';
```

Nếu một trong hai số lớn hơn 0, cần đối soát các thanh toán đang chờ và quyết định cách lưu lịch sử dữ liệu trước khi xóa hoặc chuyển đổi chúng. Enum Java hiện không còn `PAYOS`, nên không dùng database chứa các bản ghi đó để thử luồng mới. Không tự chạy lệnh xóa dữ liệu.

Khi cần xác nhận tự động bằng VietQR Callback, phải đăng ký dịch vụ và có HTTPS công khai để VietQR gửi biến động số dư. Luồng thủ công này không nhận callback.
