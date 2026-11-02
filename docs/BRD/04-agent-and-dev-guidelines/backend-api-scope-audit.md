# Báo Cáo Rà Soát & Đánh Giá Tình Trạng Toàn Bộ Code Backend (BE Tổng)

> **Cập nhật:** 2026-10-31  
> **Dự án:** Trung Thu Platform (Spring Boot 3 + SQL Server / H2)  
> **Tài liệu tham chiếu:** [SRS (docs/BRD/srs.md)](../srs.md), [Hợp đồng Backend (backend-ownership-and-order-contract.md)](backend-ownership-and-order-contract.md), [Data Dictionary](system-data-dictionary.md)

---

## 1. Bảng Tổng Hợp Tình Trạng Theo Phân Vụ (BE1 – BE4)

| Phân hệ / Thành viên | Trách nhiệm chính | Tổng số API | Trong Scope (Cốt lõi MVP) | Dư thừa / Ngoài Scope | API Thiếu (Chưa viết) | Tình trạng tích hợp |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **BE1 – Tiến** | Auth JWT, KYC Compliance, SaaS Subscription, Storage | 30 | **21** | 9 | 0 | Đã tích hợp trơn tru với FE; cần dọn bớt 9 route thừa |
| **BE2 – Đạt** | Catalog, Biến thể, Ảnh, Giữ/Nhả Tồn kho, Giỏ hàng, Sổ kho, Set quà | 37 | **11** | **26** | 1 (`bake-sheet`) | Đã merge master; bị over-engineering nặng (Set, Sổ kho, Cart DB, Dummy API) |
| **BE3 – Phát** | Điều phối Checkout Transaction, Order Lifecycle, VietQR, RFQ B2B | 14 | **14** | 0 | 0 | Đầy đủ luồng giao dịch nạp cọc/COD, hold timer, RFQ hợp đồng |
| **BE4 – Luân** | Persistence Đơn hàng, Phân tách Multi-Provider, Tra cứu đơn Buyer/Seller | 3 | **3** | 0 | 0 | Đã hỗ trợ `v_bake_lines`, tra cứu đơn phân trang chuẩn DTO |
| **Bổ sung / Cross-cutting** | Capacity (Năng lực nướng), Khuyến mãi (Promotion), Khiếu nại (Complaint) | 14 | **14** | 0 | 0 | Tuấn & nhóm bổ sung hoàn thiện tính năng vận hành |
| **TỔNG HỆ THỐNG** | | **98** | **63 (64.3%)** | **35 (35.7%)** | **1** | **Build & Test-compile PASS** |

---

## 2. Chi Tiết Từng Phân Hệ Backend

---

### 2.1. Phân Hệ BE1 (Tiến) – Auth, KYC, SaaS Subscription & Storage
* **Controller:** `AuthController`, `ProviderComplianceController`, `AdminComplianceController`, `ProviderSubscriptionController`, `AdminSubscriptionController`
* **Đánh giá chung:** Đạt 70% chuẩn scope MVP. Các tính năng cốt lõi đáp ứng đầy đủ yêu cầu của FE và hệ thống bảo mật JWT. Có 9 route bị trùng lặp hoặc dư thừa.

#### A. Trong Scope (21 API)
1. **Auth (`/api/auth/**`):**
   - `POST /register`: Đăng ký tài khoản (lưu thông tin ngân hàng cho Seller).
   - `POST /login`: Đăng nhập, cấp HTTP-only JWT cookie.
   - `POST /google`: Đăng nhập nhanh bằng Google OAuth Token.
   - `POST /refresh`: Làm mới token tự động qua Axios Interceptor.
   - `GET /me`: Lấy thông tin user hiện tại khởi tạo store Auth.
   - `POST /change-password`: Đổi mật khẩu trong trang cá nhân.
   - `POST /forgot-password`: Bước 1 - Gửi OTP 6 số qua email.
   - `POST /verify-otp`: Bước 2 - Kiểm tra tính hợp lệ của OTP.
   - `POST /reset-password`: Bước 3 - Đặt lại mật khẩu bằng OTP.
   - `POST /logout`: Đăng xuất, xóa sạch cookie xác thực.
