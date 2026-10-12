# 📋 Software Requirements Specification (SRS) - Streamlined MVP

- **Dự án**: Nền Tảng Bán Bánh Trung Thu Trực Tuyến Tùy Biến (`trungthu`)
- **Phiên bản**: `v1.2.0` (Streamlined Scope cho 6 người x 4 tuần)
- **Tài liệu căn cứ**: `docs/BRD/`, `docs/specs/system-data-dictionary.md`
- **Mô hình kiến trúc**: Spring Boot 3.x RESTful Backend + Modern Web Frontend (Tailwind/CSS Overlay)
- **Mô hình kinh doanh**: Pure SaaS 0% hoa hồng, thanh toán cọc trực tiếp tài khoản Provider (No Escrow).

---

## 1. Giới Thiệu (Introduction)

### 1.1 Mục Đích Tài Liệu
Tài liệu quy định chi tiết các yêu cầu chức năng (Functional Requirements - `REQ`) và yêu cầu phi chức năng (Non-Functional Requirements - `NFR`) cho hệ thống sàn thương mại dịch vụ bánh Trung Thu. Tài liệu này đã được **tinh gọn phạm vi khả thi (Feasible Scope)** để nhóm phát triển 6 người hoàn thành xuất sắc trong thời gian 4 tuần, tập trung vào các nghiệp vụ lõi khác biệt có tính bảo vệ học thuật cao.

### 1.2 Phạm Vi Sản Phẩm (Scope of Product)
Nền tảng đóng vai trò là phần mềm trung gian dịch vụ (Pure SaaS Platform):
- **Phía Người Mua (Buyer)**: Trải nghiệm công cụ tự phối hộp quà Trung Thu (Set 2, 4, 6 chiếc) với Live Preview CSS Overlay, đặt bánh tươi theo lịch Dương lịch (lead-time $\ge 3$ ngày), quét ảnh VietQR chuyển khoản cọc trực tiếp cho chủ xưởng.
- **Phía Xưởng Bánh (Provider/Seller)**: Đăng ký gói SaaS mùa vụ, thiết lập hạn ngạch nướng bánh theo ngày (`bake_date = expected_delivery_date - 1`), theo dõi lịch ra lò, xuất Phiếu Ra Lò Bánh Tươi bằng lệnh in trình duyệt, nhận thông tin yêu cầu báo giá sỉ B2B.
- **Phía Quản Trị (Platform Admin)**: Kiểm duyệt hồ sơ pháp lý ATTP/ĐKKD của xưởng, đối soát và kích hoạt gói SaaS của Provider.

---

## 2. Mô Tả Tổng Thể Hệ Thống (Overall Description)

### 2.1 Các Tác Nhân Hệ Thống (Actors & User Classes)

| Tác nhân | Quyền hạn (`Role`) | Mô tả & Trách nhiệm chính |
| :--- | :--- | :--- |
| **Khách Vãng Lai (Guest)** | `ANONYMOUS` | Xem danh mục sản phẩm, xem hồ sơ ATTP xưởng, thử công cụ phối hộp quà & xem trước giá. Bắt buộc đăng ký/đăng nhập tài khoản BUYER trước khi chốt đơn (Bỏ Guest Checkout để đảm bảo an toàn đơn hàng). |
| **Người Mua (Buyer)** | `BUYER` | Đặt hàng B2C, thanh toán cọc $\ge 50\%$ qua ảnh VietQR, gửi form yêu cầu sỉ B2B RFQ, tra cứu trạng thái đơn hàng. |
| **Chủ Xưởng (Seller/Provider)**| `SELLER` | Nộp hồ sơ KYC xưởng, đăng ký gói SaaS, niêm yết SKU, quản lý Lịch Ra Lò theo ngày nướng `bake_date`, xác nhận nhận cọc, in Phiếu Ra Lò. |
| **Quản Trị Nền Tảng (Platform Admin)** | `PLATFORM_ADMIN` | Phê duyệt hồ sơ KYC ATTP (`is_compliance_approved`), đối soát chuyển khoản và kích hoạt gói SaaS cho Provider. |

