# Schema

So với master, schema thêm sổ kho, giỏ và thành phần set, đổi vòng đời sản phẩm, chuyển ảnh lên sản phẩm, và thêm tiền gốc cùng chiết khấu trên đơn. `spring.jpa.hibernate.ddl-auto` đang là `update`. Hibernate cập nhật bảng theo entity, nhưng không xóa view `v_bake_lines` nếu view đó đã có trên SQL Server.

## Bảng mới

`GIFT_SET_COMPONENT` nối set với phân loại thành phần. Cột `per_set_quantity` lớn hơn 0, `quantity` không âm, `direct_quantity` không âm và không lớn hơn `quantity`. Một set không có hai dòng cùng một phân loại.

`INVENTORY_AUDIT` là sổ phân loại: loại audit, `quantity_delta`, `stock_after`, lý do tối đa 500 ký tự, người tạo, và đơn khi dòng thuộc một đơn. Không có ràng buộc một đơn chỉ một dòng `ORDER_SALE`. Code tự kiểm tra trước khi ghi bán.

`SET_INVENTORY_AUDIT` là sổ set, cùng các cột số và lý do, trỏ tới sản phẩm set thay vì phân loại.

`CART_ITEM` thuộc khách. `quantity` lớn hơn 0. Đúng một trong hai cột `variant_id` và `set_product_id` có giá trị. Một khách không có hai dòng cùng phân loại, cũng không có hai dòng cùng set.

## Cột và ràng buộc đổi

`PRODUCT.status` dùng `DRAFT`, `ACTIVE`, `SOLD_OUT`, `ARCHIVED`. `product_type` thêm `GIFT_SET`. `sale_price` không âm hoặc null. Check tên `CK_PRODUCT_sale_price`.

`PRODUCT_VARIANT.stock_quantity` không âm. Giá không âm. `box_capacity` null hoặc lớn hơn 0. `status` là `IN_STOCK` hoặc `OUT_OF_STOCK`.

`PRODUCT_IMAGE` trỏ `product_id`, không còn trỏ phân loại. `image_url` dài tới 2.000.000. `display_order` không âm. `is_primary` bắt buộc.

`ORDER` thêm `list_amount` và `discount_amount`, cả hai không âm, chiết khấu không vượt giá gốc. Các check hold và COD vốn có vẫn giữ: COD không có tiền cọc và không có hạn giữ. Chỉ đơn `PENDING_DEPOSIT` thanh toán VietQR hoặc PayOS mới có `hold_expires_at`. Gia hạn tối đa một lần và phải có người, thời điểm, lý do.

`ORDER_ITEM` thêm `source_set_id` nullable và `direct_from_set` không âm. Dòng bán lẻ để `source_set_id` null. Dòng tách từ set trỏ tới sản phẩm set.

## Đã bỏ khỏi code

File view `v_bake_lines` và lớp khởi tạo view không còn. Bảng và view đã tạo trên database cũ không bị lệnh này xóa. Muốn hết view thì drop trực tiếp trên SQL Server.