2. **KYC Kiểm duyệt (`/api/provider/compliance/**`, `/api/admin/compliance/**`):**
   - `POST /provider/compliance/upload`: Upload chứng nhận ATTP, GPKD, CCCD qua `LocalStorageService`.
   - `GET /provider/compliance`: Seller theo dõi danh sách & trạng thái phê duyệt giấy tờ.
   - `GET /admin/compliance/status/{status}`: Admin duyệt hồ sơ theo trạng thái `PENDING`, `APPROVED`, `REJECTED`.
   - `PUT /admin/compliance/{id}/approve`: Admin phê duyệt chứng từ (đủ 3 loại tự kích hoạt quyền).
   - `PUT /admin/compliance/{id}/reject`: Admin từ chối kèm lý do phản hồi.
3. **SaaS Gói Bán Hàng (`/api/provider/subscriptions/**`, `/api/admin/subscriptions/**`):**
   - `GET /provider/subscriptions/plans`: Xem bảng giá niêm yết các gói sàn (Cơ bản, Tiêu chuẩn, Cao cấp).
   - `POST /provider/subscriptions`: Seller đăng ký gói kèm mã giao dịch đối soát.
   - `GET /provider/subscriptions`: Lịch sử các gói của Seller.
   - `PUT /provider/subscriptions/{id}/cancel`: Seller hủy yêu cầu gói chưa thanh toán.
   - `GET /admin/subscriptions/status/{status}`: Admin lọc yêu cầu gói đăng ký.
   - `PUT /admin/subscriptions/{id}/activate`: Admin đối soát sao kê và kích hoạt gói cho Seller.

#### B. Dư thừa / Trùng lặp (9 API)
* `POST /api/auth/authenticate/{provider}`: Trùng lặp với login thông thường và google auth.
* `GET /api/provider/compliance/status`: Dư thừa vì FE đã đọc cờ `isComplianceApproved` trong `/auth/me`.
* `GET /api/admin/compliance/pending`: Trùng lặp với `.../status/PENDING`.
* `PUT /api/admin/compliance/{docId}/review`: Trùng lặp với 2 endpoint tách riêng `approve` và `reject`.
* `GET /api/provider/subscriptions/active`: Dư thừa vì FE tự lọc client-side từ danh sách gói.
* `GET /api/provider/subscriptions/status`: Dư thừa (đã có `ProviderPolicyService` chặn ngầm ở BE).
* `GET /api/admin/subscriptions/pending`: Trùng lặp với `.../status/PENDING_PAYMENT`.
* `PUT /api/admin/subscriptions/{id}/cancel`: Thừa ở role Admin (Admin không tự ý huỷ gói thay Seller trên UI).
* `PUT /api/admin/subscriptions/{id}/expire`: Sai scope MVP (theo BRD việc hết hạn gói là tiến trình tự động dời sang Phase 2).

---

### 2.2. Phân Hệ BE2 (Đạt) – Catalog Sản Phẩm, Tồn Kho, Set Quà & Giỏ Hàng
* **Controller:** `ProductController`, `ProviderProductController`, `CartController`, `ProviderDashboardController`, `DummyPaymentController`, `StockWebSocketHandler`
* **Đánh giá chung:** Đạt chỉ có **11 API chuẩn scope**, có tới **26 API dư thừa/over-engineering** (chiếm 70% code của Đạt), và **thiếu 1 API cốt lõi** được giao trong hợp đồng.

#### A. Trong Scope (11 API)
1. **Public Catalog (`/api/products/**`):**
   - `GET /api/products`: Danh sách sản phẩm active cho khách xem (ẩn số tồn kho nội bộ, chỉ hiện `purchasable`).
   - `GET /api/products/{productId}`: Chi tiết sản phẩm, thành phần, câu chuyện và các biến thể.
   - `GET /api/products/images/{imageId}`: Stream dữ liệu file ảnh trực tiếp.