### 2.2 Đặc Thù Nghiệp Vụ Cốt Lõi (Domain Specifics)
1. **Bánh tươi HSD ngắn (Perishable Fresh Shelf-Life)**: Bánh dẻo 7-10 ngày, bánh nướng 10-15 ngày. Bắt buộc nướng trước ngày giao 1 ngày (`bake_date = expected_delivery_date - 1`), không lưu kho dài ngày.
2. **Nguyên tắc Solar-First Core**: Toàn bộ hệ thống CSDL, logic nghiệp vụ, tính ngày giao đều dùng **Dương Lịch (`LocalDate`)**. Nhãn lịch Âm được hạ xuống hạng mục mở rộng (`Optional / Phase 2`).
3. **Mở nhận đơn linh hoạt quanh năm**: Hệ thống cho phép đặt hàng B2C và gửi B2B RFQ quanh năm, chỉ cần thỏa mãn khoảng cách chuẩn bị tối thiểu $\ge 3$ ngày (`expected_delivery_date >= CURRENT_DATE + 3`) và xưởng còn hạn ngạch nướng (`capacity_cap`).
4. **Mô hình Pure SaaS - No Escrow**: Sàn không thu phí hoa hồng đơn hàng, **không giữ tiền ký quỹ**. Người mua quét ảnh VietQR chuyển thẳng vào tài khoản ngân hàng của từng Provider.
5. **Giao diện không Emoji**: Tuân thủ tuyệt đối quy chuẩn UI chuyên nghiệp, sử dụng bộ icon SVG tiêu chuẩn (`lucide-react`), không sử dụng emoji thô.

### 2.3 Phân Định Phạm Vi MVP vs Giai Đoạn 2 (MVP Scope vs Phase 2)

- **🟢 Giai Đoạn MVP (Must-Have / Core MVP cho 6 người x 4 tuần)**:
  - Xác thực người dùng Local JWT (`CUSTOMER`, `PROVIDER`, `PLATFORM_ADMIN`) với mật khẩu băm BCrypt. Bắt buộc đăng nhập trước khi checkout.
  - Tải lên hồ sơ pháp lý ATTP/GPKD qua 1 flow chung (`store_compliance_docs`) và Admin xét duyệt để kích hoạt mở bán (`is_compliance_approved`).
  - Đăng ký gói SaaS: `STANDARD` (20 SKU) và `VIP` (100 SKU, gắn cờ `is_featured`). Provider chuyển khoản cho sàn, Platform Admin đối soát và kích hoạt thủ công.
  - Quản lý danh mục Product/Variant (Bánh lẻ, Set hộp đóng sẵn tiêu chuẩn, Thiệp chúc mừng).
  - Quản lý album ảnh sản phẩm (`product_images`) với 1 ảnh đại diện chính.
  - **Giỏ hàng chung & Tách đơn tự động theo Provider (Hướng A)**: Khách hàng được tự do nhặt sản phẩm từ nhiều Provider vào 1 giỏ hàng chung; khi bấm checkout, hệ thống tự động tách thành các đơn hàng con độc lập (`Order`) theo từng `provider_id`.
  - Đặt hàng các sản phẩm tiêu chuẩn (Set hộp có sẵn và bánh lẻ mua kèm qua `order_items`).
  - Ràng buộc ngày nhận $\ge 3$ ngày (Chặn cứng trong MVP). Tính ngày nướng `bake_date = delivery_date - 1`.
  - Kiểm soát hạn ngạch nướng xưởng (`daily_capacities`) theo `bake_date`. Tự động khóa ngày nướng khi chạm 100% công suất.
  - Thanh toán cọc trực tiếp qua ảnh VietQR miễn phí riêng cho từng đơn con của từng Provider. Seller vào Dashboard bấm "Xác Nhận Đã Nhận Cọc" $\rightarrow$ Đơn chuyển sang `DEPOSITED` (Không dùng webhook).
  - Tiến trình `@Scheduled` giữ chỗ 15 phút: quá hạn tự hủy đơn sang `CANCELLED`, hoàn trả tồn kho và trừ giảm `booked_quantity` theo `bake_date`.
  - Tiếp nhận form yêu cầu báo giá sỉ B2B RFQ ($\ge 20$ hộp) và hiển thị trên Dashboard của Provider để chủ động liên hệ ngoài hệ thống.
  - Phiếu Ra Lò Bánh Tươi tổng hợp theo `bake_date` tính động bằng SQL query, hỗ trợ in bằng CSS `@media print` của trình duyệt.
  - Tiếp nhận thông tin xuất hóa đơn VAT (lưu 4 trường vào bảng `orders`).
  - UI tĩnh hiển thị Chính sách Keep-the-Item Refund & Miễn trừ đổi ý bánh tươi.

