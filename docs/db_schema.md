# 🗄️ Tài Liệu Đặc Tả CSDL Hoàn Chỉnh (Complete Database Schema Specification)

Tài liệu này tổng hợp toàn bộ 17 Thực thể (Entities), Bảng dữ liệu (Tables), Kiểu dữ liệu (JPA Mappings), Ràng buộc (Constraints) và Enum dành cho hệ thống **Nền Tảng Bán Bánh Trung Thu Trực Tuyến (`trung_thu_web`)** phát triển trên nền tảng **Spring Boot (Spring Data JPA / H2 / PostgreSQL)**.

> [!IMPORTANT]
> **Mô Hình Sàn Đăng Ký SaaS Provider (Pure Provider SaaS Model)**:
> - **KHÔNG Thu Hoa Hồng (0% Commission)**.
> - **KHÔNG Quản Lý Tiền Đơn Hàng & KHÔNG Dùng Ví Escrow (No Escrow Hold)**.
> - Sàn chỉ thu phí duy nhất từ **Gói Đăng Ký SaaS Provider (`provider_subscriptions`)**.
> - Tiền đặt cọc/thanh toán đơn hàng của Người mua chuyển trực tiếp tới tài khoản ngân hàng của Provider (hoặc COD khi nhận bánh). 

---

## 📌 1. Danh Sách Các Bảng Dữ Liệu (17 Tables Summary)

| STT | Tên Bảng (Table Name) | Tên Entity JPA | Vai Trò & Mô Tả Nghiệp Vụ |
| :---: | :--- | :--- | :--- |
| **1** | `users` | `User` | Quản lý Người mua (Buyer), Cửa hàng (Seller/Provider) và Platform Admin. |
| **2** | `store_compliance_docs` | `StoreComplianceDoc` | Hồ sơ pháp lý cửa hàng (Giấy ATTT, GPKD, CCCD KYC). |
| **3** | `provider_subscriptions` | `ProviderSubscription` | Gói đăng ký dịch vụ SaaS của Provider & thời hạn hiển thị bán hàng trên Sàn. |
| **4** | `products` | `Product` | Quản lý dòng sản phẩm/dịch vụ gốc (Bánh Lẻ, Vỏ Hộp, Thiệp Chúc Mừng, Dịch Vụ Đi Kèm). |
| **5** | `product_variants` | `ProductVariant` | Biến thể SKU sản phẩm bán (Trọng lượng 150g/200g/250g, Set 2/4/6, Loại thiệp, Phí gói quà, Tồn kho). |
| **6** | `product_images` | `ProductImage` | Album hình ảnh chi tiết của dòng sản phẩm hoặc biến thể. |
| **7** | `daily_capacities` | `DailyCapacity` | Quản lý Hạn ngạch nướng bánh theo ngày Dương Lịch (Capacity Cap). |
| **8** | `orders` | `Order` | Quản lý Đơn hàng B2C lẻ/custom và Đơn sỉ B2B tổng thể. |
| **9** | `order_batches` | `OrderBatch` | Quản lý các Đợt giao hàng nhỏ tách ra từ Đơn hàng lớn (Khác ngày giao). |
| **10** | `custom_boxes` | `CustomBox` | Chi tiết Hộp quà tùy chỉnh (Vỏ hộp + Chữ in vỏ hộp + Thiệp chúc). |
| **11** | `custom_box_items` | `CustomBoxItem` | Vị trí biến thể bánh lẻ xếp vào các vị trí slot trong Hộp quà custom. |
| **12** | `order_items` | `OrderItem` | Chi tiết các biến thể bánh lẻ/dịch vụ mua trực tiếp không đóng hộp. |
| **13** | `production_batches` | `ProductionBatch` | Lô sản xuất nướng bánh gom theo đợt ra lò của Nhà sản xuất. |
| **14** | `payment_transactions` | `PaymentTransaction` | Nhật ký thanh toán phí đăng ký SaaS Provider & Đơn hàng đối soát ngân hàng Provider. |
| **15** | `b2b_rfqs` | `B2bRfq` | Yêu cầu báo giá sỉ Doanh nghiệp ($\ge 20$ hộp, đính kèm logo công ty). |
| **16** | `provider_quotations` | `ProviderQuotation` | Báo giá chi tiết từ từng Provider/Seller nộp cho RFQ B2B. |
| **17** | `complaints` | `Complaint` | Tiếp nhận Khiếu nại sản phẩm trực tiếp 24h & Cảnh báo vi phạm/Ẩn sản phẩm của Provider nếu có sai phạm. |

