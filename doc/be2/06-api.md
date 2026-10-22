# API

Các endpoint dưới đây là phần mới hoặc đã đổi so với master. Response bọc trong `ApiResponseDTO`. Role lấy từ `@PreAuthorize`. Lỗi nghiệp vụ thường là `400` khi đầu vào sai và `409` khi trạng thái hoặc tồn không cho làm.

## Quyền catalog

Trên master, `/api/products/**` là public cho mọi method. Hiện chỉ `GET /api/products/**` và `GET /api/public/**` là public. `POST /api/payments/payos/webhook` public đúng method POST. `/ws/**` public. Method khác trên `/api/products` phải đăng nhập.

Khách đọc catalog không nhận `stockQuantity`. Response phân loại có `purchasable`. Người bán nhận tồn khi xem sản phẩm của mình.

## Sản phẩm của người bán

Prefix `/api/provider/products`. Role `PROVIDER`.

- `GET /` liệt kê sản phẩm của người bán đang đăng nhập.
- `POST /` tạo sản phẩm nháp. Gửi trạng thái thì `400`.
- `PUT /{productId}` sửa thông tin và chuyển trạng thái. Hết hàng không gán tay. Đổi loại sau khi đã có phân loại thì `400`.
- `PUT /{productId}/images` thay cả album.
- `POST /{productId}/archive` xóa mềm. Đơn mở trên đúng kênh thì `409`.
- `POST /{productId}/discontinue` ngừng bán lẻ hoặc ngừng set. Đơn đang xác nhận, đã cọc hoặc chờ nướng trên kênh đó thì `409`.
- `POST /{productId}/variants` thêm phân loại. Set thì `400`. Tồn mở đầu trống hoặc không lớn hơn 0 thì `400`. SKU trùng thì `409`.
- `PUT /{productId}/variants/{variantId}` sửa phân loại. Sản phẩm đã đăng bán mà gửi tồn hoặc trạng thái thì `400`.
- `DELETE /{productId}/variants/{variantId}` xóa phân loại khi còn cho phép.
- `POST /{productId}/variants/{variantId}/imports` nhập kho. Nháp hoặc đã lưu trữ thì `409`.
- `POST /{productId}/variants/{variantId}/adjustments` trừ kho hỏng hoặc hết dùng. Vượt tồn lẻ thì xung đột tồn. Nháp thì `409`.
- `POST /{productId}/variants/{variantId}/terminate` báo hết hàng phân loại. Cần lý do. Nháp thì `409`.
- `GET /{productId}/variants/{variantId}/audits` sổ kho, phân trang.
- `GET /{productId}/variants/{variantId}/stats` số liệu thác nước của phân loại.
- `GET /{productId}/variants/{variantId}/order-stats` thống kê đơn của phân loại.

## Set

Cùng prefix và cùng role `PROVIDER`.

- `POST /{productId}/composition` lưu công thức. Set đã có hàng đóng thì phải hoàn tác trước.
- `POST /{productId}/composition/stock` nhập set. Nháp thì ghi đè và không cần lý do. Đã đăng bán mà thiếu lý do thì `400`.
- `POST /{productId}/composition/release` hoàn tác toàn bộ hàng đang đóng.
- `DELETE /{productId}/composition` xóa công thức. Chỉ khi còn nháp và đã hoàn tác nhập.
- `POST /{productId}/components` và `PATCH /{productId}/components/{componentId}` thêm hoặc giảm thành phần theo đường cũ.
- `POST /{productId}/set-adjustments` hao hụt set. Nháp thì `409`.
- `GET /{productId}/set-stats` thác nước của set.
- `GET /{productId}/set-audits` sổ set.
- `GET /{productId}/set-order-stats` thống kê đơn của set.

## Giỏ

Prefix `/api/cart`. Role `CUSTOMER`.

- `GET /` danh sách dòng.
- `POST /` thêm phân loại hoặc set. Hết hàng hoặc vượt tồn thì `400`.
- `PATCH /{id}` sửa số lượng hoặc chọn mua. `id` là id phân loại hoặc id set. Chọn một dòng không mua được thì không giữ trạng thái chọn.
- `DELETE /{id}` xóa dòng.
- `POST /{variantId}/swap/{targetVariantId}` đổi sang phân loại khác cùng kiểu mua.

Một khách chỉ có một dòng cho một phân loại và một dòng cho một set.

## Dashboard

`GET /api/provider/dashboard`. Role `PROVIDER`. Trả số đơn, đơn đã bán, đơn hủy, đơn chờ, doanh thu gốc, tổng chiết khấu, doanh thu thực, và các hạng phân loại, khách mua, khách hủy.

## API giữ và trả tồn

Prefix `/api/dummy`. Đây là API backend để chạy giữ hàng, trả hàng và đổi trạng thái đơn. Không phải hợp đồng checkout của BE3.

- `POST /checkout`, role `CUSTOMER`. Lấy dòng giỏ đang chọn, giữ tồn, tạo đơn VietQR. Giỏ trống thì `400`.
- `POST /orders/{orderId}/pay`, role `CUSTOMER`. Đơn không còn chờ thanh toán hoặc quá hạn giữ thì `409`.
- `POST /orders/{orderId}/cancel`, role `CUSTOMER`. Chỉ hủy đơn chờ cọc hoặc COD chưa vào sản xuất.
- `POST /provider/orders/{orderId}/advance`, role `PROVIDER`. Đẩy đơn của mình sang nướng, đang giao, rồi hoàn tất.