- **🟡 Giai Đoạn 2 (Post-MVP / Phase 2 - Advanced Expansion & Retained Entities)**:
  - **Tự phối Hộp quà B2C Custom Box (`custom_boxes`, `custom_box_items`)**: Lắp ghép bánh vào từng slot và Live Preview in tên vỏ hộp 60fps bằng CSS Absolute Overlay.
  - Đăng nhập Social (Google OAuth2 - `user_social_accounts`).
  - Phụ phí giao gấp lead-time 24h - 48h ($50.000$ VNĐ/hộp).
  - Chia đơn hàng thành nhiều đợt giao tới nhiều địa chỉ chi nhánh (`order_batches` đa địa chỉ).
  - Cổng đấu thầu nộp báo giá kín đa xưởng tự động (`provider_quotations`) và so sánh chốt thầu online cho khách doanh nghiệp.
  - Cổng khiếu nại tiếp nhận upload Video unboxing và bảng `complaints` xử phạt gian hàng.
  - Quản lý mẻ nướng bánh vật lý tại lò xưởng (`production_batches`).
  - Gói thuê SaaS độc quyền Pop-up Banner (`EXCLUSIVE_POPUP`) và cron tự động khóa gói hết hạn.

---

## 3. Yêu Cầu Chức Năng Chi Tiết (Functional Requirements - [REQ-xxx])

### 3.1 Xác Thực, Phân Quyền & Hồ Sơ Pháp Lý (Auth & KYC Compliance)

- **`[REQ-AUTH-01]` `[MVP]` Đăng ký & Đăng nhập phân quyền Local JWT**:
  - Hệ thống cung cấp cơ chế đăng ký và xác thực tài khoản dựa trên JWT (JSON Web Token) cho 3 vai trò: `CUSTOMER`, `PROVIDER`, `PLATFORM_ADMIN`.
  - Mật khẩu mã hóa bằng thuật toán BCrypt. Khách vãng lai bắt buộc đăng nhập tài khoản BUYER/CUSTOMER trước khi bấm đặt hàng.
- **`[REQ-AUTH-02]` `[MVP]` Nộp hồ sơ pháp lý cửa hàng dạng flow hợp nhất (`store_compliance_docs`)**:
  - Provider (`PROVIDER`) tải lên giấy tờ chứng minh ATTP / ĐKKD qua form upload hợp nhất (chấp nhận `.pdf`, `.png`, `.jpg` $\le 10\text{MB}$).
- **`[REQ-AUTH-03]` `[MVP]` Kiểm duyệt hồ sơ tuân thủ (`is_compliance_approved`)**:
  - `PLATFORM_ADMIN` xem xét hồ sơ, phê duyệt (`APPROVED`) hoặc từ chối (`REJECTED` kèm lý do).
  - Cột `users.is_compliance_approved` chuyển thành `true` khi Admin phê duyệt.
- **`[REQ-AUTH-04]` `[MVP]` Chặn quyền mở bán khi chưa đủ điều kiện tuân thủ**:
  - Mọi tài khoản `PROVIDER` có `is_compliance_approved = false` bị hệ thống chặn quyền xuất bản sản phẩm ra ngoài sàn.

---

### 3.2 Gói Đăng Ký Dịch Vụ SaaS Provider (Provider SaaS Subscription)

- **`[REQ-SAAS-01]` `[MVP]` Đăng ký gói SaaS Provider (`provider_subscriptions` / `Subscription`)**:
  - Seller đăng ký 1 trong 2 gói dịch vụ SaaS mùa vụ:
    - **`STANDARD`**: Phí $1.000.000$ VNĐ/mùa, giới hạn tối đa **20 biến thể SKU** (`max_products_allowed = 20`).
    - **`VIP`**: Phí $3.000.000$ VNĐ/mùa, giới hạn tối đa **100 biến thể SKU** (`max_products_allowed = 100`), gắn cờ nổi bật `is_featured = true` ưu tiên hiển thị gian hàng ở đầu danh sách.