---

## 📑 2. Chi Tiết Cấu Trúc Các Bảng (Table Schemas)

### 2.1 Bảng `users` (Tài khoản Người Dùng & Provider)
- **Mô tả**: Lưu trữ tài khoản toàn hệ thống và thông tin chủ gian hàng Provider.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID định danh tài khoản. |
| `email` | `String` / `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Email đăng nhập hệ thống. |
| `password` | `String` / `VARCHAR(255)` | `NOT NULL` | Mật khẩu mã hóa (BCrypt). |
| `full_name` | `String` / `VARCHAR(100)` | `NOT NULL` | Họ và tên người dùng. |
| `phone` | `String` / `VARCHAR(20)` | `NOT NULL` | Số điện thoại liên hệ. |
| `role` | `String` / `VARCHAR(20)` | `NOT NULL` | Enum: `BUYER`, `SELLER`, `PLATFORM_ADMIN`. |
| `store_name` | `String` / `VARCHAR(150)` | `NULLABLE` | Tên thương hiệu/gian hàng (dành cho `SELLER`). |
| `is_compliance_approved` | `Boolean` / `BOOLEAN` | `DEFAULT false` | Đã phê duyệt đủ Giấy phép ATTT & Định danh KYC. |
| `is_season_active` | `Boolean` / `BOOLEAN` | `DEFAULT true` | Công tắc Bật/Tạm Ngừng mùa vụ thủ công của Seller. |
| `created_at` | `LocalDateTime` / `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo tài khoản. |

---

### 2.2 Bảng `store_compliance_docs` (Hồ Sơ Pháp Lý & Tài Liệu Provider)
- **Mô tả**: Quản lý tài liệu An toàn Thực phẩm, Giấy phép kinh doanh và KYC định danh Provider.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID định danh tài liệu. |
| `seller_id` | `Long` / `BIGINT` | `FOREIGN KEY (users.id)` | ID Seller sở hữu tài liệu. |
| `doc_type` | `String` / `VARCHAR(30)` | `NOT NULL` | Enum: `FOOD_SAFETY_CERT`, `BUSINESS_LICENSE`, `IDENTITY_KYC`. |
| `document_number` | `String` / `VARCHAR(100)` | `NULLABLE` | Số hiệu giấy chứng nhận / Mã hợp đồng. |
| `file_url` | `String` / `VARCHAR(500)` | `NOT NULL` | Đường dẫn file ảnh/PDF chứng nhận. |
| `issue_date` | `LocalDate` / `DATE` | `NULLABLE` | Ngày cấp giấy phép. |
| `expiry_date` | `LocalDate` / `DATE` | `NULLABLE` | Ngày hết hạn giấy phép (`null` nếu vô thời hạn). |
| `status` | `String` / `VARCHAR(20)` | `NOT NULL` | Enum: `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`. |
| `rejection_reason` | `String` / `VARCHAR(255)` | `NULLABLE` | Lý do từ chối nếu bị từ chối duyệt. |

---

