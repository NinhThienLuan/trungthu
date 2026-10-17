# Hợp đồng Backend: ownership, Checkout và đơn hàng

Cập nhật **2026-10-16** theo bảng phân việc và yêu cầu tinh gọn khi triển khai BE4. Giai đoạn dev sửa entity/repository trực tiếp, không thêm Flyway hoặc migration. Đây là đặc tả đích, không xác nhận code hiện tại đã hoàn thành. Giới hạn gia hạn hold là mặc định MVP được bổ sung trong lần cập nhật này.

## 1. Ownership và tài liệu áp dụng

| Thành viên | Phạm vi chịu trách nhiệm |
| --- | --- |
| BE1 – Tiến | JWT, hồ sơ Provider/KYC, `ProviderPolicy`, nạp tiền/kích hoạt quyền bán SaaS, upload/storage. |
| BE2 – Đạt | Product/Variant/ảnh chính, reserve/release stock và capacity, ngày khả dụng, API xuất phiếu ra lò. Không quản lý HSD từng SKU. |
| BE3 – Phát | Preview/giá, điều phối transaction Checkout, lifecycle, xác nhận cọc/COD, gia hạn hold, cron hủy quá hạn, RFQ và VietQR. |
| BE4 – Luân | Tách dữ liệu đơn theo Provider, persistence Order/Batch/Item/PaymentTransaction, API đọc Buyer/Seller, view `v_bake_lines`. |
| FE1 – Tuấn | Core/Auth Buyer, storefront, cart/lịch nhận, Checkout/VietQR/đơn của tôi, RFQ và trang tĩnh. |
| FE2 – Thạch | Seller KYC/SaaS, Product/Capacity, lịch và in phiếu ra lò, xử lý đơn/RFQ, Admin duyệt KYC/kích hoạt quyền bán. |

Tài liệu này quyết định hợp đồng kỹ thuật Checkout/lifecycle; [Data Dictionary](system-data-dictionary.md) quyết định schema đích; [BR-01](../02-business-rules/BR-01-b2c-ordering.md) mô tả nghiệp vụ. MEMORY và sơ đồ drawio cũ là tham khảo lịch sử khi khác đặc tả này. Khi sửa hợp đồng phải sửa đồng thời tài liệu liên quan.

SaaS MVP chỉ cần chuyển khoản/nạp phí cho sàn và Admin đối soát kích hoạt quyền bán. BE1 quản lý phí/thời hạn/giới hạn SKU bằng cấu hình; không bắt buộc hai hạng STANDARD/VIP, không xây ví có số dư/nạp/rút hoặc quảng cáo theo gói.

## 2. Cấu trúc đơn đa Provider

- Cart được chứa nhiều Provider. Backend tra Provider từ Variant, không tin giá hoặc Provider client gửi.
- Một Checkout tạo **một Order độc lập cho mỗi Provider**, có mã, ship, cọc và thanh toán riêng. Không có Order cha đa Provider. “Đơn tổng” trong phân việc là dữ liệu giỏ trước khi tách.
- `checkout_id` UUID dùng chung để liên kết các Order của một lần Checkout, không phải Order cha.
- MVP: mỗi Provider một ngày nhận, đúng một `OrderBatch`/Order. Nhiều ngày cùng Provider trả `400`; giao nhiều đợt là Phase 2. Nếu giữ `OrderBatch.provider_id` theo entity cũ, phải bằng `Order.provider_id`.
- `OrderItem` thuộc Batch; snapshot tên sản phẩm/biến thể, đơn giá và số bánh cần nướng. Đổi Catalog không đổi lịch sử đơn.
- Ngày giao là `LocalDate` theo `Asia/Ho_Chi_Minh`, tối thiểu ngày đặt + 3; `bake_date = delivery_date - 1`. Deadline lưu thời điểm UTC (`Instant`), API ISO-8601 có `Z`.

## 3. Transaction Checkout