- **`[REQ-SAAS-02]` `[MVP]` Thanh toán phí SaaS & Đối soát thủ công**:
  - Provider thực hiện chuyển khoản phí dịch vụ tới số tài khoản ngân hàng của Platform Admin với cú pháp `SUB-[SellerId]`. Giao dịch ghi nhận loại `SUBSCRIPTION_FEE` ở trạng thái `PENDING`.
  - Platform Admin kiểm tra sao kê ngân hàng và bấm nút "Xác Nhận Kích Hoạt Gói" trên trang quản trị $\rightarrow$ Chuyển trạng thái gói sang `ACTIVE`.
- **`[REQ-SAAS-03]` `[Phase 2]` Tự động kiểm tra hết hạn gói SaaS**:
  - Tiến trình Cron quét hàng ngày chuyển gói hết hạn sang `SUSPENDED`.
- **`[REQ-SAAS-04]` `[MVP]` Công tắc Bật/Tạm dừng nhận đơn thủ công (`is_season_active`)**:
  - Provider chủ động gạt công tắc bật hoặc tạm dừng nhận đơn. Khi gạt `false`, gian hàng hiển thị thông báo tạm ngừng nhận đơn mới.

---

### 3.3 Danh Mục Sản Phẩm & Tồn Kho (Catalog & Inventory)

- **`[REQ-CAT-01]` `[MVP]` Mô hình Sản Phẩm & Biến Thể SKU (`Product` & `ProductVariant`)**:
  - Phân loại sản phẩm gốc:
    - `LOOSE_CAKE`: Bánh lẻ (khối lượng 150g, 200g, 250g; nhân ngọt, nhân mặn).
    - `BOX_SHELL`: Hộp quà đóng sẵn tiêu chuẩn (Set 2 bánh, Set 4 bánh, Set 6 bánh).
    - `GREETING_CARD`: Mẫu thiệp Trung Thu chúc mừng.
    - `ADDON_SERVICE`: Dịch vụ gia tăng (túi quà, thắt nơ).
  - Quản lý album ảnh sản phẩm qua `ProductImage` với cờ `is_primary` cho ảnh đại diện chính.
  - Mỗi biến thể SKU (`ProductVariant`) quản lý mã SKU, trọng lượng/dung tích, đơn giá (`price`) và tồn kho (`stock_quantity`).
- **`[REQ-CAT-02]` `[MVP]` Hiển thị Hạn Sử Dụng Bánh Tươi**:
  - Dòng bánh lẻ khai báo `shelf_life_days` (7-15 ngày), giao diện hiển thị khuyến cáo HSD tính từ ngày ra lò.
- **`[REQ-CAT-03]` `[MVP]` Quản lý tồn kho thời gian thực**:
  - Kiểm tra tồn kho nguyên tử (`Atomic Stock Validation`) lúc checkout, trừ kho thành phẩm chính xác theo số lượng đặt mua trong `order_items`.
- **`[REQ-CAT-04]` `[MVP]` Tự động làm mờ khi hết hàng (Out-of-Stock)**:
  - Biến thể có tồn kho $= 0$ bị vô hiệu hóa (`disabled`) trên giao diện bán lẻ để ngăn chặn over-selling.

---

### 3.4 Tùy Chỉnh Hộp Quà B2C & Live Preview (Custom Box Builder - [Phase 2])

