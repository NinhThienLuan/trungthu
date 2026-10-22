# Thành phần

Master có sản phẩm, phân loại và ảnh gắn trên phân loại. Code hiện tại tách ảnh lên sản phẩm, thêm set không có phân loại, và thêm các lớp kho, giỏ, sổ và phát tồn.

## Lớp xử lý

`ProductServiceImpl` tạo và sửa sản phẩm, ảnh, phân loại. Sản phẩm nháp được ghi tồn mở đầu qua `stockQuantity`. Sản phẩm đã đăng bán không nhận tồn hay trạng thái phân loại trong request cập nhật. Xóa mềm đếm đơn mở theo đúng kênh.

`InventoryServiceImpl` ghi tồn mở đầu, nhập kho, trừ kho hỏng hoặc hết dùng, giữ hàng và trả hàng. Giữ hàng bánh lẻ dùng một lệnh `UPDATE` có điều kiện `stock_quantity >= số cần giữ`. Giữ set khóa sản phẩm set rồi khóa các dòng thành phần.

`GiftSetService` lưu công thức, nhập set, hoàn tác nhập, hao hụt set và ngừng kinh doanh set. Set không có phân loại. Số set bán được là `quantity` của dòng hộp.

`VariantTerminationService` báo hết hàng một phân loại bán lẻ và ngừng kinh doanh cả sản phẩm. Sản phẩm loại set được chuyển sang `GiftSetService`.

`PendingChannelRelease` xử lý đơn `PENDING_DEPOSIT`. Ngừng bán lẻ hủy cả đơn. Ngừng set chỉ gỡ các dòng của set đó, rồi tính lại tiền nếu đơn còn dòng khác.

`ProductSaleStatusService` đưa sản phẩm đang bán về `SOLD_OUT` khi không còn tồn bán được, và đưa lại `ACTIVE` khi có hàng. Bánh lẻ nhìn `stock_quantity`. Set nhìn số hộp còn đóng trong set.

`VariantStatsService` đọc sổ bánh và đơn để ra các số của biểu đồ thác nước. Sổ set do `GiftSetService.stats` đọc.

`CartServiceImpl` thêm, sửa, xóa và đổi phân loại trong giỏ. Một dòng là một phân loại hoặc một set, không phải cả hai. Kiểm tra mua được lúc thêm giỏ chỉ là kiểm tra sớm. Lần trừ tồn thật là lúc giữ hàng.

`StockBroadcastListener` chạy sau commit, bỏ chọn dòng giỏ không còn mua được, rồi phát WebSocket.

## Entity

`Product` có loại, trạng thái và `sale_price`. `sale_price` dùng cho giá bán set khi người bán chấp nhận bán thấp hơn giá gốc.

`ProductVariant` có SKU, giá, `stock_quantity` (tồn lẻ), `weight_gram` hoặc `box_capacity`, và `VariantStatus` `IN_STOCK` hoặc `OUT_OF_STOCK`.

`ProductImage` thuộc sản phẩm. `image_url` dài tới 2.000.000 ký tự để chứa ảnh demo. Ảnh đầu album là ảnh chính.

`GiftSetComponent` là một dòng công thức: set, phân loại thành phần, `per_set_quantity`, `quantity` đang đóng trong set, và `direct_quantity`. `direct_quantity` là phần nhập thẳng vào set, không lấy từ tồn lẻ. Phần còn lại của `quantity` là hàng đã lấy từ kệ.

`InventoryAudit` là một dòng sổ của phân loại. `SetInventoryAudit` là một dòng sổ của set, đếm theo số set chứ không theo số chiếc bánh.

`CartItem` thuộc khách. Ràng buộc bảo đảm dòng trỏ đúng một phân loại hoặc đúng một set.

## Quan hệ kênh

Một chiếc bánh có thể nằm ở tồn lẻ hoặc đang đóng trong set. Hai chỗ đó là hai kênh. Ngừng bán lẻ xóa tồn lẻ và không sửa `gift_set_component`. Ngừng set xóa hàng đang đóng trong set và không cộng số đó vào `stock_quantity`.