2. **Provider Catalog (`/api/provider/products/**`):**
   - `GET /api/provider/products`: Quản lý danh sách sản phẩm và phân loại của shop mình.
   - `POST /api/provider/products`: Tạo mới sản phẩm nháp (`DRAFT`).
   - `PUT /api/provider/products/{productId}`: Cập nhật thông tin và trạng thái sản phẩm (`DRAFT`, `ACTIVE`, `ARCHIVED`).
   - `PUT /api/provider/products/{productId}/images`: Cập nhật Album ảnh của sản phẩm.
   - `POST /api/provider/products/{productId}/archive`: Xóa mềm / Lưu trữ sản phẩm.
   - `POST /api/provider/products/{productId}/variants`: Thêm biến thể bánh (`weightGram`) hoặc hộp (`boxCapacity`).
   - `PUT /api/provider/products/{productId}/variants/{variantId}`: Sửa giá, SKU, tên biến thể.
   - `DELETE /api/provider/products/{productId}/variants/{variantId}`: Xóa cứng biến thể chưa phát sinh đơn.
   - `POST /api/provider/products/{productId}/variants/{variantId}/imports`: Nhập kho tăng tồn (`stock_quantity`).
3. **Core Services:** `InventoryService.reserveStock()` và `releaseStock()` chạy khóa ghi DB có điều kiện trong Transaction Checkout.

#### B. Dư thừa / Ngoài Scope (26 API)
1. **Cụm Giả lập Đơn hàng (`/api/dummy/**` - 4 API):**
   - `POST /api/dummy/checkout`, `POST /orders/{id}/pay`, `POST /orders/{id}/cancel`, `POST /provider/orders/{id}/advance`.
   - *Lý do:* 100% dư thừa trong Production. Đây là API test tạm cục bộ của Đạt trong giai đoạn dev chờ BE3.
2. **Cụm Giỏ hàng Server-side (`/api/cart/**` - 5 API):**
   - `GET /api/cart`, `POST /api/cart`, `PATCH /api/cart/{id}`, `DELETE /api/cart/{id}`, `POST /swap`.
   - *Lý do:* Theo phân công, giỏ hàng MVP do FE1 (Tuấn) quản lý client-side (LocalStorage) rồi ném payload sang Checkout.
3. **Cụm Quản lý Set Quà 2 Tầng Kho (`/composition`, `/components` - 10 API):**
   - `POST /composition`, `POST /composition/stock`, `POST /composition/release`, `DELETE /composition`, `POST /components`, `PATCH /components/{id}`, `POST /set-adjustments`, `GET /set-stats`, `GET /set-audits`, `GET /set-order-stats`.
   - *Lý do:* MVP quy định không tách hai kênh kho bán lẻ/set, cũng không triển khai cơ chế đóng/xả set động (thuộc Phase 2 Custom Gift Box).
4. **Cụm Sổ kho & Thống kê Thác nước (`/audits`, `/stats`, `/order-stats`, `/terminate`, `/discontinue` - 6 API):**
   - `GET /variants/{id}/stats`, `GET /variants/{id}/order-stats`, `GET /variants/{id}/audits`, `POST /variants/{id}/adjustments`, `POST /variants/{id}/terminate`, `POST /products/{id}/discontinue`.
   - *Lý do:* MVP chỉ quản lý tồn đơn giản bằng số nguyên `stock_quantity`. Đạt tự xây dựng thêm hệ thống sổ kiểm toán kép (`InventoryAudit`) và biểu đồ thác nước.
5. **Dashboard Người bán (`GET /api/provider/dashboard` - 1 API):** Lấn sân sang module Thống kê Báo cáo đơn hàng.
6. **Real-time WebSocket (`/ws/stock`):** Không có trong yêu cầu SRS MVP.