- **`[REQ-B2C-01]` `[Phase 2]` Chọn dung tích vỏ hộp biến thể**: Set 2, Set 4, Set 6 bánh.
- **`[REQ-B2C-02]` `[Phase 2]` Lắp ghép bánh vào vị trí Slot**: Khách hàng phải lấp đầy 100% ô slot của vỏ hộp đã chọn (`custom_boxes`, `custom_box_items`).
- **`[REQ-B2C-03]` `[Phase 2]` In tên vỏ hộp & thiệp chúc**: Nhập chữ in vỏ hộp (tối đa 50 ký tự, đã lọc XSS) và lời chúc trong thiệp (tối đa 150 ký tự).
- **`[REQ-B2C-04]` `[Phase 2]` Xem trước trực tiếp bằng CSS Absolute Overlay**: Mô phỏng chữ in đè lên phôi vỏ hộp PNG sử dụng tọa độ CSS tuyệt đối, mượt mà trên thiết bị di động.
- **`[REQ-B2C-05]` `[Phase 2]` Tồn kho đa tầng vỏ hộp + bánh lẻ**: Trừ kho đồng thời 1 vỏ hộp và các bánh lẻ trong hộp custom.

---

### 3.5 Chính Sách Giá & Phụ Phí (Pricing & Surcharges)

- **`[REQ-PRIC-01]` `[Phase 2]` Chiến dịch giá mùa vụ (Campaign Toggle)**: Cấu hình hệ số mùa vụ tự động theo đợt.
- **`[REQ-PRIC-02]` `[Phase 2]` Phụ phí đặt gấp (Rush Lead-time)**: Nhận đơn trong 24h - 48h kèm phụ thu 50.000 VNĐ/hộp.
- **`[REQ-PRIC-03]` `[MVP]` Phí in ấn tùy biến cá nhân hóa**: Đơn B2C $< 5$ hộp: phụ thu $20.000$ VNĐ/hộp. Đơn $\ge 5$ hộp: Miễn phí in tên.
- **`[REQ-PRIC-04]` `[Phase 2]` Chiết khấu sỉ tự động theo bậc thang**: B2B thương lượng trực tiếp qua RFQ trong MVP.

---

### 3.6 Đặt Hàng Bánh Tươi & Hạn Ngạch Nướng (Fresh Scheduling & Capacity)

- **`[REQ-BATCH-01]` `[MVP]` Chặn cứng Lead-time $\ge 3$ ngày & Quy tắc Ngày Ra Lò (`bake_date`)**:
  - Bắt buộc ngày nhận bánh Dương lịch: `expected_delivery_date >= CURRENT_DATE + 3`. Chặn cứng tuyệt đối nếu chọn $< 3$ ngày.
  - Công thức xác định Ngày Ra Lò:
    $$\text{bake\_date} = \text{expected\_delivery\_date} - 1$$
  - Hạn ngạch nướng xưởng (`daily_capacities`) và Phiếu Ra Lò được tính toán và trừ hạn ngạch theo ngày **`bake_date`**.
- **`[REQ-BATCH-02]` `[Phase 2 / Optional]` Hiển thị nhãn Âm Lịch tham khảo**:
  - Dương Lịch là căn cứ cốt lõi. Nhãn Âm Lịch tham khảo là tiện ích bổ sung khi có điều kiện thời gian.
- **`[REQ-BATCH-03]` `[MVP: 1 Đợt / Phase 2: Đa Đợt]` Đợt giao hàng (`order_batches`)**:
  - MVP hỗ trợ đơn hàng giao trong 1 đợt chính cố định.
- **`[REQ-BATCH-04]` `[Phase 2]` Phụ phí điều phối đợt giao phát sinh**.

---

### 3.7 Yêu Cầu Báo Giá Sỉ B2B (B2B RFQ)

- **`[REQ-B2B-01]` `[MVP]` Tạo Yêu Cầu Báo Giá B2B Quanh Năm (`b2b_rfqs`)**:
  - Doanh nghiệp đặt từ $\ge 20$ hộp gửi form RFQ (Tên công ty, MST, Người liên hệ, SĐT, Email, Số lượng, Ngày nhận mong muốn, Logo vector đính kèm).
- **`[REQ-B2B-02]` `[MVP]` Sinh mã & hiển thị RFQ trên Dashboard Provider**:
  - Sinh mã tự động `RFQ-YYYYMMDD-XXXX`.
  - Phân phối RFQ lên danh sách Dashboard của các Provider hợp lệ. Provider chủ động liên hệ trực tiếp khách hàng qua SĐT/Email để gửi báo giá chi tiết và gửi hộp mẫu.