1. BE3 cung cấp `CheckoutService`. Preview chỉ đọc, không giữ tài nguyên; submit validate lại SKU, giá, quyền bán qua BE1, stock/capacity/ngày giao.
2. Submit dùng **một transaction DB cho tất cả Provider** (`@Transactional(rollbackFor = Exception.class)`). BE2 reserve tài nguyên; BE4 nhóm snapshot đã validate và lưu Order/Batch/Item/giao dịch chờ cọc. Hàm ghi nội bộ dùng `MANDATORY` để tham gia transaction này; không `REQUIRES_NEW`, async hay commit từng Provider.
3. BE2 dùng khóa ghi/cập nhật có điều kiện bảo đảm stock không âm, `reserved_quantity <= max_quantity`; thứ tự khóa Provider/ngày/Variant ổn định. Không chỉ đọc rồi trừ trong bộ nhớ.
4. Một Provider thất bại hoặc bước lưu lỗi: **rollback toàn bộ đơn, giao dịch chờ cọc, stock và capacity**. Trả `409` cho xung đột tài nguyên/trạng thái kèm Provider/Variant/ngày và mã lỗi; đầu vào sai `400`; lỗi hệ thống `500`.
5. Chỉ trả danh sách Order thành công sau commit. Không gọi mạng lấy ảnh QR hay chuyển tiền trong transaction; chỉ dựng URL từ thông tin ngân hàng đã validate. Lỗi tải ảnh sau commit cho phép tải lại, không tạo đơn mới.
6. Sau commit, các Order có lifecycle độc lập: một đơn hủy/hết hạn không hủy các đơn khác cùng Checkout. Rollback DB không thu hồi tiền chuyển ngoài hệ thống.

BE3 truyền BE4 CreateOrdersCommand gồm customer/Provider, ngày giao, capacity đã reserve, người nhận/địa chỉ/VAT, Item snapshot, phí ship/cọc, phương thức và thời điểm đặt/deadline. BE4 cộng quantity × unitPrice snapshot và phí ship để lưu tổng tiền, khởi tạo trạng thái theo COD/VIETQR và trả Order đã lưu. BE4 không tính chính sách giá/giữ slot, không mở API tạo đơn bỏ qua CheckoutService. BE2 cung cấp reserve/release Variant và Provider/ngày; BE3 gọi cùng transaction đổi trạng thái đơn. Không mở OrderItemService độc lập.

## 4. COD, cọc và trạng thái chuẩn

Ngưỡng **2.000.000 VNĐ tính trên từng Order sau tách**, gồm hàng + ship + phụ phí. Backend dùng BigDecimal, tiền VNĐ nguyên, cọc tối thiểu làm tròn lên. Điều kiện in riêng chỉ áp dụng khi tính năng đó được bật, không đưa Custom Box Phase 2 vào MVP.

| Phương thức | Điều kiện và khởi tạo | Thanh toán |
| --- | --- | --- |
| COD | Đơn tiêu chuẩn không in riêng, tổng < 2 triệu; `CONFIRMED`, không deadline. Vẫn reserve stock/capacity trong Checkout. | Cọc 0, `UNPAID`; không QR/giao dịch cọc giả. |
| VIETQR | Cọc tối thiểu 50% hoặc trả đủ; bắt buộc nếu >= 2 triệu hoặc in riêng. `PENDING_DEPOSIT`, hold ban đầu 15 phút. | `UNPAID` đến khi Seller xác nhận thực nhận. `deposit_amount` là khoản phải chuyển ban đầu. |

Đơn thường dưới 2 triệu được chọn COD hoặc VIETQR.

| Hiện tại | Thao tác hợp lệ | Kết quả |
| --- | --- | --- |
| `PENDING_DEPOSIT` | Seller sở hữu xác nhận khoản thực nhận >= deposit_amount và <= total_amount, trước hạn | `DEPOSITED`; payment `DEPOSITED` hoặc `PAID_FULL`; bỏ deadline hoạt động. |
| `PENDING_DEPOSIT` | Buyer/Seller sở hữu hủy, hoặc cron thấy hết hạn | `CANCELLED`, nhả tài nguyên đúng một lần. |
| `CONFIRMED` | Seller đưa COD vào sản xuất | `BAKING_QUEUED`, payment vẫn `UNPAID`. |
| `CONFIRMED` | Buyer/Seller sở hữu hủy COD trước sản xuất | `CANCELLED`, nhả tài nguyên một lần. |
| `DEPOSITED` | Seller đưa đơn đã cọc vào sản xuất | `BAKING_QUEUED`. |
| `BAKING_QUEUED` | Seller giao vận chuyển | `DELIVERING`. |
| `DELIVERING` | Seller xác nhận giao thành công và đã thu đủ tiền | `COMPLETED`, payment `PAID_FULL`. |
| `COMPLETED`, `CANCELLED` | Không chuyển tiếp | Trạng thái kết thúc. |