### 2.3 Bảng `provider_subscriptions` (Gói Đăng Ký Dịch Vụ SaaS Của Provider)
- **Mô tả**: Quản lý gói dịch vụ SaaS, phí đăng ký và thời gian hết hạn hiển thị của Provider trên sàn.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID hợp đồng gói đăng ký. |
| `seller_id` | `Long` / `BIGINT` | `FOREIGN KEY (users.id)`, `UNIQUE` | ID Seller/Provider sở hữu gói. |
| `package_name` | `String` / `VARCHAR(100)` | `NOT NULL` | Tên gói đăng ký (VD: `"Gói Thuê SaaS Mùa Trung Thu 3 Tháng"`). |
| `package_type` | `String` / `VARCHAR(30)` | `NOT NULL` | Enum: `STANDARD`, `VIP_TOP_BANNER`, `EXCLUSIVE_POPUP`. |
| `rental_fee` | `BigDecimal` / `DECIMAL(12,2)` | `NOT NULL` | Phí đăng ký gói dịch vụ thu về cho Sàn (VNĐ). |
| `start_date` | `LocalDate` / `DATE` | `NOT NULL` | Ngày bắt đầu hiệu lực gói dịch vụ. |
| `end_date` | `LocalDate` / `DATE` | `NOT NULL` | Ngày hết hạn gói dịch vụ SaaS. |
| `max_products_allowed` | `Integer` / `INT` | `DEFAULT 20` | Giới hạn số lượng SKU sản phẩm tối đa được niêm yết. |
| `status` | `String` / `VARCHAR(20)` | `NOT NULL` | Enum: `PENDING_PAYMENT`, `ACTIVE`, `SUSPENDED`, `EXPIRED`. |

---

### 2.4 Bảng `products` (Dòng Sản Phẩm & Dịch Vụ Gốc)
- **Mô tả**: Lưu trữ dòng sản phẩm cha (Parent Product), loại sản phẩm/dịch vụ và hạn sử dụng.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID dòng sản phẩm gốc. |
| `seller_id` | `Long` / `BIGINT` | `FOREIGN KEY (users.id)` | ID Seller sở hữu sản phẩm. |
| `name` | `String` / `VARCHAR(150)` | `NOT NULL` | Tên dòng sản phẩm (VD: `"Bánh Trung Thu Thập Cẩm Gà Quay"`, `"Thiệp Ép Kim Hoàng Gia"`). |
| `product_type` | `String` / `VARCHAR(30)` | `NOT NULL` | Enum: `LOOSE_CAKE`, `BOX_SHELL`, `GREETING_CARD`, `ADDON_SERVICE`. |
| `category` | `String` / `VARCHAR(30)` | `NOT NULL` | Enum: `BAKED`, `SNOWSKIN`, `VEGAN`, `LOW_SUGAR`, `PACKAGING`, `SERVICES`. |
| `description` | `Text` / `TEXT` | `NULLABLE` | Mô tả thành phần, quy cách, chi tiết dịch vụ đi kèm. |
| `is_active` | `Boolean` / `BOOLEAN` | `DEFAULT true` | Trạng thái hiển thị sản phẩm. |
| `created_at` | `LocalDateTime` / `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo sản phẩm. |

---

### 2.5 Bảng `product_variants` (Biến Thể Sản Phẩm SKU)
- **Mô tả**: Lưu thông tin cụ thể từng kích thước/trọng lượng bánh lẻ, loại vỏ hộp (Set 2, 4, 6), loại thiệp hoặc phí dịch vụ đi kèm.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID biến thể SKU. |
| `product_id` | `Long` / `BIGINT` | `FOREIGN KEY (products.id)` | ID dòng sản phẩm cha. |
| `sku` | `String` / `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Mã SKU định danh (VD: `BAKED-GAQUAY-150G`, `SERVICE-WRAP-LUXURY`). |
| `variant_name` | `String` / `VARCHAR(100)` | `NOT NULL` | Tên biến thể (VD: `"150g"`, `"200g"`, `"Set 4 Bánh"`, `"Gói Lụa Đỏ"`). |
| `weight_gram` | `Integer` / `INT` | `NULLABLE` | Trọng lượng bánh tính theo Gram (150, 200, 250; null nếu không phải bánh lẻ). |
| `box_capacity` | `Integer` / `INT` | `NULLABLE` | Dung tích vỏ hộp chứa (2, 4 hoặc 6 bánh; null nếu không phải vỏ hộp). |
| `price` | `BigDecimal` / `DECIMAL(12,2)` | `NOT NULL`, $\ge 0$ | Giá bán niêm yết (VNĐ). |
| `stock_quantity` | `Integer` / `INT` | `NOT NULL`, $\ge 0$ | Số lượng tồn kho biến thể hiện tại. |
| `is_active` | `Boolean` / `BOOLEAN` | `DEFAULT true` | Trạng thái cho phép đặt hàng biến thể này. |

