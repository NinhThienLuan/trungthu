# Lệch so với hợp đồng BE2 cũ

Hợp đồng nằm ở `docs/BRD/04-agent-and-dev-guidelines/backend-ownership-and-order-contract.md`, cập nhật 2026-10-16. Hợp đồng đó vẫn là nguồn của checkout và vòng đời đơn. Phần BE2 trong code đã đi khác các điểm dưới đây.

## Phiếu ra lò

Hợp đồng giao BE2 API xuất phiếu ra lò và giao BE4 view `v_bake_lines`. Code không còn view, không còn initializer, không còn API đọc phiếu. Đơn vẫn lưu `bake_quantity` trên dòng hàng để giữ năng lực nướng. Số bánh cần nướng của bánh lẻ là số chiếc. Số của hộp là số hộp nhân `box_capacity`.

## Sản phẩm

Hợp đồng và data dictionary cũ không có `DRAFT`, `SOLD_OUT`, `ARCHIVED` theo nghĩa hiện tại, cũng không có `GIFT_SET`. Ảnh trên master và trong mô hình cũ gắn phân loại. Code gắn ảnh vào sản phẩm.

Tồn không còn sửa bằng cách gửi `stockQuantity` khi cập nhật phân loại đã đăng bán. Tồn mở đầu chỉ ghi lúc tạo phân loại hoặc lúc sản phẩm còn nháp. Sau khi đăng bán, tồn đi qua nhập kho và trừ kho.

## Kênh bán lẻ và kênh set

Hợp đồng không tách hai kênh. Code coi tồn lẻ và hàng đóng trong set là hai kho.

Ngừng bán lẻ không trả hay xóa hàng trong set. Ngừng set không cộng hàng về tồn lẻ. Xóa mềm cũng đếm đơn theo kênh tương ứng và không chuyển kho.

Một đơn checkout vẫn có thể chứa cả dòng bán lẻ và dòng set của cùng người bán, vì checkout nhóm theo người bán. `source_set_id` phân biệt dòng nào thuộc set.

## Checkout vẫn như hợp đồng

Điểm này không đổi. Checkout submit dùng một transaction. Giữ tồn và năng lực nướng nằm trong transaction đó. Lưu đơn lỗi thì giữ hàng rollback theo. Sau commit, hủy một đơn không hủy các đơn khác cùng `checkout_id`.

Giữ bánh lẻ vẫn là lệnh cập nhật có điều kiện, không đọc rồi ghi đè số tồn trong bộ nhớ. Giữ set khóa set và các dòng thành phần trước khi giảm số đang đóng. Trả hàng khóa phân loại và năng lực trước khi cộng lại.

API `/api/dummy` không thay `CheckoutService`. Nó chỉ tạo đơn và giữ tồn để chạy sổ trong môi trường chưa nối đủ thanh toán.