- **`[REQ-B2B-03]`, `[04]`, `[05]` `[Phase 2]` Cổng đấu thầu nộp báo giá kín & chốt thầu online**.

---

### 3.8 Lịch Sản Xuất & Phiếu Ra Lò (Production Calendar & Capacity)

- **`[REQ-PROD-01]` `[MVP]` Dashboard Lịch Sản Xuất Dương Lịch**: Hiển thị danh sách lịch nướng bánh theo ngày của từng Provider.
- **`[REQ-PROD-02]` `[MVP]` Tự động tổng hợp Phiếu Ra Lò Bánh Tươi theo `bake_date`**:
  - Khi Provider chọn ngày nướng trên lịch: hệ thống thực hiện SQL query gom toàn bộ bánh lẻ và hộp quà có ngày nhận trùng `bake_date + 1`.
  - Xuất bảng tổng hợp số lượng từng vị bánh lẻ cần nướng (VD: 150 Thập cẩm, 80 Hạt sen).
  - Cung cấp nút in nhanh Phiếu Ra Lò sử dụng CSS `@media print` của trình duyệt. Không cần tạo bảng lưu trữ `production_batches`.
- **`[REQ-PROD-03]` `[MVP]` Cấu hình Hạn Ngạch Nướng Bánh Hàng Ngày (`daily_capacities`)**: Provider cài đặt `capacity_cap` theo ngày nướng.
- **`[REQ-PROD-04]` `[MVP]` Tự động khóa ngày nướng khi chạm 100% công suất**: Khi `booked_quantity >= capacity_cap`, ngày nhận tương ứng (`bake_date + 1`) bị mờ (disabled) trên lịch đặt hàng của khách.

---

### 3.9 Thanh Toán Trực Tiếp, Đặt Cọc & Giữ Chỗ (Payment & 15-Min Reservation)

- **`[REQ-PAY-01]` `[MVP]` Chính sách Đặt cọc linh hoạt & Cho phép COD đơn thường**:
  - Đơn in tên riêng hoặc tổng tiền $\ge 2.000.000$ VNĐ: Bắt buộc cọc tối thiểu **50%** (`deposit_amount >= total_amount * 0.5`).
  - Đơn tiêu chuẩn (không in ấn) $< 2.000.000$ VNĐ: Được phép chọn **COD** (`deposit_amount = 0`).
- **`[REQ-PAY-02]` `[MVP]` Thanh toán cọc trực tiếp qua ảnh VietQR & Xác nhận thủ công (No Webhook)**:
  - **Giỏ hàng chung & Tách đơn theo Provider (Hướng A)**: Khách hàng được tự do nhặt sản phẩm từ nhiều Provider vào giỏ hàng chung. Tại bước Checkout, hệ thống tự động tách giỏ hàng thành các Đơn Hàng con độc lập (`Order`) theo từng `provider_id`. Mỗi đơn hàng con có mã đơn riêng, số tiền cọc riêng và sinh mã ảnh VietQR riêng.
  - **Sinh ảnh VietQR**: Hệ thống sinh URL ảnh mã VietQR miễn phí từ API:
    `https://img.vietqr.io/image/{bank_code}-{bank_account_number}-compact2.png?amount={deposit_amount}&addInfo=ORD-{order_code}`
  - **Xác nhận thanh toán**: Khách chuyển khoản trực tiếp vào tài khoản ngân hàng của từng Provider tương ứng. Provider kiểm tra sao kê số dư trên app ngân hàng của mình và bấm nút **"Xác Nhận Đã Nhận Cọc"** trên Dashboard Provider $\rightarrow$ Đơn hàng con tương ứng chuyển sang `DEPOSITED`.
  - **Lý do kiến trúc**: Loại bỏ webhook tự động của sàn vì tiền cọc chảy thẳng vào tài khoản của Seller, sàn không giữ tiền (No Escrow) nên sàn không có kết nối webhook merchant với ngân hàng cá nhân của Provider.
  - **Idempotency**: Bảo vệ bằng kiểm tra ràng buộc chuyển trạng thái đơn hàng (chỉ cho phép xác nhận khi đơn đang ở `PENDING_DEPOSIT`).