---

### 2.6 Bảng `product_images` (Album Hình Ảnh Sản Phẩm)
- **Mô tả**: Quản lý nhiều ảnh góc nhìn cho dòng sản phẩm và biến thể.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID định danh ảnh. |
| `product_id` | `Long` / `BIGINT` | `FOREIGN KEY (products.id)` | ID dòng sản phẩm. |
| `variant_id` | `Long` / `BIGINT` | `FOREIGN KEY (product_variants.id)`, `NULL` | ID biến thể cụ thể (Nullable). |
| `image_url` | `String` / `VARCHAR(500)` | `NOT NULL` | Đường dẫn ảnh CDN/S3. |
| `is_primary` | `Boolean` / `BOOLEAN` | `DEFAULT false` | Ảnh đại diện chính (Primary Cover). |
| `display_order` | `Integer` / `INT` | `DEFAULT 0` | Thứ tự hiển thị trong slideshow. |

---

### 2.7 Bảng `daily_capacities` (Hạn Ngạch Nướng Bánh Theo Ngày)
- **Mô tả**: Giới hạn năng lực nướng bánh theo từng ngày Dương Lịch cho Seller.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID định danh. |
| `seller_id` | `Long` / `BIGINT` | `FOREIGN KEY (users.id)` | Seller thiết lập hạn ngạch. |
| `date` | `LocalDate` / `DATE` | `NOT NULL` | Ngày Dương Lịch ra lò (`YYYY-MM-DD`). |
| `max_capacity` | `Integer` / `INT` | `NOT NULL` | Hạn ngạch nướng tối đa trong ngày (VD: 500 bánh). |
| `current_booked` | `Integer` / `INT` | `DEFAULT 0` | Số lượng bánh đã được giữ chỗ nướng trong ngày. |

---