#### C. API Bị Thiếu (Chưa Viết)
* **`GET /api/provider/bake-sheet?date=YYYY-MM-DD` (Phiếu ra lò):**
  - Trong Hợp đồng Backend mục 6 phân công rõ: BE2 chịu trách nhiệm cung cấp API đọc view `v_bake_lines` để in phiếu nướng bánh theo ngày.
  - *Hiện trạng:* View `v_bake_lines` và `BakeViewInitializer` đã có, nhưng **chưa có Controller Endpoint** để trả dữ liệu cho FE2.

---

### 2.3. Phân Hệ BE3 (Phát) – Checkout Transaction, Order Lifecycle, VietQR & RFQ
* **Controller:** `CheckoutController`, `OrderLifecycleController`, `VietQrController`, `ProviderCheckoutSettingsController`, `RfqController`
* **Đánh giá chung:** Đạt **14/14 API trong scope (100%)**. Đảm bảo tính toàn vẹn ACID của đơn hàng đa Provider, thanh toán VietQR và báo giá sỉ B2B.

#### A. Trong Scope (14 API)
1. **Checkout Giao dịch (`/api/checkout/**`):**
   - `POST /api/checkout/preview`: Đọc trước giá trị đơn hàng, phí ship, số tiền cọc (không chiếm giữ kho).
   - `POST /api/checkout`: Submit đơn hàng trong **một transaction duy nhất** (`@Transactional`), gọi BE2 reserve tồn/capacity, gọi BE4 lưu Order theo Provider. Thất bại tự động rollback toàn bộ.
2. **Vòng Đời Đơn Hàng (`OrderLifecycleController`):**
   - `POST /api/provider/orders/{id}/confirm-deposit`: Seller xác nhận số tiền cọc thực nhận trước khi hết hạn hold.
   - `POST /api/orders/{id}/cancel`: Buyer/Seller hủy đơn trước sản xuất; tự động nhả stock và capacity đúng 1 lần.
   - `PATCH /api/provider/orders/{id}/status`: Chuyển trạng thái đơn (`BAKING_QUEUED` $\rightarrow$ `DELIVERING` $\rightarrow$ `COMPLETED`).
3. **VietQR & Cấu hình Thanh toán:**
   - `GET /api/orders/{id}/vietqr`: Sinh link QR động chuẩn Napas 247 theo tài khoản ngân hàng của Provider.
   - `GET /api/provider/checkout-settings`: Xem cài đặt ngân hàng thanh toán của xưởng.
   - `PUT /api/provider/checkout-settings/bank-account`: Cập nhật tài khoản thụ hưởng VietQR.
4. **Báo Giá B2B Doanh Nghiệp (RFQ Module - 7 API):**
   - `POST /api/rfqs`: Doanh nghiệp gửi yêu cầu báo giá bánh số lượng lớn.
   - `GET /api/rfqs/me`: Doanh nghiệp xem danh sách RFQ của mình.
   - `GET /api/provider/rfqs`: Seller xem bảng tin các yêu cầu báo giá trên sàn.
   - `GET /api/provider/rfqs/quotes/me`: Seller xem danh sách báo giá mình đã gửi.
   - `POST /api/provider/rfqs/{requestId}/quotes`: Seller gửi báo giá chi tiết (đơn giá, chiết khấu).
   - `GET /api/rfqs/{requestId}/quotes`: Khách xem các báo giá nhận được từ các xưởng.
   - `POST /api/rfqs/{requestId}/quotes/{quoteId}/accept`: Khách chốt báo giá, hiển thị thông tin hợp đồng.

---

### 2.4. Phân Hệ BE4 (Luân) – Persistence Đơn Hàng & Tra Cứu Đơn
* **Controller:** `OrderController`, `ProviderOrderController`
* **Đánh giá chung:** Đạt **3/3 API trong scope (100%)**. Đóng vai trò lớp Data Layer & Query cho luồng Order.