- **`[REQ-PAY-03]` `[MVP]` Tiếp nhận thông tin xuất hóa đơn VAT điện tử**: Thu thập MST, Tên công ty, Email nhận hóa đơn (lưu trực tiếp 4 trường vào bảng `orders`).
- **`[REQ-PAY-04]` `[MVP]` Giữ chỗ 15 phút & Thu hồi công suất tự động (`@Scheduled`)**:
  - Đơn hàng khởi tạo ở `PENDING_DEPOSIT` được giữ chỗ tồn kho và hạn ngạch nướng (`booked_quantity`) theo `bake_date` trong vòng **15 phút**.
  - Sau 15 phút nếu Seller chưa bấm xác nhận nhận cọc, tiến trình `@Scheduled` tự động chuyển đơn sang `CANCELLED`, hoàn trả số lượng tồn kho (`stock_quantity`) và trừ giảm `booked_quantity` theo `bake_date`.

---

### 3.10 Chính Sách Bánh Tươi & Miễn Trừ Đổi Trả (Perishable Policy)

- **`[REQ-DISP-01]` `[MVP]` Hiển thị chính sách miễn trừ đổi trả do đổi ý**: Bánh tươi và hộp quà in riêng miễn trừ trả hàng do đổi ý.
- **`[REQ-DISP-02]` `[MVP]` Hiển thị cam kết Keep-the-Item Refund**: Cam kết đền bù hoàn tiền/đổi bánh mới giữ nguyên bánh cũ nếu bị mốc, hư hỏng hoặc in sai tên do lỗi xưởng.
- **`[REQ-DISP-03]` `[Phase 2]` Cổng nộp video unboxing khiếu nại 24h & xử lý chế tài gian hàng**.

---

## 4. Yêu Cầu Phi Chức Năng (Non-Functional Requirements - [NFR-xxx])

### 4.1 Hiệu Năng & Trải Nghiệm (Performance & UX Target)
- **`[NFR-PERF-01]` Mục tiêu Live Preview**: CSS Absolute Overlay hướng tới trải nghiệm mượt mà, độ trễ phản hồi khi gõ phím $< 500\text{ms}$.
- **`[NFR-PERF-02]` Tối ưu hóa truy vấn**: Truy vấn danh mục sản phẩm và kiểm tra hạn ngạch lịch nướng phản hồi $< 500\text{ms}$ trong môi trường thử nghiệm.

### 4.2 Bảo Mật & Toàn Vẹn Dữ Liệu (Security & Data Integrity)
- **`[NFR-SEC-01]` Chống tấn công XSS**: Nội dung in trên vỏ hộp và thiệp chúc mừng phải được sanitize sạch ký tự HTML/Script.
- **`[NFR-SEC-02]` Bảo vệ trạng thái đơn hàng (State Guard)**: Ngăn chặn thao tác trùng lặp bằng cách validate trạng thái đơn nghiêm ngặt tại tầng Service.
- **`[NFR-SEC-03]` Kiểm tra định dạng tệp tải lên**: Chặn tệp thực thi, chỉ chấp nhận file ảnh và PDF hợp lệ cho hồ sơ KYC xưởng.

### 4.3 Chuẩn Mực Giao Diện & Iconography (Design & Iconography Rules)
- **`[NFR-UI-01]` Tuyệt đối không dùng Emoji thô trong UI**: Tuyệt đối KHÔNG sử dụng ký tự emoji thô trong giao diện người dùng, nút bấm, badge hoặc thẻ trạng thái.
- **`[NFR-UI-02]` Chuẩn Icon Vector SVG (`lucide-react`)**: Sử dụng toàn bộ icon SVG đồng bộ phong cách từ thư viện `lucide-react`.

### 4.4 Mục Tiêu Vận Hành Hệ Thống (Operational Target)
- **`[NFR-REL-01]` Tính ổn định hệ thống**: Hệ thống hướng tới hoạt động liên tục, ổn định phục vụ mục đích kiểm thử và demo đồ án tốt nghiệp, không áp dụng cam kết SLA pháp lý 99.9% thương mại.

---

## 5. Ràng Buộc Kỹ Thuật & Kiến Trúc (Architectural Constraints)