Không cho API hủy thường tự hủy đơn đã cọc/đang sản xuất. Hoàn tiền ngoại lệ hoặc tiền đến sau hạn do Provider đối soát trực tiếp; không hồi sinh đơn đã hủy. `CONFIRMED` dành cho COD; `DEPOSITED` dành cho VIETQR đã xác nhận khoản ban đầu, kể cả trả đủ. Không dùng `PENDING/PROCESSING/SHIPPING/DELIVERED/BAKING` làm OrderStatus mới.

MVP một Batch/Order nên bỏ `batchStatus` và enum OrderBatchStatus; tiến độ sản xuất/giao nhận đọc từ Order.orderStatus. Khi có nhiều đợt giao độc lập ở Phase 2 mới bổ sung trạng thái Batch. Batch hiện chỉ lưu ngày giao, Provider, capacity và tiền hàng.

BE3 ghi nhận tiền và đổi trạng thái trong cùng transaction qua persistence BE4. `paidAt` là trường thời điểm thực nhận/xác nhận tiền, không phải một lớp; không thay bằng createdAt (tạo bản ghi chờ thanh toán) hoặc updatedAt (mọi lần sửa bản ghi). Order payment = `UNPAID/DEPOSITED/PAID_FULL`; giao dịch payment = `PENDING/SUCCESS/CANCELLED`, dùng enum riêng. Chỉ cộng giao dịch `SUCCESS` vào `paid_amount`, tổng không vượt `total_amount`. VIETQR tạo `ORDER_DEPOSIT`; COD chỉ tạo `ORDER_BALANCE` lúc thu tiền; đơn cọc có thể có thêm `ORDER_BALANCE` cho phần còn lại. Không tạo thu tiền lặp khi xác nhận trùng.

## 5. Hold và cạnh tranh

- Chỉ `PENDING_DEPOSIT` có hold: `hold_expires_at = ordered_at + 15 phút`, count = 0.
- Chỉ Seller sở hữu được gia hạn, **một lần thêm 15 phút vào deadline hiện tại**, trần `ordered_at + 30 phút`, bắt buộc lý do trim 1–500 ký tự. Buyer không tự gia hạn; tải lại trang/QR không làm mới hold.
- Gia hạn chỉ khi `now < hold_expires_at`, không reserve thêm/đổi giá/cọc. Lưu count, người gia hạn, thời điểm, lý do; client không truyền deadline tùy ý.
- Khi `now >= hold_expires_at`, xác nhận cọc/gia hạn trả `409`, dù cron chưa quét. Cron mỗi phút, khóa và đọc lại từng đơn trong transaction riêng rồi hủy/nhả.
- Xác nhận cọc/gia hạn/hủy/cron khóa cùng bản ghi Order, kiểm tra lại trạng thái và thời gian sau khóa (hoặc optimistic lock có retry tương đương). Chỉ một thao tác thắng, không vừa nhận cọc vừa hoàn kho.
- Chuyển `CANCELLED`, hoàn stock, giảm reserved capacity và hủy giao dịch `PENDING` phải commit cùng nhau. Nhả lỗi thì rollback để retry; đơn đã hủy không nhả lần hai.
- COD không bị cron hold hủy. Xác nhận cọc/chuyển sản xuất không trừ tài nguyên lần hai. Không nhả capacity khi giao xong để tránh nhận vượt năng lực ngày đó.

## 6. API và view

List trả `ApiResponseDTO<PageResponse<T>>`, detail trả DTO riêng, không trả Entity. UUID `id`; DTO camelCase (`code` ánh xạ `order_code`), enum chuẩn mục 4.

