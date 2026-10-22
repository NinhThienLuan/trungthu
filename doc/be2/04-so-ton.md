# Sổ tồn

Master không có sổ kho. Code hiện tại có hai sổ: sổ phân loại và sổ set. Biểu đồ đọc tổng delta theo loại audit, không đọc `stock_after` để vẽ cột.

## Công thức

Với một phân loại:

`nhập − hỏng − hết dùng − báo hết hàng − đã bán − chờ thanh toán = tồn lẻ + tồn trong set`

`nhập` là tổng delta `INBOUND_IMPORT`, nếu âm thì lấy 0. `hỏng`, `hết dùng`, `báo hết hàng`, `đã bán` là trị tuyệt đối của tổng delta loại tương ứng. `chờ thanh toán` không lấy từ sổ. Nó là tổng số lượng dòng đơn của phân loại đang `PENDING_DEPOSIT` hoặc `CONFIRMED`. `đã bán` lấy từ `ORDER_SALE`, ghi khi đơn đã được đánh dấu bán. Tồn lẻ là `stock_quantity`. Tồn trong set là tổng `quantity` của mọi `gift_set_component` trỏ tới phân loại.

Phần lệch là vế trái trừ vế phải. Lệch bằng 0 khi mọi chiếc đã có một chỗ trong công thức.

Với một set, cùng công thức nhưng đơn vị là số set. Tồn là số hộp đang đóng. Đã bán và chờ thanh toán chỉ đếm dòng đơn có `source_set_id` là set đó và phân loại là hộp, để một set không bị đếm theo số bánh bên trong.

## Loại audit

`INBOUND_IMPORT`, delta dương: tồn mở đầu, nhập kho bánh lẻ, hoặc nhập thẳng vào set. `stock_after` của bánh là tồn lẻ cộng số đang nằm trong set sau dòng này. Trên sổ set, delta là số set, `stock_after` là số set còn lại.

`INBOUND_IMPORT`, delta âm: gỡ phần nhập thẳng khi hoàn tác nhập set hoặc khi tháo hàng nhập thẳng. Trên sổ set, delta âm là số set vừa hoàn tác. Cột nhập kho giảm, không hiện thành hỏng.

`ADJUSTMENT_BROKEN` và `ADJUSTMENT_EXPIRED`, delta âm: trừ kho bánh lẻ, hoặc hao hụt set. Hao hụt ghi cả trên sổ set (số set) và trên sổ bánh (số chiếc). Không đổi `stock_quantity`.

`TERMINATE_CLEAR`, delta âm: báo hết hàng bán lẻ thì trừ hết tồn lẻ và ghi `stock_after` bằng 0. Ngừng set ghi số set còn lại trên sổ set và số chiếc còn trong set trên sổ bánh. Tồn lẻ không bị trừ bởi dòng của set.

`ORDER_HOLD`, delta âm: ghi lúc giữ hàng. `stock_after` là tồn vật lý sau khi giữ. Loại này không có mặt trong công thức. Chờ thanh toán được đếm từ đơn.

`ORDER_RETURN`, delta dương: ghi lúc trả hàng. Cũng không có mặt trong công thức. Đơn đã hủy ra khỏi chờ thanh toán và ra khỏi đã bán.

`ORDER_SALE`, delta âm: ghi một lần khi đơn được tính là đã bán. Không trừ `stock_quantity` lần nữa.

## Ngoài công thức

Đơn `CANCELLED` được thống kê riêng và không trừ trong công thức. Sau khi trả hàng, chiếc đó đã về tồn lẻ hoặc về trong set, nên không được trừ thêm.

`ORDER_HOLD` và `ORDER_RETURN` là vết giữ và trả. Nếu cộng chúng vào công thức sẽ đếm trùng với chờ thanh toán và với tồn.

Hủy đơn chờ cọc khi ngừng bán lẻ trả cả dòng set về set. Những chiếc đó rời chờ thanh toán và trở lại `quantity` của thành phần. Chúng chưa bị ghi báo hết hàng cho đến khi chính set bị ngừng.