### 2.8 Bảng `orders` (Quản Lý Đơn Hàng B2C / B2B Tổng Thể)
- **Mô tả**: Quản lý tổng quan đơn hàng, giá trị tiền cọc và khách hàng.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `String` / `VARCHAR(50)` | `PRIMARY KEY` | Mã đơn hàng (VD: `ORD-20260925-9821`). |
| `seller_id` | `Long` / `BIGINT` | `FOREIGN KEY (users.id)` | Seller tiếp nhận xử lý đơn. |
| `buyer_id` | `Long` / `BIGINT` | `FOREIGN KEY (users.id)`, `NULL` | Buyer đặt hàng (Nullable nếu vãng lai). |
| `customer_name` | `String` / `VARCHAR(100)` | `NOT NULL` | Họ tên người mua. |
| `customer_phone` | `String` / `VARCHAR(20)` | `NOT NULL` | SĐT người mua. |
| `order_type` | `String` / `VARCHAR(20)` | `NOT NULL` | Enum: `B2C_RETAIL`, `B2B_BULK`. |
| `subtotal_amount` | `BigDecimal` / `DECIMAL(12,2)` | `NOT NULL` | Tổng tiền hàng toàn bộ đợt. |
| `shipping_fee` | `BigDecimal` / `DECIMAL(12,2)` | `DEFAULT 0` | Phí vận chuyển toàn bộ đợt. |
| `total_amount` | `BigDecimal` / `DECIMAL(12,2)` | `NOT NULL` | Tổng giá trị đơn hàng (`subtotal + shipping_fee`). |
| `deposit_amount` | `BigDecimal` / `DECIMAL(12,2)` | `DEFAULT 0` | Số tiền cọc bắt buộc ($\ge 50\%$ nếu custom). |
| `deposit_status` | `String` / `VARCHAR(20)` | `NOT NULL` | Enum: `UNPAID`, `DEPOSITED`, `PAID_FULL`. |
| `status` | `String` / `VARCHAR(30)` | `NOT NULL` | Enum: `PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`. |
| `created_at` | `LocalDateTime` / `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm khởi tạo đơn hàng. |

---

### 2.9 Bảng `order_batches` (Các Đợt Giao Hàng Nhỏ Tách Tới Ngày Giao Khác Nhau)
- **Mô tả**: Cho phép chia 1 Đơn hàng thành nhiều Đợt giao hàng với các Ngày giao Dương/Âm Lịch và địa điểm khác nhau.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID đợt giao hàng. |
| `order_id` | `String` / `VARCHAR(50)` | `FOREIGN KEY (orders.id)` | Mã đơn hàng tổng. |
| `batch_code` | `String` / `VARCHAR(50)` | `NOT NULL` | Mã đợt giao (VD: `BATCH-01`, `BATCH-02`). |
| `expected_delivery_date` | `LocalDate` / `DATE` | `NOT NULL` | Ngày nhận bánh tươi Dương Lịch (`YYYY-MM-DD`). |
| `expected_lunar_date` | `String` / `VARCHAR(50)` | `NOT NULL` | Nhãn Âm Lịch quy đổi (VD: `"15/08 Âm Lịch"`). |
| `recipient_name` | `String` / `VARCHAR(100)` | `NOT NULL` | Họ tên người nhận đợt này. |
| `recipient_phone` | `String` / `VARCHAR(20)` | `NOT NULL` | SĐT người nhận đợt này. |
| `shipping_address` | `String` / `VARCHAR(255)` | `NOT NULL` | Địa chỉ giao đợt này. |
| `batch_quantity` | `Integer` / `INT` | `NOT NULL` | Tổng số lượng sản phẩm/hộp trong đợt này. |
| `status` | `String` / `VARCHAR(30)` | `NOT NULL` | Enum: `PENDING_BAKING`, `BAKING_QUEUED`, `DELIVERING`, `DELIVERED`, `CANCELLED`. |

---

### 2.10 Bảng `custom_boxes` (Chi Tiết Bộ Hộp Quà Custom)
- **Mô tả**: Lưu thông tin in tên lên vỏ hộp và thiệp chúc mừng đi kèm theo từng Đợt giao.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID định danh hộp custom. |
| `order_batch_id` | `Long` / `BIGINT` | `FOREIGN KEY (order_batches.id)` | ID Đợt giao hàng sở hữu. |
| `box_variant_id` | `Long` / `BIGINT` | `FOREIGN KEY (product_variants.id)` | ID biến thể vỏ hộp quà (`BOX_SHELL`). |
| `custom_text` | `String` / `VARCHAR(50)` | `NULLABLE` | Nội dung in đè lên vỏ hộp (tối đa 50 ký tự). |
| `greeting_card_text` | `String` / `VARCHAR(150)` | `NULLABLE` | Nội dung thiệp chúc mừng (tối đa 150 ký tự). |

---

### 2.11 Bảng `custom_box_items` (Vị Trí Bánh Lẻ Trong Hộp Custom)
- **Mô tả**: Liên kết từng biến thể bánh lẻ vào các ô slot trong Hộp quà custom.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID vị trí bánh. |
| `custom_box_id` | `Long` / `BIGINT` | `FOREIGN KEY (custom_boxes.id)` | ID Hộp custom chứa bánh. |
| `cake_variant_id` | `Long` / `BIGINT` | `FOREIGN KEY (product_variants.id)` | ID biến thể bánh lẻ (`LOOSE_CAKE`) được chọn. |
| `slot_index` | `Integer` / `INT` | `NOT NULL` | Vị trí ô slot trong hộp ($1 \dots N$). |

---

### 2.12 Bảng `order_items` (Sản Phẩm & Dịch Vụ Mua Trực Tiếp)
- **Mô tả**: Chi tiết các biến thể bánh lẻ hoặc dịch vụ đi kèm mua trực tiếp không đóng hộp.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID dòng sản phẩm/dịch vụ lẻ. |
| `order_batch_id` | `Long` / `BIGINT` | `FOREIGN KEY (order_batches.id)` | ID Đợt giao hàng sở hữu. |
| `variant_id` | `Long` / `BIGINT` | `FOREIGN KEY (product_variants.id)` | ID biến thể sản phẩm/dịch vụ (`LOOSE_CAKE`, `GREETING_CARD`, `ADDON_SERVICE`). |
| `quantity` | `Integer` / `INT` | `NOT NULL`, $> 0$ | Số lượng chiếc/lượt mua. |
| `unit_price` | `BigDecimal` / `DECIMAL(12,2)` | `NOT NULL` | Đơn giá tại thời điểm mua. |

---

### 2.13 Bảng `production_batches` (Lô Sản Xuất Nướng Bánh Ra Lò NSX)
- **Mô tả**: Gộp nhu cầu sản xuất bánh lẻ theo ngày nướng và loại nhân của Nhà sản xuất.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID lô sản xuất. |
| `seller_id` | `Long` / `BIGINT` | `FOREIGN KEY (users.id)` | ID Nhà sản xuất / Seller. |
| `production_date` | `LocalDate` / `DATE` | `NOT NULL` | Ngày ra lò dự kiến (`YYYY-MM-DD`). |
| `cake_variant_id` | `Long` / `BIGINT` | `FOREIGN KEY (product_variants.id)` | ID biến thể bánh nướng. |
| `total_quantity` | `Integer` / `INT` | `NOT NULL` | Tổng số lượng chiếc cần nướng trong đợt này. |
| `status` | `String` / `VARCHAR(20)` | `NOT NULL` | Enum: `SCHEDULED`, `IN_PRODUCTION`, `COMPLETED`. |

---

### 2.14 Bảng `payment_transactions` (Nhật Ký Thanh Toán Phí SaaS Provider Của Sàn)
- **Mô tả**: Nhật ký đối soát thanh toán phí gói SaaS của Provider nộp về cho Sàn (`type = PROVIDER_SUBSCRIPTION_FEE`) và giao dịch thanh toán đơn hàng chuyển trực tiếp Provider.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID định danh giao dịch. |
| `subscription_id` | `Long` / `BIGINT` | `FOREIGN KEY (provider_subscriptions.id)`, `NULL` | ID hợp đồng gói SaaS Provider (nếu là phí đăng ký SaaS). |
| `order_id` | `String` / `VARCHAR(50)` | `FOREIGN KEY (orders.id)`, `NULL` | Mã đơn hàng tương ứng (nếu đối soát trực tiếp). |
| `transaction_code` | `String` / `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Mã giao dịch nội bộ (VD: `TXN-20260925-0012-01`). |
| `provider` | `String` / `VARCHAR(20)` | `NOT NULL` | Enum: `VIETQR`, `PAYOS`, `VNPAY`, `MOMO`, `DIRECT_BANK`. |
| `gateway_transaction_id` | `String` / `VARCHAR(100)` | `NULLABLE` | Mã giao dịch ngân hàng/cổng trả về qua Webhook. |
| `type` | `String` / `VARCHAR(30)` | `NOT NULL` | Enum: `PROVIDER_SUBSCRIPTION_FEE`, `ORDER_DIRECT_PAYMENT`. |
| `amount` | `BigDecimal` / `DECIMAL(12,2)` | `NOT NULL` | Số tiền giao dịch (VNĐ). |
| `status` | `String` / `VARCHAR(20)` | `NOT NULL` | Enum: `PENDING`, `SUCCESS`, `FAILED`, `EXPIRED`. |
| `paid_at` | `LocalDateTime` / `TIMESTAMP` | `NULLABLE` | Thời điểm xác nhận giao dịch thành công. |