| Owner | Endpoint | Hợp đồng |
| --- | --- | --- |
| BE4 | `GET /api/orders/me` | CUSTOMER, tự lọc customer từ JWT; page/size/status/from/to. `from/to` là ngày nhận, bao gồm hai đầu. |
| BE4 | `GET /api/provider/orders` | PROVIDER, tự lọc Provider từ JWT; cùng bộ lọc/phân trang. |
| BE4 | `GET /api/orders/{id}` | Buyer hoặc Seller sở hữu; ngoài phạm vi trả `404`, chưa đăng nhập `401`. |
| BE3 | `POST /api/checkout/preview`, `POST /api/checkout` | Preview chỉ đọc; submit trả `ApiResponseDTO<List<OrderDetailResponse>>`; mỗi nhóm có paymentMethod/lựa chọn cọc. |
| BE3 | `POST /api/provider/orders/{id}/confirm-deposit` | Xác nhận số tiền thực nhận trước hạn. |
| BE3 | `POST /api/provider/orders/{id}/extend-hold` | Body `{ reason }`, trả deadline/count mới. |
| BE3 | `POST /api/orders/{id}/cancel` | Buyer/Seller sở hữu; điều kiện mục 4. |
| BE3 | `PATCH /api/provider/orders/{id}/status` | Theo bảng chuyển trạng thái; hoàn thành phải xác nhận thu đủ tiền. |
| BE2 | `GET /api/provider/bake-sheet?date=YYYY-MM-DD` | Đọc view, Provider hiện tại, date là ngày nướng. |

Bước 2 dùng response gọn:
- List trả OrderSummaryResponse: id, code, providerId, storeName, deliveryDate, status, paymentMethod, paymentStatus, totalAmount, paidAmount, remainingAmount, createdAt (thời điểm orderedAt UTC).
- Detail thêm receiverName, receiverPhone, shippingAddress, subtotalAmount, shippingFee, depositAmount, holdExpiresAt và lines (variantId, productName, variantName, quantity, unitPrice, subtotal).
- Không trả Entity, SKU, checkoutId, audit gia hạn, thông tin VAT/giấy tờ hoặc chi tiết giao dịch trong API đọc hiện tại. QR/thông tin ngân hàng thuộc tích hợp thanh toán BE3, chưa có trong bước 2.
- page mặc định 0, size 10 (tối đa 100); sắp xếp orderedAt giảm dần rồi id giảm dần. from/to là ngày nhận, bao gồm hai đầu; khoảng ngày đảo hoặc bộ lọc sai trả 400.
- CUSTOMER chỉ gọi /orders/me; PROVIDER chỉ gọi /provider/orders; detail cho Buyer/Seller sở hữu. Không mở quyền đọc của PLATFORM_ADMIN trong ba API này. Ngoài phạm vi hoặc không tồn tại đều trả 404; thiếu JWT hợp lệ trả 401, sai role trả 403.
- paidAmount chỉ cộng giao dịch SUCCESS; remainingAmount = totalAmount - paidAmount. Danh sách lấy ngày giao và tổng thanh toán theo cả trang, không truy vấn riêng từng đơn.


BE4 tạo view chỉ đọc **`v_bake_lines`**, một dòng/OrderItem: `order_item_id`, `order_id`, `order_code`, `provider_id`, `order_batch_id`, `delivery_date`, `bake_date`, `variant_id`, `product_name`, `variant_name`, `quantity`, `bake_quantity`, `order_status`. Chỉ lấy Order `CONFIRMED/DEPOSITED/BAKING_QUEUED/DELIVERING/COMPLETED` và `bake_quantity > 0`; loại pending/hủy. Không join giao dịch gây nhân bản dòng.

`bake_quantity` snapshot: bánh lẻ = quantity; set đóng sẵn = quantity × số bánh/set Catalog cung cấp; thiệp/dịch vụ = 0. BE2 tính quy đổi khi validate, BE3 chuyển snapshot sang BE4. BE2 gom Provider/ngày/Variant để xuất, FE2 in. Chưa có định mức thành phần thì báo cáo Variant/set, không đoán vị bên trong set. Không tạo bảng mẻ nướng vật lý trong MVP.