1. **Công nghệ Backend**: Java 21+, Spring Boot 3.x, Spring Data JPA, Spring Security, Hibernate Validator.
2. **Cơ sở dữ liệu**: PostgreSQL, chuẩn hóa `UUID id` trong `BaseEntity`.
3. **Mô hình tính toán thời gian (Solar-First Architecture)**: Toàn bộ lưu trữ và tính toán sử dụng `java.time.LocalDate` Dương Lịch.
4. **Kiến trúc phân tầng chuẩn**: `Controller` $\rightarrow$ `Service` / `ServiceImpl` $\rightarrow$ `Repository` $\rightarrow$ `Entity`.
5. **In ấn tinh gọn**: Sử dụng CSS `@media print` cho Phiếu Ra Lò, không dùng thư viện xuất PDF nặng nề tại máy chủ.
6. **Tuân thủ Pháp lý Thương mại điện tử**: Nền tảng thiết kế cấu trúc sẵn sàng cho việc Thông báo website TMĐT với Bộ Công Thương theo Nghị định 52/2013 và Nghị định 85/2021.

---

## 6. Ma Trận Truy Xuất Yêu Cầu Tinh Gọn (Streamlined Traceability Matrix)

| Nhóm Yêu Cầu | Mã Yêu Cầu SRS | Phạm Vi (Scope) | Business Rule Gốc | Bảng CSDL Tương Ứng (13 Bảng) |
| :--- | :--- | :---: | :--- | :--- |
| **Xác thực & KYC** | `[REQ-AUTH-01]` $\rightarrow$ `[REQ-AUTH-04]` | **MVP** | `BR-06` | `users`, `store_compliance_docs` |
| **Gói SaaS Provider** | `[REQ-SAAS-01]`, `[02]`, `[04]`<br>`[REQ-SAAS-03]` (Cron hết hạn) | **MVP**<br>Phase 2 | `BR-06` | `provider_subscriptions`, `payment_transactions` |
| **Sản phẩm & Tồn kho** | `[REQ-CAT-01]` $\rightarrow$ `[REQ-CAT-04]` | **MVP** | `BR-01`, `BR-05` | `products`, `product_variants`, `product_images` |
| **Tùy biến Hộp Quà** | `[REQ-B2C-01]` $\rightarrow$ `[REQ-B2C-05]` | **Phase 2** | `BR-01`, `BR-05` | `custom_boxes`, `custom_box_items` |
| **Giá cả & Phụ phí** | `[REQ-PRIC-03]` (Phí in)<br>`[REQ-PRIC-01]`, `[02]`, `[04]` | **MVP**<br>Phase 2 | `BR-03` | `product_variants`, `orders` |
| **Lịch Bánh Tươi** | `[REQ-BATCH-01]` (Lead-time $\ge 3$ ngày)<br>`[REQ-BATCH-02]`, `[03]`, `[04]` | **MVP** (1 đợt)<br>Phase 2 (Đa đợt) | `BR-01`, `BR-04` | `order_batches`, `orders` |
| **B2B RFQ** | `[REQ-B2B-01]`, `[REQ-B2B-02]`<br>`[REQ-B2B-03]` $\rightarrow$ `[REQ-B2B-05]` | **MVP** (Form & List)<br>Phase 2 (Đấu thầu) | `BR-02` | `b2b_rfqs` |
| **Lịch Sản Xuất** | `[REQ-PROD-01]`, `[03]`, `[04]`<br>`[REQ-PROD-02]` (Phiếu Ra Lò Query) | **MVP** | `BR-04` | `daily_capacities` |
| **Thanh toán & Cọc** | `[REQ-PAY-01]` (Cọc 50%/COD)<br>`[REQ-PAY-02]` (VietQR thẳng Seller)<br>`[REQ-PAY-03]` (VAT), `[04]` (Hủy 15p)| **MVP** | `BR-01`, `BR-05`, `BR-06` | `payment_transactions`, `orders` |
| **Khiếu nại & Hoàn tiền** | `[REQ-DISP-01]`, `[REQ-DISP-02]` (UI Policy)<br>`[REQ-DISP-03]` (Upload Video) | **MVP**<br>Phase 2 | `BR-05` | *UI tĩnh trong MVP* |
