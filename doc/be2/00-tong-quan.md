# Tổng quan BE2 so với master

Mốc so sánh là `master` tại commit `467a352` (`feat(be3): implement checkout lifecycle RFQ and seller PayOS`). Toàn bộ khác biệt nằm trong thư mục `be/` và chưa được commit. Tài liệu này mô tả code hiện tại, không mô tả giao diện demo.

Trên master, BE2 giữ tồn và năng lực nướng, quản lý sản phẩm và xuất phiếu ra lò. Code hiện tại bỏ phiếu ra lò, đổi vòng đời sản phẩm, và thêm kho có sổ, giỏ hàng, set quà và websocket tồn.

## Đã bỏ

- View `v_bake_lines`, class `BakeViewInitializer` và hai test phiếu ra lò.
- File SQL `be/src/main/resources/db/views/v_bake_lines.sql`.

Hibernate đang để `ddl-auto=update`. Xóa file trong repo không xóa view còn trên SQL Server.

## Đã thêm hoặc đổi

- Trạng thái sản phẩm `DRAFT`, `ACTIVE`, `SOLD_OUT`, `ARCHIVED`. Thêm loại `GIFT_SET`.
- Ảnh gắn vào sản phẩm, không còn gắn vào phân loại.
- Sổ kho phân loại (`InventoryAudit`) và sổ kho set (`SetInventoryAudit`).
- Giỏ hàng, giữ chỗ và trả hàng cho bánh lẻ và cho set.
- Ngừng kinh doanh và xóa mềm tách theo kênh bán lẻ và kênh set.
- WebSocket `/ws/stock` phát tồn bánh lẻ và số set còn lại sau khi transaction commit.

## Các file trong bộ này

- [Thành phần](01-thanh-phan.md)
- [Luồng](02-flow.md)
- [Business rules](03-business-rules.md)
- [Sổ tồn](04-so-ton.md)
- [WebSocket](05-websocket.md)
- [API](06-api.md)
- [Schema](07-schema.md)
- [Lệch hợp đồng cũ](08-lech-hop-dong.md)