## 7. BE4 có thể làm trước

1. Sửa trực tiếp entity và tạo repositories Order/Batch/Item/PaymentTransaction: UUID, FK, unique mã, index Buyer/Provider/ngày/status; snapshot tên/giá và cột hold; không thêm snapshot SKU vào OrderItem. ProductVariant vẫn giữ SKU Catalog đang dùng. Giao dịch SaaS liên kết Subscription, thống nhất schema với BE1.
2. DTO/mapper và API đọc Buyer/Seller/detail có phân quyền/phân trang, dùng seed nhiều Provider và trạng thái. Chưa cần Checkout thật.
3. View `v_bake_lines` bằng dữ liệu seed để BE2 làm API xuất ngay. Kiểm tra ngày/Provider, lọc pending/hủy, quy đổi set, không nhân bản dòng.
4. Hàm ghi nội bộ nhận nhóm snapshot đã validate, lưu một Order/Provider, một Batch/Order và các Item; tham gia transaction BE3. Test có thể dùng dữ liệu validate giả; không mở endpoint tạo đơn trực tiếp.
5. Ghép sau với BE3 Checkout/lifecycle, BE2 reserve/release, BE1 ProviderPolicy/ngân hàng. Không cần chờ các module này để xong bước 1–3.

Đã triển khai bước 1 (entity/enum/repository), bước 2 (DTO/mapper/service/API đọc Buyer/Seller), bước 3 (view v_bake_lines) và bước 4 (hàm nội bộ tách/lưu đơn). Điều phối Checkout, reserve/release thật, ProviderPolicy và lifecycle vẫn cần ghép BE1–BE2–BE3. Hibernate ddl-auto=update được giữ cho dev; không tự xóa/reset DB đang có. BE4 kiểm tra persistence/API/view; BE3 chủ trì kiểm tra tích hợp rollback xuyên Provider, COD không hết hạn, gia hạn đúng một lần và cạnh tranh cọc/cron; BE2 kiểm tra cạnh tranh tài nguyên. Bàn giao phải chứng minh Buyer/Seller không đọc chéo và một Provider thất bại không để lại đơn/giao dịch/stock/slot của Provider trước.

## 8. Khởi tạo và sử dụng view (2026-10-17)

- [BakeViewInitializer](../../../be/src/main/java/fpt/sba/trungthu/common/data/BakeViewInitializer.java) chạy sau khi Hibernate tạo/cập nhật bảng, trước khi seed user. SQL nguồn tại [v_bake_lines.sql](../../../be/src/main/resources/db/views/v_bake_lines.sql).
- SQL Server dùng CREATE OR ALTER VIEW, H2 dùng CREATE OR REPLACE VIEW; có thể chạy lại khi view đã tồn tại. Hiện initializer hỗ trợ hai hệ DB này; không thêm Flyway/migration và không xóa dữ liệu đơn hàng.
- order_item_id xác định duy nhất một dòng nguồn. View dùng snapshot tên, quantity và bake_quantity; không join Catalog, PaymentTransaction hoặc tính lại số bánh/set. Dữ liệu thay đổi ngay khi Order/Item/Batch thay đổi, không cần chạy job refresh.
- View là nguồn đọc nội bộ chứa các Provider; không tự phân quyền theo JWT. BE2 phải lấy providerId hiện tại từ JWT và lọc cả provider_id lẫn bake_date khi xuất phiếu; không mở truy vấn toàn view cho client. Chưa thêm API xuất/in trong bước 3.

Ví dụ truy vấn tham số hóa để BE2 gom phiếu (hai tham số: Provider hiện tại, ngày nướng):

```sql
SELECT variant_id, product_name, variant_name,
       SUM(quantity) AS quantity, SUM(bake_quantity) AS bake_quantity
FROM v_bake_lines
WHERE provider_id = ? AND bake_date = ?
GROUP BY variant_id, product_name, variant_name
```

Kiểm thử H2 gồm mọi OrderStatus, chuyển trạng thái sau khi tạo view, mốc ngày/tháng/năm nhuận, snapshot set, lọc Provider/ngày, dòng không cần nướng, nhiều Item cùng Variant, nhiều giao dịch thanh toán và khởi tạo view lặp lại. SQL Server chưa được chạy kiểm thử trực tiếp.

