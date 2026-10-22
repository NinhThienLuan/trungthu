# WebSocket tồn

Master không phát tồn theo thời gian thực. Code hiện tại có một kênh `/ws/stock`. Tài liệu này chỉ nói payload và việc bỏ chọn giỏ trên server.

## Kênh

`StockWebSocketConfig` đăng ký `StockWebSocketHandler` tại `/ws/stock` và cho mọi origin. `WebSecurityConfig` để `/ws/**` public, không cần đăng nhập.

Handler giữ các session đang mở và gửi cùng một chuỗi JSON cho mọi session. Session đã đóng thì bỏ qua. Lỗi gửi một session không chặn các session khác.

## Thời điểm phát

Các thao tác kho phát `StockChangedEvent` với id phân loại. `StockBroadcastListener` nghe ở `AFTER_COMMIT` trong một transaction mới. Nếu transaction gốc rollback, không có tin.

Listener đọc lại phân loại, bỏ chọn giỏ bánh lẻ không còn đủ hàng, rồi phát tin bánh lẻ. Sau đó tìm mọi set có phân loại này trong công thức. Với mỗi set, tính số set còn lại bằng tổng `quantity` của dòng hộp, bỏ chọn giỏ set nếu số đó nhỏ hơn số đang chọn, rồi phát tin set.

Vì một set có nhiều thành phần, một transaction có thể phát nhiều tin set giống nhau. Nội dung giống nhau, người nhận tải lại cũng ra cùng một kết quả.

## Tin bánh lẻ

```json
{"variantId":"<uuid>","stockQuantity":24,"status":"IN_STOCK"}
```

`stockQuantity` là tồn lẻ, không cộng hàng đang nằm trong set. `status` là `IN_STOCK` hoặc `OUT_OF_STOCK` của phân loại.

Bỏ chọn giỏ: dòng có `variant_id` trùng, đang chọn, và tồn lẻ nhỏ hơn số lượng hoặc phân loại không còn `IN_STOCK`.

## Tin set

```json
{"setProductId":"<uuid>","assembledQuantity":3,"status":"IN_STOCK"}
```

`assembledQuantity` là số set còn đóng. `status` là `IN_STOCK` khi số đó lớn hơn 0, ngược lại `OUT_OF_STOCK`. Tin này không mang tồn lẻ của bánh.

Bỏ chọn giỏ: dòng có `set_product_id` trùng, đang chọn, và số set còn lại nhỏ hơn số lượng trong giỏ.

## Những gì kênh không làm

Kênh không phát khi chỉ đổi tên, giá hoặc ảnh. Không phát id đơn. Không tự cập nhật catalog. Khách vẫn phải gọi API sản phẩm nếu muốn danh sách mới. Việc mua được hay không vẫn do giữ hàng quyết định lúc checkout.
