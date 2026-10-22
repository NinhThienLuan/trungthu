# Business rules

Đây là rule mà code đang bắt. Hợp đồng BE2 cũ không mô tả set, kênh tồn, hay trạng thái `DRAFT` / `SOLD_OUT` / `ARCHIVED`.

## Trạng thái sản phẩm

Chuyển hợp lệ:

- `DRAFT` sang `ACTIVE` hoặc `ARCHIVED`.
- `ACTIVE` sang `SOLD_OUT` hoặc `ARCHIVED`.
- `SOLD_OUT` sang `ACTIVE` hoặc `ARCHIVED`.
- `ARCHIVED` không đi tiếp.

`SOLD_OUT` không gán tay. `ProductSaleStatusService` gắn khi sản phẩm đang bán mà hết hàng bán được, và gỡ khi có hàng trở lại. Với bánh, hộp, thiệp, hết hàng nghĩa là không còn phân loại nào có `stock_quantity` lớn hơn 0. Với set, hết hàng nghĩa là không còn hộp nào đang đóng trong set.

Đăng bán cần ảnh. Sản phẩm không phải set cần ít nhất một phân loại. Set cần ít nhất một set đã nhập. Người bán phải qua được kiểm tra quyền đăng bán.

## Tồn mở đầu và sản phẩm nháp

Thêm phân loại bắt `stockQuantity` lớn hơn 0. Số 0 bị từ chối với thông báo tồn mở đầu phải lớn hơn 0. Set không được thêm phân loại.

Khi sản phẩm còn nháp:

- Không nhập kho, không trừ kho, không báo hết hàng.
- Sửa phân loại được thay tồn mở đầu. Sổ cũ của phân loại bị xóa rồi ghi lại. Từ chối nếu phân loại đã có hàng trong set.
- Set nháp nhận số set khởi điểm mà không cần lý do. Lưu lại thì ghi đè số đang có, không cộng thêm.

Khi sản phẩm đã đăng bán, cập nhật phân loại từ chối `stockQuantity` và từ chối đổi trạng thái phân loại. Tồn chỉ đổi qua nhập kho hoặc trừ kho.

## Hai kênh

Ngừng bán lẻ chỉ xét dòng đơn có `source_set_id` trống. Tồn lẻ về 0. Dòng thành phần set và trạng thái sản phẩm set không đổi.

Ngừng set chỉ xét đơn của set đó. Hàng đang đóng bị xóa tại chỗ. `stock_quantity` của bánh và hộp không tăng.

Xóa mềm đếm đơn mở theo kênh. Đơn set không chặn lưu trữ một chiếc bánh. Đơn set chặn lưu trữ chính set đó. Lưu trữ không chuyển kho.

Thành phần mới của set chỉ lấy từ sản phẩm `ACTIVE` hoặc `SOLD_OUT` của cùng người bán. Sản phẩm nháp hoặc đã lưu trữ không đưa vào set.

## Hao hụt, ngừng set và hoàn tác nhập

Hao hụt set ghi `ADJUSTMENT_BROKEN` hoặc `ADJUSTMENT_EXPIRED` trên sổ set và trên từng phân loại, theo số chiếc bị trừ. Không trừ cột nhập kho của bánh. Không trả bánh về kệ.

Ngừng set ghi `TERMINATE_CLEAR` trên sổ set theo số set còn lại, và trên từng phân loại theo số chiếc còn trong set. Nhập kho của bánh giữ nguyên. Tồn lẻ giữ nguyên. Phân loại chỉ thành `OUT_OF_STOCK` khi tồn lẻ bằng 0.

Hoàn tác nhập set không phải hao hụt. Sổ set giảm nhập kho đúng số set vừa tháo. Phần nhập thẳng bị trừ khỏi nhập kho của bánh. Phần đã lấy từ kệ được cộng lại tồn lẻ.

## Đơn chờ cọc

Ngừng bán lẻ gặp dòng bán lẻ trong đơn `PENDING_DEPOSIT` thì hủy cả đơn. Mọi dòng của đơn được trả hàng, thanh toán chờ bị hủy, `hold_expires_at` về null, trạng thái đơn thành `CANCELLED`.

Ngừng set chỉ gỡ dòng của set. Đơn không còn dòng thì hủy. Đơn còn dòng thì tính lại tạm tính, tổng và tiền cọc.

Đơn `CONFIRMED`, `DEPOSITED` hoặc `BAKING_QUEUED` chặn cả hai lối ngừng bán trên kênh tương ứng.

## Giá set

Giá gốc một set là tổng đơn giá hộp và từng bánh nhân số lượng trong một set. `sale_price` phải lớn hơn 0 và nhỏ hơn giá gốc. Nếu không thỏa, giá bán dùng để tính đơn là giá gốc.

## Giữ hàng

Một phân loại chỉ bị trừ tồn lẻ khi đủ số, đang `IN_STOCK`, và sản phẩm `ACTIVE`. Set chỉ bán khi set đang `ACTIVE` và dòng hộp còn đủ số set. Năng lực ngày nướng không được vượt mức tối đa. Thiếu hàng hoặc thiếu năng lực thì rollback cả lần checkout.