## 9. Hàm nội bộ tạo đơn theo Provider (2026-10-17)

Gọi `OrderService.createOrders(CreateOrdersCommand)` qua Spring bean. Định nghĩa đầu vào tại [CreateOrdersCommand](../../../be/src/main/java/fpt/sba/trungthu/dto/request/CreateOrdersCommand.java), xử lý tại [OrderServiceImpl](../../../be/src/main/java/fpt/sba/trungthu/service/impl/OrderServiceImpl.java). Không có endpoint tạo đơn trực tiếp.

- Caller BE3 phải có transaction ghi (`@Transactional(rollbackFor = Exception.class)`); hàm dùng MANDATORY, từ chối thiếu transaction hoặc transaction read-only. Không tạo transaction/commit riêng theo Provider.
- Command dùng checkoutId chung, customerId lấy từ Buyer đã xác thực, orderedAt UTC, người nhận/địa chỉ, VAT tùy chọn và danh sách nhóm Provider đã validate. Không bind command này từ HTTP body vì tên/giá/số bánh là snapshot tin cậy do server chuẩn bị.
- Mỗi nhóm có providerId, deliveryDate, capacityId từ BE2, shippingFee, depositAmount, paymentMethod, holdExpiresAt và items. Mỗi item có variantId, tên sản phẩm/biến thể snapshot, quantity, unitPrice, bakeQuantity; không có SKU.
- MVP một nhóm/ngày giao cho mỗi Provider; lặp providerId trả 400. Mỗi nhóm lưu một Order và một Batch, cùng các Item. Hàm kiểm tra role Customer/Provider, Variant thuộc Provider, capacity đúng Provider/ngày nướng; nhóm có bakeQuantity > 0 bắt buộc capacityId.
- `subtotalAmount = Σ(quantity × unitPrice snapshot)`, `totalAmount = subtotalAmount + shippingFee`. Phụ phí nếu có phải được BE3 đưa vào dòng dịch vụ snapshot; hàm không tra lại giá Catalog, tính khuyến mãi hay quyết định quyền COD/ngưỡng cọc.
- COD: depositAmount=0, holdExpiresAt=null, CONFIRMED/UNPAID, không giao dịch cọc. VIETQR: cọc dương không vượt tổng, deadline sau orderedAt, PENDING_DEPOSIT/UNPAID và một PaymentTransaction ORDER_DEPOSIT/PENDING có paidAt=null. BE3 chịu trách nhiệm quy tắc cọc tối thiểu 50%, deadline ban đầu 15 phút và ngày giao tối thiểu 3 ngày.
- UUID tạo mã Order riêng; mỗi giao dịch cọc có mã DEP-{orderCode}. Không gọi mạng/QR, không giữ/nhả stock hoặc capacity trong hàm BE4; không tự ghi nhận đã nhận tiền.
- Flush sau mỗi nhóm để phát hiện lỗi DB trong hàm, nhưng chỉ caller được commit toàn Checkout. Lỗi nhóm sau rollback cả nhóm trước và tài nguyên caller đã giữ trong cùng transaction; caller không được nuốt lỗi rồi cố commit. Đầu vào sai trả 400, lỗi unique/constraint theo handler hiện tại trả 409. CheckoutId + Provider đã tồn tại bị từ chối, không tự tạo bản sao hoặc trả lại đơn cũ.
- Kết quả là List<Order> cho service BE3 dùng nội bộ, chưa có bảo đảm commit tại thời điểm hàm trả; controller Checkout chỉ trả DTO sau khi transaction ngoài đã commit.

Các test mới dùng transaction thật với fixture H2 đã commit, kiểm tra commit thành công, snapshot, COD/VietQR, VAT, nhóm không cần nướng, liên kết sai, thiếu transaction/read-only, caller lỗi sau khi lưu, Provider thứ hai lỗi DB và caller bắt lỗi nhưng transaction vẫn rollback. Stock/capacity trong test rollback được thay đổi mô phỏng bởi caller; đây chưa phải kiểm thử reserve/release BE2 thực tế.
