# Đặc tả cơ sở dữ liệu

Cập nhật 2026-10-16: schema hiện hành nằm tại [System Data Dictionary](BRD/04-agent-and-dev-guidelines/system-data-dictionary.md), dùng UUID và giỏ đa Provider. Bản schema cũ được thay bằng chỉ mục để tránh hai bộ tên bảng, kiểu ID và enum mâu thuẫn.

- [Hợp đồng Backend](BRD/04-agent-and-dev-guidelines/backend-ownership-and-order-contract.md): ownership, transaction, COD, hold, API và view ra lò.
- [BR-01](BRD/02-business-rules/BR-01-b2c-ordering.md): mỗi Provider một Order độc lập, MVP một OrderBatch/Order.
- [SRS](BRD/srs.md): phạm vi và yêu cầu chức năng.

`orders`, `order_items`, `payment_transactions`, `daily_capacities` trong phân việc là tên nghiệp vụ; mapping hiện dùng ORDER, ORDER_ITEM, PAYMENT_TRANSACTION, DAILY_CAPACITY như Data Dictionary. Không tạo bộ bảng số nhiều song song.

`db_schema_diagram.drawio` là sơ đồ lịch sử chưa đồng bộ đầy đủ với đặc tả 2026-10-16; ERD MVP hiện hành nằm trong Data Dictionary. Giai đoạn dev điều chỉnh entity/repository trực tiếp theo schema đích, không thêm Flyway/migration; không tự xóa/reset DB. Entity BE4 đang được triển khai theo hợp đồng tinh gọn (không batchStatus, không SKU snapshot OrderItem).