---

### 2.15 Bảng `b2b_rfqs` (Yêu Cầu Báo Giá Sỉ Doanh Nghiệp)
- **Mô tả**: Đăng ký báo giá sỉ ($\ge 20$ hộp), các đợt giao mong muốn và upload file logo công ty.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `String` / `VARCHAR(50)` | `PRIMARY KEY` | Mã RFQ (VD: `RFQ-20260925-0042`). |
| `company_name` | `String` / `VARCHAR(150)` | `NOT NULL` | Tên công ty / tổ chức mua. |
| `tax_code` | `String` / `VARCHAR(30)` | `NULLABLE` | Mã số thuế doanh nghiệp. |
| `contact_person` | `String` / `VARCHAR(100)` | `NOT NULL` | Họ tên người đại diện mua. |
| `phone` | `String` / `VARCHAR(20)` | `NOT NULL` | SĐT người liên hệ. |
| `email` | `String` / `VARCHAR(100)` | `NOT NULL` | Email nhận file báo giá PDF. |
| `estimated_quantity` | `Integer` / `INT` | `NOT NULL`, $\ge 20$ | Số lượng hộp dự kiến mua sỉ. |
| `target_budget` | `BigDecimal` / `DECIMAL(12,2)` | `NULLABLE` | Ngân sách dự kiến (VNĐ). |
| `logo_file_url` | `String` / `VARCHAR(500)` | `NULLABLE` | Link file đính kèm logo công ty ($< 10\text{MB}$). |
| `delivery_notes` | `String` / `VARCHAR(500)` | `NULLABLE` | Ghi chú yêu cầu đợt giao / địa điểm / mẫu thử. |
| `sales_status` | `String` / `VARCHAR(25)` | `NOT NULL` | Enum: `NEW`, `DISTRIBUTED`, `QUOTES_RECEIVED`, `WON`, `LOST`. |
| `created_at` | `LocalDateTime` / `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm gửi yêu cầu. |

---

### 2.16 Bảng `provider_quotations` (Báo Giá Chi Tiết Từ Provider)
- **Mô tả**: Nhận báo giá đấu thầu từ các Provider cho yêu cầu B2B RFQ.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID định danh báo giá. |
| `rfq_id` | `String` / `VARCHAR(50)` | `FOREIGN KEY (b2b_rfqs.id)` | Mã yêu cầu RFQ tương ứng. |
| `seller_id` | `Long` / `BIGINT` | `FOREIGN KEY (users.id)` | ID Seller/Provider gửi báo giá. |
| `quote_code` | `String` / `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Mã báo giá (VD: `QUO-20260925-01`). |
| `total_quoted_price` | `BigDecimal` / `DECIMAL(12,2)` | `NOT NULL` | Tổng số tiền báo giá (VNĐ). |
| `discount_percentage` | `Double` / `DOUBLE` | `DEFAULT 0.0` | Tỷ lệ chiết khấu thương mại do Provider tự cấu hình cho đơn sỉ. |
| `valid_until` | `LocalDate` / `DATE` | `NOT NULL` | Hạn chót hiệu lực của Báo giá. |
| `proposal_notes` | `Text` / `TEXT` | `NULLABLE` | Đề xuất quà tặng, ngày giao, cam kết mẫu thử. |
| `status` | `String` / `VARCHAR(25)` | `NOT NULL` | Enum: `SUBMITTED`, `ACCEPTED`, `REJECTED`, `EXPIRED`. |
| `created_at` | `LocalDateTime` / `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm nộp báo giá. |

---

### 2.17 Bảng `complaints` (Khiếu Nại Sản Phẩm & Vi Phạm Provider)
- **Mô tả**: Tiếp nhận khiếu nại chất lượng sản phẩm (bánh mốc/hỏng/sai mô tả) gắn trực tiếp với `product_id` để Admin xử lý vi phạm, trừ điểm uy tín hoặc tạm ẩn Sản phẩm của Provider.

| Tên Trường (Column) | Kiểu Dữ Liệu (JPA / DB) | Ràng Buộc (Constraints) | Mô Tả Nghiệp Vụ |
| :--- | :--- | :--- | :--- |
| `id` | `Long` / `BIGINT` | `PRIMARY KEY`, `AUTO_INCREMENT` | ID định danh khiếu nại. |
| `product_id` | `Long` / `BIGINT` | `FOREIGN KEY (products.id)` | ID sản phẩm bị khiếu nại. |
| `buyer_id` | `Long` / `BIGINT` | `FOREIGN KEY (users.id)`, `NULL` | ID người gửi khiếu nại. |
| `reason` | `String` / `VARCHAR(500)` | `NOT NULL` | Lý do khiếu nại (bánh mốc/hỏng hóc/sai thông số/chất lượng kém). |
| `video_unboxing_url` | `String` / `VARCHAR(500)` | `NOT NULL` | Link video/ảnh minh chứng mở hộp sản phẩm. |
| `status` | `String` / `VARCHAR(25)` | `NOT NULL` | Enum: `OPEN`, `RESOLVED`, `REJECTED`. |
| `admin_notes` | `String` / `VARCHAR(500)` | `NULLABLE` | Ghi chú của Admin (VD: *"Tạm ẩn sản phẩm 7 ngày do vi phạm chất lượng"*). |
| `created_at` | `LocalDateTime` / `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời điểm gửi khiếu nại. |

