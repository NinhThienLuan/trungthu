# Luồng

Các luồng dưới đây là phần BE2 thêm hoặc đổi so với master. Checkout vẫn là một transaction: giữ hàng xong mới tạo đơn. Nếu tạo đơn lỗi, giữ hàng được rollback cùng transaction.

## Tạo nháp, tồn mở đầu, đăng bán, lưu trữ

1. `POST /api/provider/products` tạo sản phẩm `DRAFT`. Request không được gửi trạng thái.
2. Ảnh lưu bằng `PUT /{id}/images`. Ảnh thứ nhất là ảnh chính.
3. Phân loại tạo bằng `POST /{id}/variants` với `stockQuantity` lớn hơn 0. Hệ thống ghi `INBOUND_IMPORT` lý do `Opening balance`, đặt phân loại `IN_STOCK`.
4. Set không tạo phân loại. Công thức và số set khởi điểm lưu khi sản phẩm còn nháp. Số set khởi điểm ghi đè, không cộng dồn, và không cần lý do.
5. Đăng bán chuyển `DRAFT` sang `ACTIVE`. Cần ảnh. Sản phẩm thường cần ít nhất một phân loại. Set cần ít nhất một set đã nhập. Người bán phải được phép đăng bán.
6. Khi còn nháp, sửa phân loại được gửi lại `stockQuantity`. Hệ thống xóa sổ cũ của phân loại đó rồi ghi tồn mở đầu mới. Không làm được nếu phân loại đã nằm trong set.
7. Lưu trữ chuyển sang `ARCHIVED`. `ARCHIVED` không chuyển tiếp. Đơn mở chỉ được đếm trên kênh của chính sản phẩm đó.

## Nhập kho, trừ kho, báo hết hàng bán lẻ

Nhập kho (`imports`) chỉ dành cho sản phẩm không còn nháp và chưa lưu trữ. Tồn lẻ tăng. Sổ ghi `INBOUND_IMPORT` dương.

Trừ kho (`adjustments`) chỉ nhận `ADJUSTMENT_BROKEN` hoặc `ADJUSTMENT_EXPIRED`. Số trừ không được lớn hơn tồn lẻ. Tồn lẻ giảm. Sổ ghi delta âm. Hàng trong set không bị trừ.

Báo hết hàng một phân loại (`terminate`) từ chối nháp và sản phẩm đã lưu trữ. Đơn bán lẻ đang `CONFIRMED`, `DEPOSITED` hoặc `BAKING_QUEUED` thì chặn. Đơn `PENDING_DEPOSIT` có dòng bán lẻ đó bị hủy cả đơn, kể cả dòng set nằm chung. Sau đó tồn lẻ về 0, phân loại `OUT_OF_STOCK`, sổ ghi `TERMINATE_CLEAR`. Hàng đang đóng trong set không bị đụng.

Ngừng kinh doanh cả sản phẩm bánh lẻ lặp báo hết hàng cho từng phân loại. Sản phẩm set đi luồng ngừng set.

## Công thức set và nhập set

1. Lưu công thức khi set chưa có hàng đóng, hoặc sau khi đã hoàn tác nhập. Công thức gồm đúng một hộp và các bánh lẻ. Tổng bánh trong một set phải bằng `box_capacity`. Mỗi loại bánh chỉ chọn một lần. Thành phần phải thuộc cùng người bán, đang `ACTIVE` hoặc `SOLD_OUT`, không phải nháp hay đã lưu trữ.
2. Nhập set khi còn nháp: ghi đè số set khởi điểm. Sổ set cũ bị xóa rồi ghi một `INBOUND_IMPORT` mới. Hàng nhập thẳng, không trừ tồn lẻ. Sổ bánh vẫn cộng `INBOUND_IMPORT` cho số chiếc nhập thẳng.
3. Nhập set khi đã đăng bán: bắt buộc lý do. Số set cộng thêm vào số đang có. Sổ set ghi thêm một `INBOUND_IMPORT`.
4. Hoàn tác nhập set xóa toàn bộ hàng đang đóng. Sổ set ghi `INBOUND_IMPORT` âm đúng số set vừa tháo. Trên bánh, phần nhập thẳng bị gỡ khỏi nhập kho. Phần từng lấy từ kệ được cộng lại `stock_quantity`.

## Hao hụt set và ngừng set

Hao hụt chỉ khi set đã đăng bán. Loại là hỏng hoặc hết dùng. Số set trừ không vượt số đang đóng. Sổ set ghi delta âm cùng loại đó. Mỗi chiếc rời khỏi set được ghi cùng loại audit trên phân loại bánh. Tồn lẻ không tăng. Nhập kho của bánh không bị trừ.

Ngừng set từ chối nháp. Đơn set đang xác nhận, đã cọc hoặc chờ nướng thì chặn. Dòng set trong đơn `PENDING_DEPOSIT` bị gỡ. Đơn trống thì hủy. Đơn còn hàng khác thì tính lại tiền. Số set còn lại sau bước đó được ghi `TERMINATE_CLEAR` trên sổ set và trên từng phân loại, theo số chiếc còn trong set. Tồn lẻ không đổi. Nếu tồn lẻ của phân loại bằng 0, phân loại chuyển `OUT_OF_STOCK` và trạng thái bán của bánh được làm mới.

## Giữ hàng và trả hàng

Bánh lẻ: gom số lượng theo phân loại, trừ `stock_quantity` khi còn đủ hàng, phân loại đang `IN_STOCK` và sản phẩm `ACTIVE`. Năng lực nướng của ngày nướng tăng bằng số bánh cần nướng, không vượt `max_quantity`. Sổ ghi `ORDER_HOLD`.

Set: khóa set, khóa dòng thành phần, giảm `quantity` theo số set mua. Không trừ `stock_quantity`. Mỗi dòng đơn nhớ `source_set_id` và số chiếc thuộc phần nhập thẳng (`direct_from_set`). Bánh lẻ trong set tính số nướng theo số chiếc. Hộp tính số nướng theo `box_capacity`.

Trả hàng khóa phân loại và năng lực. Dòng bán lẻ cộng lại `stock_quantity` và ghi `ORDER_RETURN`. Dòng set cộng lại `quantity` và `direct_quantity` của thành phần, không cộng tồn lẻ.

Khi đơn được ghi đã bán, hệ thống ghi `ORDER_SALE` một lần cho mỗi đơn. Lần này không trừ tồn thêm, vì tồn đã trừ lúc giữ hàng.