#### A. Trong Scope (3 API)
1. `GET /api/orders/me`: Khách hàng xem lịch sử đơn hàng của mình (hỗ trợ phân trang, lọc theo trạng thái và khoảng ngày nhận).
2. `GET /api/orders/{id}`: Xem chi tiết đơn hàng (chỉ Buyer hoặc Seller sở hữu mới được quyền xem, ngoài ra trả 404).
3. `GET /api/provider/orders`: Xưởng bánh xem toàn bộ danh sách đơn đặt tại xưởng của mình.
4. **Database View:** Quản lý và duy trì view `v_bake_lines` tổng hợp sản lượng bánh cần nướng theo ngày giao.

---

### 2.5. Các Phân Hệ Mở Rộng / Vận Hành (Capacity, Khuyến Mãi, Khiếu Nại)
* **Controller:** `CapacityController` (do Tuấn hỗ trợ viết), `PromotionController`, `ComplaintController`
* **Đánh giá chung:** Đạt **14/14 API trong scope (100%)**, hoàn thiện toàn bộ nghiệp vụ thực tế của sàn.

#### A. Trong Scope (14 API)
1. **Năng lực sản xuất xưởng (`/api/capacity/**` - 3 API):**
   - `GET /api/providers/{providerId}/available-dates`: Khách xem các ngày còn slot nhận bánh của xưởng.
   - `GET /api/provider/capacities`: Xưởng xem lịch phân bổ năng lực nướng theo ngày.
   - `PUT /api/provider/capacities`: Xưởng thiết lập giới hạn công suất nướng (`max_capacity`) cho từng ngày.
2. **Khuyến mãi & Mã giảm giá (`/api/.../promotions` - 5 API):**
   - `GET /api/public/promotions`: Danh sách mã giảm giá công khai trên sàn.
   - `GET /api/provider/promotions`: Xưởng xem các mã khuyến mãi do mình tạo.
   - `POST /api/provider/promotions`: Xưởng tạo voucher (giảm tiền mặt hoặc giảm theo %).
   - `PUT /api/provider/promotions/{id}`: Cập nhật điều kiện voucher.
   - `DELETE /api/provider/promotions/{id}`: Xóa/Tắt mã khuyến mãi.
3. **Khiếu nại & Đổi trả (`/api/complaints/**` - 6 API):**
   - `POST /api/complaints`: Khách gửi yêu cầu khiếu nại (bánh hỏng, giao sai, thiếu hàng).
   - `GET /api/complaints/me`: Khách theo dõi tiến độ xử lý khiếu nại.
   - `GET /api/provider/complaints`: Xưởng tiếp nhận và xem khiếu nại từ khách.
   - `PUT /api/provider/complaints/{id}`: Xưởng giải trình hoặc chấp thuận xử lý khiếu nại.
   - `GET /api/admin/complaints`: Admin sàn giám sát các vụ tranh chấp giữa khách và xưởng.
   - `PUT /api/admin/complaints/{id}`: Admin can thiệp đưa ra phán quyết xử lý tranh chấp cuối cùng.

---

## 3. Tổng Kết & Đề Xuất Hành Động

1. **Hạng mục Cần Bổ Sung Ngay (Missing Scope):**
   - Cần bổ sung endpoint **`GET /api/provider/bake-sheet?date=YYYY-MM-DD`** vào `ProviderProductController` hoặc `CapacityController` để đọc dữ liệu từ view `v_bake_lines` phục vụ tính năng in phiếu nướng của Seller (FE2).

2. **Hạng mục Cần Dọn Dẹp / Đóng Lại (Cleanup Scope):**
   - **Xóa hoặc ẩn toàn bộ `/api/dummy/**`** để tránh nhầm lẫn với API Checkout chính thống của BE3.
   - Giữ nguyên các API Catalog/Variant chính thống của BE2; các cụm API Set quà (`/composition`) và Sổ kho chi tiết (`/audits`, `/stats`) nếu FE không dùng thì đóng lại hoặc đánh dấu `@Deprecated` để tránh gánh nặng kiểm thử.
   - Dọn 9 route trùng lặp ở BE1 (`/pending`, `/review`, `/authenticate/{provider}`).