---

## 🔠 3. Tổng Hợp Tất Cả Độc Lập Các Kiểu Enum (Spring Boot Enums)

```java
public enum Role { BUYER, SELLER, PLATFORM_ADMIN }
public enum ComplianceDocType { FOOD_SAFETY_CERT, BUSINESS_LICENSE, IDENTITY_KYC }
public enum ComplianceDocStatus { PENDING, APPROVED, REJECTED, EXPIRED }
public enum SubscriptionPackage { STANDARD, VIP_TOP_BANNER, EXCLUSIVE_POPUP }
public enum SubscriptionStatus { PENDING_PAYMENT, ACTIVE, SUSPENDED, EXPIRED }
public enum ProductType { LOOSE_CAKE, BOX_SHELL, GREETING_CARD, ADDON_SERVICE }
public enum Category { BAKED, SNOWSKIN, VEGAN, LOW_SUGAR, PACKAGING, SERVICES }
public enum OrderType { B2C_RETAIL, B2B_BULK }
public enum DepositStatus { UNPAID, DEPOSITED, PAID_FULL }
public enum OrderStatus { PENDING, PROCESSING, COMPLETED, CANCELLED }
public enum OrderBatchStatus { PENDING_BAKING, BAKING_QUEUED, DELIVERING, DELIVERED, CANCELLED }
public enum ProductionBatchStatus { SCHEDULED, IN_PRODUCTION, COMPLETED }
public enum PaymentProvider { VIETQR, PAYOS, VNPAY, MOMO, DIRECT_BANK }
public enum TransactionType { PROVIDER_SUBSCRIPTION_FEE, ORDER_DIRECT_PAYMENT }
public enum TransactionStatus { PENDING, SUCCESS, FAILED, EXPIRED }
public enum RfqStatus { NEW, DISTRIBUTED, QUOTES_RECEIVED, WON, LOST }
public enum QuoteStatus { SUBMITTED, ACCEPTED, REJECTED, EXPIRED }
public enum ComplaintStatus { OPEN, RESOLVED, REJECTED }
```

