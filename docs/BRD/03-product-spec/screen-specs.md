# 📱 Screen Specification Document (Chi Tiết Giao Diện & UI States)

- **Mã tài liệu**: `SPEC-SCREEN-01`
- **Dự án**: `Nền Tảng Bán Bánh Trung Thu Trực Tuyến`
- **Phiên bản**: `v1.0.0`
- **Thư mục**: `docs/specs/screen-specs.md`
- **Quy chuẩn UI**: Không dùng emoji thô, 100% icon sử dụng SVG từ `lucide-react`. Phủ 100% các routes có trong Sitemap.

---

## 📑 Danh Mục Màn Hình Được Đặc Tả (100% Sitemap Coverage)

### Nhóm 1: Giao Diện Người Mua (Buyer & Public Screens)
1. [`/` - Trang Chủ & Mùa Vụ](#1---trang-chủ--mùa-vụ)
2. [`/products` - Khám Phá Bánh Lẻ & Hộp Quà](#2-products---khám-phá-bánh-lẻ--hộp-quà)
3. [`/products/:id` - Chi Tiết Sản Phẩm & Biến Thể](#3-productsid---chi-tiết-sản-phẩm--biến-thể)
4. [`/custom-box` - Phối Hộp Quà & Live Preview CSS 60fps](#4-custom-box---phối-hộp-quà--live-preview-css-60fps)
5. [`/b2b-rfq` - Gửi Yêu Cầu Báo Giá Doanh Nghiệp](#5-b2b-rfq---gửi-yêu-cầu-báo-giá-doanh-nghiệp)
6. [`/b2b-portal/rfqs` - Danh Sách Yêu Cầu B2B Đã Gửi](#6-b2b-portalrfqs---danh-sách-yêu-cầu-b2b-đã-gửi)
7. [`/b2b-portal/rfqs/:rfqId/compare` - So Sánh Báo Giá Đa Provider](#7-b2b-portalrfqsrfqidcompare---so-sánh-báo-giá-đa-provider)
8. [`/cart` - Giỏ Hàng & Tách Đợt Giao Hàng Bánh Tươi](#8-cart---giỏ-hàng--tách-đợt-giao-hàng-bánh-tươi)
9. [`/checkout` - Thanh Toán Đặt Cọc, Lịch Nhận & Hóa Đơn VAT](#9-checkout---thanh-toán-đặt-cọc-lịch-nhận--hóa-đơn-vat)
10. [`/order-success/:orderId` - Xác Nhận Đơn Hàng & Hướng Dẫn VietQR](#10-order-successorderid---xác-nhận-đơn-hàng--hướng-dẫn-vietqr)
11. [`/order-tracking` - Tra Cứu Đơn Hàng Qua SĐT/Mã Đơn](#11-order-tracking---tra-cứu-đơn-hàng-qua-sđtmã-đơn)
12. [`/order-tracking/:orderId` - Tiến Độ Ra Lò & Khiếu Nại 24h](#12-order-trackingorderid---tiến-độ-ra-lò--khiếu-nại-24h)
13. [`/compliance` - Hồ Sơ Pháp Lý & Chứng Nhận ATTP](#13-compliance---hồ-sơ-pháp-lý--chứng-nhận-attp)
14. [`/auth/login` - Đăng Nhập Hệ Thống](#14-authlogin---đăng-nhập-hệ-thống)
15. [`/auth/register` - Đăng Ký Tài Khoản](#15-authregister---đăng-ký-tài-khoản)
16. [`/auth/forgot-password` - Khôi Phục Mật Khẩu](#16-authforgot-password---khôi-phục-mật-khẩu)

### Nhóm 2: Giao Diện Quản Trị Gian Hàng (Seller / Provider Screens)
17. [`/seller/onboarding` - Tải Lên Hồ Sơ ATTP & KYC](#17-selleronboarding---tải-lên-hồ-sơ-attp--kyc)
18. [`/seller/subscription` - Đăng Ký & Thanh Toán Gói SaaS](#18-sellersubscription---đăng-ký--thanh-toán-gói-saas)
19. [`/seller/dashboard` - Báo Cáo Tổng Quan Gian Hàng](#19-sellerdashboard---báo-cáo-tổng-quan-gian-hàng)
20. [`/seller/products` - Quản Lý Dòng Sản Phẩm & SKU](#20-sellerproducts---quản-lý-dòng-sản-phẩm--sku)
21. [`/seller/products/new` - Thêm Mới Dòng Sản Phẩm & Biến Thể](#21-sellerproductsnew---thêm-mới-dòng-sản-phẩm--biến-thể)
22. [`/seller/products/:id/edit` - Cập Nhật Biến Thể & Kho Hàng](#22-sellerproductsidedit---cập-nhật-biến-thể--kho-hàng)
23. [`/seller/calendar` - Lịch Sản Xuất Song Lịch Âm/Dương](#23-sellercalendar---lịch-sản-xuất-song-lịch-âmdương)
24. [`/seller/daily-sheet` - Phiếu Ra Lò Bánh Tươi & Bản In Xưởng](#24-sellerdaily-sheet---phiếu-ra-lò-bánh-tươi--bản-in-xưởng)
25. [`/seller/orders` - Quản Lý Đơn Hàng & Đợt Giao](#25-sellerorders---quản-lý-đơn-hàng--đợt-giao)
26. [`/seller/b2b-bids` - Đấu Thầu Báo Giá B2B RFQ](#26-sellerb2b-bids---đấu-thầu-báo-giá-b2b-rfq)
27. [`/seller/settings` - Cấu Hình Hạn Ngạch & Công Tắc Mùa Vụ](#27-sellersettings---cấu-hình-hạn-ngạch--công-tắc-mùa-vụ)

### Nhóm 3: Giao Diện Quản Trị Nền Tảng (Platform Admin Screens)
28. [`/admin/dashboard` - Chỉ Số Sàn & Doanh Thu Thuê SaaS](#28-admindashboard---chỉ-số-sàn--doanh-thu-thuê-saas)
29. [`/admin/compliance-review` - Kiểm Duyệt Hồ Sơ ATTP](#29-admincompliance-review---kiểm-duyệt-hồ-sơ-attp)
30. [`/admin/sellers` - Quản Lý Provider & Trạng Thái Gói SaaS](#30-adminsellers---quản-lý-provider--trạng-thái-gói-saas)
31. [`/admin/subscriptions` - Cấu Hình Các Gói Thuê Dịch Vụ SaaS](#31-adminsubscriptions---cấu-hình-các-gói-thuê-dịch-vụ-saas)
32. [`/admin/complaints` - Giám Sát Khiếu Nại & Cảnh Báo Vi Phạm](#32-admincomplaints---giám-sát-khiếu-nại--cảnh-báo-vi-phạm)

---

## 1. `/` - Trang Chủ & Mùa Vụ

### 1.1 Mục Tiêu & URL
- **URL Route**: `/`
- **Vai trò**: Giới thiệu nền tảng bánh Trung Thu, quảng bá thương hiệu xưởng đạt chuẩn ATTP, nút CTA điều hướng nhanh tới công cụ Phối Hộp Quà và Báo giá B2B.

### 1.2 Các Thành Phần Giao Diện (UI Layout Components)
- **Top Announcement Bar**: Thông báo giai đoạn mùa vụ (Early Bird giảm 10-15% / Standard / Rush Peak) kèm ngày Âm lịch tham khảo.
- **Hero Section**: Tiêu đề chào đón, hình ảnh hộp bánh nghệ thuật, 2 nút hành động chính: "Tự Phối Hộp Quà" (`PackagePlus` icon) và "Báo Giá Doanh Nghiệp" (`Building2` icon).
- **VIP Top Banner Carousel**: Khu vực dành cho các Provider đăng ký gói SaaS `VIP_TOP_BANNER` hiển thị bộ sưu tập độc quyền.
- **Cam Kết Chất Lượng & ATTP**: 4 khối cam kết kèm icon SVG (`ShieldCheck`, `Sparkles`, `Clock`, `Truck`): Bánh mới ra lò, 100% xưởng có giấy ATTP, In logo theo yêu cầu, Giao hàng chia đợt.
- **Danh Mục Bánh Bán Chạy**: Danh sách thẻ sản phẩm bánh lẻ và set hộp nổi bật.

### 1.3 Bốn Trạng Thái Giao Diện Bắt Buộc (4 UI States)
- **Loading State**: Skeleton card nhấp nháy (shimmer) cho Banner và danh sách sản phẩm nổi bật.
- **Empty State**: Khi các xưởng đều tạm ngừng nhận đơn (`is_season_active = false`), hiển thị thông báo "Các xưởng bánh đang tạm hoàn tất đơn nướng, vui lòng để lại thông tin để nhận thông báo mở đợt mới." kèm form nhận tin.
- **Success State**: Hiển thị đầy đủ banner động, các bộ sưu tập theo từng gian hàng và thanh điều hướng nhạy bén.
- **Error State**: Banner cảnh báo lỗi kết nối tạm thời kèm nút "Tải lại trang" (`RefreshCw` icon).

---

## 2. `/products` - Khám Phá Bánh Lẻ & Hộp Quà

### 2.1 Mục Tiêu & URL
- **URL Route**: `/products`
- **Vai trò**: Bộ lọc nâng cao và danh mục tất cả biến thể bánh Trung Thu lẻ và hộp quà từ các thương hiệu đã kiểm duyệt.

### 2.2 Các Thành Phần Giao Diện (UI Layout Components)
- **Bộ Lọc Phân Loại**: Filter tabs (`All`, `Bánh Nướng`, `Bánh Dẻo`, `Hộp Quà Set`, `Bánh Ăn Kiêng/Chay`).
- **Bộ Lọc Thuộc Tính**: Chọn mức trọng lượng (150g, 200g, 250g), khoảng giá, thương hiệu xưởng sản xuất.
- **Lưới Sản Phẩm (Product Grid)**: Thẻ sản phẩm hiển thị ảnh, tên biến thể, tên xưởng (kèm badge `ShieldCheck` đã duyệt ATTP), giá tiền, HSD bánh tươi (7-15 ngày), nút "Thêm vào giỏ" (`ShoppingCart` icon).

### 2.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Lưới 8 khối Skeleton card với thanh giả lập loading.
- **Empty State**: Icon `SearchX`, dòng chữ "Không tìm thấy sản phẩm phù hợp với bộ lọc", nút "Đặt lại bộ lọc" (`RotateCcw` icon).
- **Success State**: Danh sách sản phẩm phân trang hoặc infinite scroll mượt mà.
- **Error State**: Khối thông báo lỗi tải dữ liệu từ máy chủ kèm nút thử lại.

---

## 3. `/products/:id` - Chi Tiết Sản Phẩm & Biến Thể

### 3.1 Mục Tiêu & URL
- **URL Route**: `/products/:id`
- **Vai trò**: Hiển thị chi tiết thành phần bánh, khuyến cáo bảo quản, chọn trọng lượng biến thể và bảng giá dynamic.

### 3.2 Các Thành Phần Giao Diện (UI Layout Components)
- **Album Ảnh Sản Phẩm**: Slider ảnh chính và các thumbnail góc chụp bánh.
- **Thông Tin Thương Hiệu & Giấy Phép**: Tên xưởng sản xuất, link xem bản công bố ATTP của vị bánh.
- **Bộ Chọn Biến Thể (Variant Selector)**: Chọn trọng lượng (150g / 200g / 250g), số lượng.
- **Khối Cảnh Báo HSD Bánh Tươi**: Badge màu ấm kèm thông báo: "Bánh tươi handmade không chất bảo quản - HSD: 10-15 ngày kể từ ngày nướng. Xưởng sẽ nướng trước 24h giao hàng."
- **Nút Hành Động**: "Mua ngay" và "Thêm vào giỏ hàng".

### 3.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton hiển thị khung ảnh lớn bên trái và các dòng văn bản giả lập bên phải.
- **Empty State**: Icon `PackageOpen`, thông báo "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh", nút "Quay lại danh mục".
- **Success State**: Hiển thị đầy đủ thông số, cập nhật giá tức thì khi bấm chuyển đổi giữa các trọng lượng biến thể.
- **Error State**: Thông báo lỗi kết nối máy chủ khi truy xuất chi tiết SKU.

---

## 4. `/custom-box` - Phối Hộp Quà & Live Preview CSS 60fps

### 4.1 Mục Tiêu & URL
- **URL Route**: `/custom-box`
- **Vai trò**: Trình tương tác trực quan cho phép người mua chọn vỏ hộp (Set 2, 4, 6), nhặt vị bánh vào ô slot, gõ tên in vỏ hộp và xem trước trực tiếp 60fps.

### 4.2 Các Thành Phần Giao Diện (UI Layout Components)
- **Khu Vực Xem Trước (Live Preview Stage)**:
  - Khung phôi ảnh vỏ hộp PNG.
  - Lớp phủ chữ CSS Absolute Overlay: font thư pháp/hiện đại, căn giữa tự động, phản hồi tức thời gõ phím.
  - Vị trí các ô slot bánh bên trong hộp (hiển thị ảnh bánh đã được thả vào).
- **Thanh Chọn Dung Tích Hộp**: Nút chọn Set 2 bánh, Set 4 bánh, Set 6 bánh.
- **Bảng Chọn Vị Bánh Ghép Ô**: Danh sách các vị bánh lẻ còn hàng. Vị bánh hết hàng bị làm mờ kèm nhãn "Hết hàng" (`Ban` icon).
- **Form Tùy Biến Cá Nhân**:
  - Ô nhập: "Tên cá nhân/Doanh nghiệp in vỏ hộp" (tối đa 50 ký tự, bộ đếm ngược ký tự).
  - Ô nhập: "Nội dung thiệp chúc" (tối đa 150 ký tự).
- **Thanh Tổng Tiền Cố Định Chân Trang (Sticky Summary Bar)**:
  - Hiển thị tiến độ: "Đã chọn 3/4 ô slot".
  - Chi tiết giá: Tiền vỏ hộp + Tiền các vị bánh + Phí in (nếu có).
  - Nút "Thêm Hộp Quà Vào Giỏ" (`CheckCircle2` icon, chỉ sáng khi đã đủ 100% slot).

### 4.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Spinner tải thư viện ảnh phôi và danh mục bánh lẻ.
- **Empty State**: Nếu xưởng tạm hết vỏ hộp, hiển thị cảnh báo "Hiện các loại vỏ hộp đang được sản xuất thêm, vui lòng quay lại sau" kèm nút đăng ký nhận thông báo.
- **Success State**: Môi trường kéo thả/chọn vị bánh mượt mà, gõ chữ đến đâu preview cập nhật tức thì 60fps đến đó.
- **Error State**: Cảnh báo lỗi validate khi nhập ký tự HTML độc hại hoặc vượt quá độ dài quy định.

---

## 5. `/b2b-rfq` - Gửi Yêu Cầu Báo Giá Doanh Nghiệp

### 5.1 Mục Tiêu & URL
- **URL Route**: `/b2b-rfq`
- **Vai trò**: Form tiếp nhận đơn hàng sỉ ($\ge 20$ hộp) dành cho các phòng ban Nhân sự/Thu mua của doanh nghiệp.

### 5.2 Các Thành Phần Giao Diện (UI Layout Components)
- **Thông Tin Doanh Nghiệp**: Ô nhập Tên công ty, Mã số thuế, Họ tên người phụ trách, Chức vụ, Email nhận báo giá, Số điện thoại.
- **Quy Mô Đơn Hàng**: Số lượng hộp dự kiến ($\ge 20$), Mức ngân sách dự trù (VNĐ/hộp hoặc tổng gói).
- **Khu Vực Đăng Ký Đợt Giao Bánh Tươi**:
  - Nút "Thêm đợt giao hàng" (`Plus` icon).
  - Từng đợt giao: Ô chọn Ngày nhận Dương lịch (kèm nhãn Âm lịch tham khảo), Số lượng hộp giao đợt đó, Địa điểm nhận (các chi nhánh khác nhau).
- **Tải Lên Logo Doanh Nghiệp**: Khu vực kéo thả file logo (hỗ trợ PNG, SVG, AI, PDF $\le 10\text{MB}$) để các Provider lên market mẫu.
- **Cam Kết Bảo Mật**: Thông tin RFQ được gửi kín tới các Provider đạt kiểm duyệt ATTP.

### 5.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Nút submit hiển thị spinner "Đang khởi tạo mã RFQ và tải lên logo...".
- **Empty State**: Form mặc định sẵn sàng nhập liệu với 1 đợt giao hàng cơ sở.
- **Success State**: Modal chúc mừng hiển thị mã `RFQ-YYYYMMDD-XXXX` kèm liên kết dẫn đến Portal theo dõi báo giá.
- **Error State**: Báo lỗi chi tiết từng trường nếu số lượng $< 20$, sai định dạng mã số thuế hoặc file logo quá dung lượng.

---

## 6. `/b2b-portal/rfqs` - Danh Sách Yêu Cầu B2B Đã Gửi

### 6.1 Mục Tiêu & URL
- **URL Route**: `/b2b-portal/rfqs`
- **Vai trò**: Khách doanh nghiệp theo dõi các RFQ mình đã phát hành và số lượng báo giá nhận được từ các xưởng.

### 6.2 Các Thành Phần Giao Diện
- **Bảng Danh Sách RFQ**: Các cột Mã RFQ, Ngày tạo, Tổng số lượng, Số đợt giao, Số báo giá đã nộp (`provider_quotations`), Trạng thái (`OPEN`, `DISTRIBUTED`, `WON`, `CLOSED`).
- **Nút Hành Động**: "Xem và so sánh báo giá" (`ArrowRight` icon).

### 6.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Bảng dữ liệu Skeleton shimmer 4 dòng.
- **Empty State**: Icon `Inbox`, dòng chữ "Quý doanh nghiệp chưa gửi yêu cầu báo giá nào", nút "Tạo yêu cầu RFQ mới".
- **Success State**: Bảng hiển thị danh sách đầy đủ, badge trạng thái trực quan.
- **Error State**: Thông báo không thể tải danh sách RFQ kèm nút tải lại.

---

## 7. `/b2b-portal/rfqs/:rfqId/compare` - So Sánh Báo Giá Đa Provider

### 7.1 Mục Tiêu & URL
- **URL Route**: `/b2b-portal/rfqs/:rfqId/compare`
- **Vai trò**: Bảng ma trận so sánh các báo giá cạnh tranh từ nhiều Provider khác nhau gửi về cho 1 mã RFQ.

### 7.2 Các Thành Phần Giao Diện
- **Header Tóm Tắt RFQ**: Mã RFQ, Số lượng đặt, Tiến độ các đợt giao bánh tươi.
- **Ma Trận So Sánh Báo Giá (Comparison Matrix)**:
  - Cột ứng với từng Provider: Tên thương hiệu xưởng, Badge ATTP, Đơn giá/hộp, Tỷ lệ chiết khấu, Phí vận chuyển, Ưu đãi (tặng hộp mẫu, in logo miễn phí), Hạn chót báo giá (`valid_until`).
- **Nút Quyết Định**: Nút "Chấp Nhận Báo Giá Này" (`Check` icon) ở chân mỗi cột Provider.

### 7.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton hiển thị 3 cột so sánh đang tải.
- **Empty State**: Icon `Clock`, thông báo "Chưa có Provider nào gửi báo giá. Hệ thống đã phân phối tới các xưởng, vui lòng quay lại sau ít giờ."
- **Success State**: Bảng so sánh sắc nét, đánh dấu nổi bật báo giá có mức giá cạnh tranh nhất.
- **Error State**: Báo lỗi khi phiên làm việc hết hạn hoặc RFQ không thuộc quyền sở hữu của doanh nghiệp.

---

## 8. `/cart` - Giỏ Hàng & Tách Đợt Giao Hàng Bánh Tươi

### 8.1 Mục Tiêu & URL
- **URL Route**: `/cart`
- **Vai trò**: Quản lý các hộp bánh custom và bánh lẻ đã chọn, thiết lập chia tách đơn hàng thành các đợt giao bánh tươi theo ngày mong muốn.

### 8.2 Các Thành Phần Giao Diện
- **Danh Sách Hộp Quà / Bánh Lẻ**: Ảnh phôi, chi tiết các vị bánh bên trong, chữ in vỏ hộp, đơn giá, số lượng.
- **Phân Bổ Đợt Giao Hàng (Batch Allocation Box)**:
  - Tùy chọn: "Giao tất cả trong 1 đợt" hoặc "Chia thành nhiều đợt giao bánh tươi ra lò".
  - Danh sách đợt: Chọn ngày nhận cho từng nhóm sản phẩm (ràng buộc $\ge \text{Ngày đặt} + 3$).
- **Bảng Tính Giá Chi Tiết**: Tổng tiền hàng, Phí giao gấp (nếu $< 3$ ngày), Phí chia nhiều đợt giao (+30.000đ/đợt phát sinh), Tạm tính.
- **Nút Tiến Hành Đặt Hàng**: Nút CTA chuyển sang bước Checkout (`ArrowRight` icon).

### 8.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton card sản phẩm trong giỏ.
- **Empty State**: Icon `ShoppingBag`, thông báo "Giỏ hàng của bạn đang trống", nút "Khám phá bánh Trung Thu ngay".
- **Success State**: Hiển thị đầy đủ danh sách, bộ đếm số lượng phản hồi tức thì.
- **Error State**: Cảnh báo một vị bánh trong giỏ vừa hết hàng tại xưởng, yêu cầu đổi vị khác.

---

## 9. `/checkout` - Thanh Toán Đặt Cọc, Lịch Nhận & Hóa Đơn VAT

### 9.1 Mục Tiêu & URL
- **URL Route**: `/checkout`
- **Vai trò**: Nhập thông tin người nhận, xác nhận thanh toán cọc $\ge 50\%$, và đăng ký xuất hóa đơn VAT điện tử.

### 9.2 Các Thành Phần Giao Diện
- **Thông Tin Giao Hàng**: Họ tên người nhận, SĐT, Địa chỉ chi tiết từng đợt giao.
- **Cơ Chế Thanh Toán Đặt Cọc**:
  - Thông báo quy định: "Đơn hàng có in tên riêng/trên 2.000.000đ bắt buộc đặt cọc tối thiểu 50%".
  - Lựa chọn: "Thanh toán Cọc 50%" hoặc "Thanh toán toàn bộ 100%".
- **Phương Thức Thanh Toán**: Quét mã VietQR chuyển khoản trực tiếp cho xưởng hoặc Thẻ ngân hàng.
- **Mục Xuất Hóa Đơn VAT**: Checkbox "Yêu cầu hóa đơn VAT Doanh Nghiệp" mở rộng các ô: Mã số thuế, Tên công ty, Email nhận hóa đơn.
- **Nút Chốt Đơn**: "Xác nhận đặt hàng & Thanh toán cọc".

### 9.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Spinner toàn trang khi validate tồn kho 2 cấp lần cuối.
- **Empty State**: Tự động chuyển hướng về `/cart` nếu không có sản phẩm hợp lệ.
- **Success State**: Form mượt mà, tính toán chính xác số tiền cọc 50% cần thanh toán.
- **Error State**: Cảnh báo nếu ngày nhận bánh đã kín hạn ngạch xưởng trong lúc khách đang điền form.

---

## 10. `/order-success/:orderId` - Xác Nhận Đơn Hàng & Hướng Dẫn VietQR

### 10.1 Mục Tiêu & URL
- **URL Route**: `/order-success/:orderId`
- **Vai trò**: Cung cấp mã VietQR động trực tiếp tới tài khoản xưởng sản xuất và mã theo dõi đơn hàng.

### 10.2 Các Thành Phần Giao Diện
- **Card Chúc Mừng**: Icon SVG `CheckCircle2` lớn màu xanh ngọc, thông báo "Đặt hàng thành công!".
- **Khối Quét Mã VietQR**: Mã QR tạo động với đúng số tiền cọc 50% và nội dung chuyển khoản `COC [OrderID]`.
- **Thông Tin Đợt Giao Hàng**: Hiển thị lịch nướng bánh dự kiến và ngày giao theo Dương lịch (kèm Âm lịch tham khảo).
- **Nút Điều Hướng**: "Theo dõi đơn hàng" và "Về trang chủ".

### 10.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Khung Skeleton chờ tải thông tin QR và tài khoản Provider.
- **Empty State**: Hiển thị lỗi nếu `orderId` không hợp lệ.
- **Success State**: Mã VietQR hiển thị sắc nét kèm đồng hồ đếm ngược 15 phút giữ chỗ hạn ngạch nướng.
- **Error State**: Nút tải lại thông tin thanh toán khi mất kết nối mạng.

---

## 11. `/order-tracking` - Tra Cứu Đơn Hàng Qua SĐT/Mã Đơn

### 11.1 Mục Tiêu & URL
- **URL Route**: `/order-tracking`
- **Vai trò**: Cho phép người mua tra cứu nhanh tình trạng đơn hàng mà không bắt buộc đăng nhập tài khoản.

### 11.2 Các Thành Phần Giao Diện
- **Form Tra Cứu**: Ô nhập Mã đơn hàng (`ORD-...`) và Số điện thoại đặt hàng.
- **Nút Tra Cứu**: Nút "Kiểm tra tiến độ đơn hàng" (`Search` icon).

### 11.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Spinner biểu tượng tìm kiếm trong nút.
- **Empty State**: Form rỗng ban đầu kèm hướng dẫn tìm mã đơn trong email/SMS xác nhận.
- **Success State**: Tự động chuyển hướng sang `/order-tracking/:orderId`.
- **Error State**: Thông báo inline đỏ: "Không tìm thấy đơn hàng tương ứng với thông tin đã nhập."

---

## 12. `/order-tracking/:orderId` - Tiến Độ Ra Lò & Khiếu Nại 24h

### 12.1 Mục Tiêu & URL
- **URL Route**: `/order-tracking/:orderId`
- **Vai trò**: Xem dòng thời gian sản xuất bánh tươi của từng đợt giao và gửi khiếu nại trong vòng 24h nếu có sự cố.

### 12.2 Các Thành Phần Giao Diện
- **Thanh Tiến Độ Ra Lò Bánh Tươi**:
  - Bước 1: Đã xác nhận cọc (`CreditCard`).
  - Bước 2: Đang xếp lịch nướng (`CalendarClock`).
  - Bước 3: Đang ra lò & đóng hộp (`Flame`).
  - Bước 4: Đang vận chuyển (`Truck`).
  - Bước 5: Đã giao thành công (`PackageCheck`).
- **Khối Khiếu Nại 24h (Perishable Dispute Window)**:
  - Xuất hiện trong vòng 24h sau khi đơn chuyển sang `DELIVERED`.
  - Form khiếu nại: Chọn loại lỗi (In sai tên, Bánh mốc hỏng, Sai vị), Tải video unboxing hoặc ảnh cận cảnh lỗi.
  - Chính sách ghi chú: "Áp dụng chính sách Hoàn tiền/Đổi mới giữ nguyên hàng cũ theo quy định ATTP."

### 12.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Timeline dạng Skeleton xám.
- **Empty State**: Thông báo đơn hàng không tồn tại.
- **Success State**: Timeline rõ ràng theo từng đợt giao nhỏ (`order_batches`).
- **Error State**: Thông báo khi cố tình gửi khiếu nại quá thời hạn 24 giờ quy định.

---

## 13. `/compliance` - Hồ Sơ Pháp Lý & Chứng Nhận ATTP

### 13.1 Mục Tiêu & URL
- **URL Route**: `/compliance`
- **Vai trò**: Trang minh bạch năng lực pháp lý toàn bộ các xưởng bánh tham gia nền tảng.

### 13.2 Các Thành Phần Giao Diện
- **Danh Sách Các Xưởng Sản Xuất**: Tên xưởng, Số hiệu Giấy chứng nhận ATTP, Cơ quan cấp, Ngày cấp.
- **Khu Vực Tải Về (Food Safety Kit)**: Nút tải file PDF Giấy chứng nhận ATTP, Bản tự công bố từng vị bánh, Hợp đồng nguyên tắc B2B mẫu.

### 13.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Lưới Skeleton danh sách xưởng.
- **Empty State**: Dòng thông báo xưởng đang trong quá trình cập nhật hồ sơ mới.
- **Success State**: Xem trước tài liệu và nút tải PDF trực tiếp.
- **Error State**: Báo lỗi tải file tài liệu đính kèm.

---

## 14. `/auth/login` - Đăng Nhập Hệ Thống

### 14.1 Mục Tiêu & URL
- **URL Route**: `/auth/login`
- **Vai trò**: Đăng nhập bằng Email & Mật khẩu cho Khách hàng, Nhà bán hàng hoặc Admin.

### 14.2 Các Thành Phần Giao Diện
- **Form Đăng Nhập**: Ô nhập Email (`Mail` icon), Ô nhập Mật khẩu (`Lock` icon), Nút ẩn/hiện mật khẩu (`Eye`/`EyeOff`), Nút "Quên mật khẩu", Nút "Đăng nhập".
- **Liên Kết Chuyển Đổi**: "Chưa có tài khoản? Đăng ký ngay".

### 14.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Nút đăng nhập hiển thị spinner vô hiệu hóa click.
- **Empty State**: Form trắng sạch sẽ với focus tự động vào ô Email.
- **Success State**: Chuyển hướng người dùng về trang đích trước đó hoặc Dashboard tương ứng.
- **Error State**: Alert màu đỏ: "Email hoặc mật khẩu không chính xác."

---

## 15. `/auth/register` - Đăng Ký Tài Khoản

### 15.1 Mục Tiêu & URL
- **URL Route**: `/auth/register`
- **Vai trò**: Đăng ký tài khoản Người mua hoặc Gian hàng Nhà sản xuất bánh.

### 15.2 Các Thành Phần Giao Diện
- **Lựa Chọn Loại Tài Khoản**: Tab "Người Mua Cá Nhân / Doanh Nghiệp" hoặc "Chủ Xưởng Bánh (Seller)".
- **Form Đăng Ký**: Họ tên, Email, Số điện thoại, Tên xưởng (nếu là Seller), Mật khẩu, Xác nhận mật khẩu.
- **Nút Xác Nhận**: "Tạo tài khoản".

### 15.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Nút đăng ký hiển thị hiệu ứng xoay tròn.
- **Empty State**: Form mặc định sẵn sàng.
- **Success State**: Thông báo tạo tài khoản thành công kèm điều hướng đăng nhập hoặc onboarding.
- **Error State**: Thông báo lỗi trùng lặp Email hoặc mật khẩu không đủ độ mạnh.

---

## 16. `/auth/forgot-password` - Khôi Phục Mật Khẩu

### 16.1 Mục Tiêu & URL
- **URL Route**: `/auth/forgot-password`
- **Vai trò**: Gửi email hướng dẫn thiết lập lại mật khẩu đã quên.

### 16.2 Các Thành Phần Giao Diện
- **Form Khôi Phục**: Ô nhập Email đăng ký, Nút "Gửi liên kết khôi phục".
- **Quay Lại**: Link "Quay lại trang Đăng nhập".

### 16.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Nút gửi hiển thị trạng thái chờ phản hồi API.
- **Empty State**: Form nhập email ban đầu.
- **Success State**: Hộp thông báo xanh: "Liên kết khôi phục đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư."
- **Error State**: Báo lỗi email không tồn tại trong hệ thống.

---

## 17. `/seller/onboarding` - Tải Lên Hồ Sơ ATTP & KYC

### 17.1 Mục Tiêu & URL
- **URL Route**: `/seller/onboarding`
- **Vai trò**: Bước bắt buộc để Seller nộp 3 loại tài liệu pháp lý trước khi được kích hoạt mở bán.

### 17.2 Các Thành Phần Giao Diện
- **3 Khu Vực Tải File Bắt Buộc**:
  1. Giấy chứng nhận Cơ sở đủ điều kiện ATTP (`FileCheck` icon).
  2. Giấy phép ĐKKD / Hộ kinh doanh (`Building` icon).
  3. CCCD / Định danh KYC đại diện pháp luật (`UserCheck` icon).
- **Thông Tin Số Hiệu & Ngày Cấp**: Ô nhập số hiệu giấy chứng nhận, ngày cấp, ngày hết hạn.
- **Nút Nộp Hồ Sơ**: "Gửi hồ sơ kiểm duyệt tới Platform Admin".

### 17.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Thanh tiến trình hiển thị phần trăm upload từng file.
- **Empty State**: Các ô upload tài liệu đang chờ chọn file.
- **Success State**: Badge màu vàng "Đang chờ Admin xét duyệt" kèm thời gian nộp.
- **Error State**: Báo lỗi file không đúng định dạng PDF/PNG hoặc vượt quá 10MB.

---

## 18. `/seller/subscription` - Đăng Ký & Thanh Toán Gói SaaS

### 18.1 Mục Tiêu & URL
- **URL Route**: `/seller/subscription`
- **Vai trò**: Cho phép Seller chọn và thanh toán 1 trong 3 gói dịch vụ SaaS mùa vụ (Standard, VIP Top Banner, Exclusive Pop-up).

### 18.2 Các Thành Phần Giao Diện
- **3 Thẻ Gói Dịch Vụ SaaS (Pricing Cards)**:
  - Gói Tiêu Chuẩn (1.000.000đ/3 tháng - 20 SKU).
  - Gói VIP Top Banner (3.000.000đ/3 tháng - Không giới hạn SKU, Ưu tiên B2B).
  - Gói Pop-up Độc Quyền (5.000.000đ/tháng cao điểm).
- **Mã VietQR Thanh Toán Trực Tiếp**: Hiển thị QR thanh toán phí thuê về tài khoản Sàn kèm cú pháp `SAAS [Package] [SellerID]`.

### 18.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Spinner kiểm tra trạng thái webhook thanh toán theo thời gian thực.
- **Empty State**: Danh sách các gói hiển thị sẵn sàng cho việc lựa chọn.
- **Success State**: Màn hình thông báo "Gói dịch vụ SaaS đã kích hoạt thành công! Quyền mở bán đã được bật."
- **Error State**: Thông báo lỗi giao dịch hết hạn thanh toán, yêu cầu tạo lại mã QR.

---

## 19. `/seller/dashboard` - Báo Cáo Tổng Quan Gian Hàng

### 19.1 Mục Tiêu & URL
- **URL Route**: `/seller/dashboard`
- **Vai trò**: Bảng điều khiển trung tâm theo dõi doanh thu đơn hàng, số bánh đã đặt trong mùa và công suất lò nướng.

### 19.2 Các Thành Phần Giao Diện
- **4 Thẻ Chỉ Số Cốt Lõi (Metric Cards)**: Tổng doanh thu, Số đơn hàng chờ nướng, Tổng chiếc bánh cần ra lò hôm nay, Tỷ lệ sử dụng hạn ngạch xưởng.
- **Biểu Đồ Xu Hướng**: Biểu đồ sản lượng bánh nướng theo ngày Dương/Âm.
- **Danh Sách Đơn Hàng Mới Nhất**: Bảng các đơn vừa đặt cọc thành công cần xử lý.

### 19.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton card cho các khối chỉ số và biểu đồ.
- **Empty State**: Thông báo gian hàng mới kích hoạt, hướng dẫn thiết lập danh mục sản phẩm đầu tiên.
- **Success State**: Các biểu đồ và chỉ số hiển thị sống động, cập nhật tự động.
- **Error State**: Báo lỗi không thể kết nối tới dịch vụ phân tích dữ liệu.

---

## 20. `/seller/products` - Quản Lý Dòng Sản Phẩm & SKU

### 20.1 Mục Tiêu & URL
- **URL Route**: `/seller/products`
- **Vai trò**: Quản lý danh mục các biến thể bánh lẻ, vỏ hộp, thiệp chúc và tồn kho thực tế.

### 20.2 Các Thành Phần Giao Diện
- **Thanh Công Cụ**: Nút "Thêm biến thể mới" (`Plus` icon), Ô tìm kiếm theo tên vị bánh/SKU, Bộ lọc theo loại (`LOOSE_CAKE`, `BOX_SHELL`, v.v.).
- **Bảng Dữ Liệu Sản Phẩm**: Cột Ảnh, Tên dòng sản phẩm, Mã SKU biến thể, Trọng lượng, Đơn giá, Tồn kho hiện tại, Trạng thái (Còn hàng / Hết hàng / Ẩn).
- **Cột Thao Tác**: Nút Sửa (`Edit` icon), Nút Tạm ẩn (`EyeOff` icon).

### 20.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Bảng Skeleton shimmer.
- **Empty State**: Icon `PackagePlus`, thông báo "Chưa có sản phẩm nào được niêm yết", nút "Thêm sản phẩm đầu tiên".
- **Success State**: Bảng hiển thị đầy đủ, cho phép chỉnh sửa nhanh số lượng tồn kho inline.
- **Error State**: Thông báo lỗi cập nhật tồn kho từ server.

---

## 21. `/seller/products/new` - Thêm Mới Dòng Sản Phẩm & Biến Thể

### 21.1 Mục Tiêu & URL
- **URL Route**: `/seller/products/new`
- **Vai trò**: Form tạo mới dòng sản phẩm gốc và các biến thể SKU đi kèm.

### 21.2 Các Thành Phần Giao Diện
- **Thông Tin Gốc**: Chọn Loại (`Bánh lẻ`, `Vỏ hộp`, `Thiệp chúc`), Tên dòng sản phẩm, Mô tả.
- **Danh Sách Biến Thể (Variant Matrix)**:
  - Bánh lẻ: Thêm biến thể 150g, 200g, 250g kèm đơn giá và số lượng kho ban đầu.
  - Vỏ hộp: Thêm biến thể Set 2, Set 4, Set 6.
- **Album Ảnh**: Kéo thả ảnh đại diện và ảnh chi tiết.
- **Nút Lưu**: "Xuất bản sản phẩm".

### 21.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Spinner vô hiệu hóa nút submit khi đang tải ảnh lên CDN.
- **Empty State**: Form trắng sẵn sàng nhập liệu.
- **Success State**: Toast thông báo tạo thành công và chuyển hướng về danh sách sản phẩm.
- **Error State**: Cảnh báo vượt quá giới hạn SKU của gói SaaS hiện tại (ví dụ: quá 20 SKU của gói Standard).

---

## 22. `/seller/products/:id/edit` - Cập Nhật Biến Thể & Kho Hàng

### 22.1 Mục Tiêu & URL
- **URL Route**: `/seller/products/:id/edit`
- **Vai trò**: Chỉnh sửa thông tin đơn giá, bổ sung tồn kho hoặc thay đổi ảnh phôi vỏ hộp.

### 22.2 Các Thành Phần Giao Diện
- Tương tự màn hình tạo mới nhưng dữ liệu cũ được điền sẵn (pre-filled).
- Nút "Cập nhật thay đổi" và "Xóa sản phẩm".

### 22.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton hiển thị form đang tải dữ liệu cũ.
- **Empty State**: Báo lỗi nếu sản phẩm không tồn tại hoặc không thuộc quyền sở hữu của Seller.
- **Success State**: Lưu thành công cập nhật tức thì trên sàn.
- **Error State**: Báo lỗi trùng mã SKU hoặc giá trị không hợp lệ.

---

## 23. `/seller/calendar` - Lịch Sản Xuất Song Lịch Âm/Dương

### 23.1 Mục Tiêu & URL
- **URL Route**: `/seller/calendar`
- **Vai trò**: Dashboard lịch nướng bánh hiển thị song song ngày Dương và ngày Âm lịch, xem mật độ đơn hàng từng ngày.

### 23.2 Các Thành Phần Giao Diện
- **Header Lịch**: Nút chuyển tháng, chuyển tuần, nút gạt xem theo Dương Lịch / Âm Lịch.
- **Lưới Lịch Tháng (Calendar Grid)**:
  - Mỗi ô ngày hiển thị: Số ngày Dương to rõ, Số ngày Âm nhỏ hơn bên dưới (VD: `15/8 AL`).
  - Thanh tiến độ công suất: Tỷ lệ bánh đã đặt / Hạn ngạch (VD: `420/500 bánh`).
  - Màu sắc cảnh báo: Xanh (dưới 70%), Vàng (70-95%), Đỏ (Đã đầy 100% - Đã khóa nhận đơn).
- **Bảng Chi Tiết Ngày Được Chọn**: Danh sách đơn B2C và đợt giao B2B cần trả bánh trong ngày đó.

### 23.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Lưới lịch mờ dần với spinner ở trung tâm.
- **Empty State**: Ngày được chọn không có đơn đặt bánh nào, hiển thị nhãn "Trống lịch nướng".
- **Success State**: Lịch tương tác nhạy bén, bấm vào ngày nào tải nhanh chi tiết ngày đó.
- **Error State**: Báo lỗi tính toán ngày âm lịch hoặc mất kết nối API.

---

## 24. `/seller/daily-sheet` - Phiếu Ra Lò Bánh Tươi & Bản In Xưởng

### 24.1 Mục Tiêu & URL
- **URL Route**: `/seller/daily-sheet`
- **Vai trò**: Tự động gom toàn bộ các đơn trong ngày thành bảng tổng hợp số lượng từng vị bánh để in giao cho thợ làm bánh tại xưởng.

### 24.2 Các Thành Phần Giao Diện
- **Bộ Lọc Ngày Ra Lò**: Chọn ngày Dương lịch (kèm nhãn Âm lịch).
- **Bảng Tổng Hợp Vị Bánh (Daily Bake Matrix)**:
  - Cột Vị bánh (Thập cẩm gà quay, Đậu xanh trứng muối, Hạt sen, v.v.).
  - Cột Số lượng bánh lẻ trực tiếp.
  - Cột Số lượng bánh nằm trong các Hộp quà Custom B2C.
  - Cột Số lượng bánh trong các đợt giao sỉ B2B.
  - Cột **TỔNG SỐ CHIẾC BÁNH CẦN NƯỚNG**.
- **Nút In Ấn Xưởng**: Nút "In Phiếu Sản Xuất" (`Printer` icon) tối ưu hóa định dạng giấy in A4 không chứa các phần tử web thừa.

### 24.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton bảng ma trận vị bánh.
- **Empty State**: Icon `CalendarX`, thông báo "Ngày này xưởng không có lịch nướng bánh nào".
- **Success State**: Bảng tính toán tổng số chiếc chính xác 100%, sẵn sàng in ngay.
- **Error State**: Thông báo lỗi khi gom dữ liệu đơn hàng.

---

## 25. `/seller/orders` - Quản Lý Đơn Hàng & Đợt Giao

### 25.1 Mục Tiêu & URL
- **URL Route**: `/seller/orders`
- **Vai trò**: Quản lý chi tiết từng đơn hàng, trạng thái cọc, nội dung in vỏ hộp và cập nhật tiến độ đợt giao.

### 25.2 Các Thành Phần Giao Diện
- **Tabs Trạng Thái Đơn**: `Tất cả`, `Chờ cọc`, `Đã cọc 50%`, `Đang nướng bánh`, `Đang giao`, `Hoàn thành`, `Khiếu nại`.
- **Bảng Đơn Hàng**: Mã đơn, Tên người mua, SĐT, Số đợt giao (`order_batches`), Ngày giao dự kiến, Chữ in vỏ hộp, Tổng tiền, Số tiền đã cọc.
- **Hành Động Đơn**: Nút "Xác nhận đã nướng xong", Nút "Bàn giao vận chuyển".

### 25.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton shimmer danh sách đơn hàng.
- **Empty State**: Icon `ClipboardList`, thông báo "Chưa có đơn hàng nào trong mục này".
- **Success State**: Danh sách hiển thị chi tiết, lọc theo ngày giao mượt mà.
- **Error State**: Báo lỗi khi cập nhật trạng thái đơn hàng thất bại.

---

## 26. `/seller/b2b-bids` - Đấu Thầu Báo Giá B2B RFQ

### 26.1 Mục Tiêu & URL
- **URL Route**: `/seller/b2b-bids`
- **Vai trò**: Xem các yêu cầu báo giá doanh nghiệp được phân phối tới xưởng và nộp báo giá cạnh tranh.

### 26.2 Các Thành Phần Giao Diện
- **Danh Sách RFQ Được Phân Phối**: Mã RFQ, Tên doanh nghiệp (ẩn một phần), Tổng số lượng hộp, Lịch các đợt giao bánh, Logo đính kèm, Ngân sách dự kiến.
- **Form Soạn Báo Giá (Quotation Builder)**:
  - Đơn giá cho từng biến thể SKU.
  - Tỷ lệ chiết khấu thương mại (%).
  - Thời hạn hiệu lực báo giá (`valid_until`).
  - Chính sách ưu đãi kèm theo (hỗ trợ in logo, tặng mẫu thử).
- **Nút Nộp Báo Giá**: "Nộp Báo Giá Kín Tới Doanh Nghiệp".

### 26.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton hiển thị danh sách RFQ.
- **Empty State**: Icon `Inbox`, thông báo "Hiện chưa có yêu cầu báo giá B2B mới nào phù hợp với năng lực xưởng".
- **Success State**: Nộp báo giá thành công, hiển thị badge "Đã nộp báo giá - Đang chờ khách chốt thầu".
- **Error State**: Cảnh báo nếu hạn ngạch xưởng vào các ngày đợt giao của RFQ đã bị quá tải.

---

## 27. `/seller/settings` - Cấu Hình Hạn Ngạch & Công Tắc Mùa Vụ

### 27.1 Mục Tiêu & URL
- **URL Route**: `/seller/settings`
- **Vai trò**: Cài đặt hạn ngạch nướng bánh tối đa hàng ngày (Capacity Cap) và công tắc Bật/Tạm dừng mùa vụ thủ công.

### 27.2 Các Thành Phần Giao Diện
- **Công Tắc Mùa Vụ Thủ Công**: Toggle Switch "Nhận Đơn Mùa Vụ Trung Thu" (`is_season_active`), kèm mô tả: "Khi tạm ngừng, gian hàng sẽ không nhận đơn mới nhưng vẫn xử lý các đơn đã cọc".
- **Cấu Hình Hạn Ngạch Nướng Mặc Định**: Ô nhập số bánh tối đa xưởng có thể nướng trong 1 ngày (VD: 500 bánh/ngày).
- **Ngoại Lệ Hạn Ngạch Theo Ngày Cụ Thể**: Bảng thêm hạn ngạch đặc biệt cho các ngày cao điểm (VD: 12-14/8 Âm lịch tăng ca lên 800 bánh/ngày).
- **Nút Lưu Cấu Hình**: "Lưu Cài Đặt".

### 27.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Form mờ kèm hiệu ứng lưu.
- **Empty State**: Hiển thị giá trị cấu hình hiện tại.
- **Success State**: Toast thông báo "Đã cập nhật cấu hình hạn ngạch và trạng thái mùa vụ thành công".
- **Error State**: Báo lỗi giá trị hạn ngạch phải là số nguyên dương $\ge 50$.

---

## 28. `/admin/dashboard` - Chỉ Số Sàn & Doanh Thu Thuê SaaS

### 28.1 Mục Tiêu & URL
- **URL Route**: `/admin/dashboard`
- **Vai trò**: Dành cho Quản trị Sàn theo dõi tổng số xưởng hoạt động, doanh thu phí thuê SaaS và các chỉ số toàn hệ thống.

### 28.2 Các Thành Phần Giao Diện
- **Chỉ Số Doanh Thu SaaS**: Tổng tiền thu từ các gói SaaS Provider (Standard, VIP Top Banner, Pop-up).
- **Thống Kê Xưởng Hoạt Động**: Tổng số Seller, số Seller đã duyệt ATTP, số Seller đang tạm dừng.
- **Biểu Đồ Tăng Trưởng**: Doanh thu gói SaaS theo từng tuần của mùa vụ.

### 28.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton card cho biểu đồ và chỉ số.
- **Empty State**: Dữ liệu khởi đầu mùa vụ.
- **Success State**: Các khối số liệu hiển thị trực quan.
- **Error State**: Thông báo lỗi kết nối cơ sở dữ liệu phân tích.

---

## 29. `/admin/compliance-review` - Kiểm Duyệt Hồ Sơ ATTP

### 29.1 Mục Tiêu & URL
- **URL Route**: `/admin/compliance-review`
- **Vai trò**: Duyệt hồ sơ pháp lý An toàn thực phẩm, Giấy phép ĐKKD và CCCD của các Seller đăng ký mở bán.

### 29.2 Các Thành Phần Giao Diện
- **Danh Sách Hồ Sơ Chờ Duyệt (`PENDING`)**: Tên xưởng, Người đại diện, Loại tài liệu, Số hiệu, File đính kèm.
- **Cửa Sổ Xem Trực Tiếp File**: Xem trước file PDF/ảnh chứng nhận ATTP và GPKD.
- **Nút Phê Duyệt**: Nút "Duyệt hợp lệ" (`Check` icon) và "Từ chối" (`X` icon kèm ô nhập lý do từ chối).

### 29.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton hiển thị danh sách hồ sơ.
- **Empty State**: Icon `CheckCheck`, thông báo "Tuyệt vời! Không còn hồ sơ nào đang chờ duyệt."
- **Success State**: Thao tác duyệt tức thì, tự động cập nhật cờ `is_compliance_approved` cho Seller.
- **Error State**: Báo lỗi khi từ chối mà quên nhập lý do từ chối.

---

## 30. `/admin/sellers` - Quản Lý Provider & Trạng Thái Gói SaaS

### 30.1 Mục Tiêu & URL
- **URL Route**: `/admin/sellers`
- **Vai trò**: Quản lý toàn bộ danh sách xưởng bánh trên sàn, kiểm tra thời hạn gói SaaS và xử lý khóa tài khoản nếu vi phạm.

### 30.2 Các Thành Phần Giao Diện
- **Bảng Quản Lý Seller**: Tên xưởng, Email, SĐT, Tình trạng ATTP, Tên gói SaaS đang dùng, Ngày hết hạn gói SaaS, Trạng thái (`ACTIVE`, `SUSPENDED`).
- **Nút Thao Tác**: Xem chi tiết, Gia hạn thủ công, Tạm khóa gian hàng (`Lock` icon).

### 30.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton bảng Provider.
- **Empty State**: Không có Seller nào thỏa mãn bộ lọc tìm kiếm.
- **Success State**: Bảng hiển thị đầy đủ thông tin, tìm kiếm theo tên xưởng nhanh chóng.
- **Error State**: Báo lỗi cập nhật trạng thái Provider.

---

## 31. `/admin/subscriptions` - Cấu Hình Các Gói Thuê Dịch Vụ SaaS

### 31.1 Mục Tiêu & URL
- **URL Route**: `/admin/subscriptions`
- **Vai trò**: Cấu hình mức giá thuê gói SaaS và quyền lợi đi kèm cho từng mùa vụ.

### 31.2 Các Thành Phần Giao Diện
- **Danh Sách Gói SaaS**:
  - Gói Standard: Phí thuê, giới hạn SKU (20 SKU), thời hạn (90 ngày).
  - Gói VIP Top Banner: Phí thuê, vị trí ưu tiên banner.
  - Gói Pop-up Độc Quyền: Phí thuê, thời hạn hiển thị.
- **Form Chỉnh Sửa Phí Thuê**: Thay đổi mức phí và thời hạn hiệu lực của gói.

### 31.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton card cấu hình gói.
- **Empty State**: Hiển thị bảng giá mặc định.
- **Success State**: Cập nhật giá thuê thành công, áp dụng cho các Seller đăng ký mới.
- **Error State**: Báo lỗi mức phí không được để trống hoặc âm.

---

## 32. `/admin/complaints` - Giám Sát Khiếu Nại & Cảnh Báo Vi Phạm

### 32.1 Mục Tiêu & URL
- **URL Route**: `/admin/complaints`
- **Vai trò**: Giám sát các khiếu nại sản phẩm tươi gửi về từ người mua, phát hiện các xưởng có tỷ lệ khiếu nại cao để tạm dừng mở bán.

### 32.2 Các Thành Phần Giao Diện
- **Bảng Khiếu Nại Mới Nhất**: Mã đơn hàng, Tên xưởng bị khiếu nại, Loại sự cố (Bánh hỏng/Sai tên in/Sai vị), Video mở hộp/Ảnh chứng minh, Trạng thái xử lý của xưởng (Đã hoàn tiền/Đã đổi mới/Chưa phản hồi).
- **Chỉ Số Cảnh Báo Xưởng**: Danh sách xưởng có tỷ lệ khiếu nại $> 3\%$ trong tuần.
- **Nút Quyết Định Của Sàn**: Nút "Gửi cảnh báo tới xưởng" và "Tạm dừng quyền mở bán xưởng vi phạm".

### 32.3 Bốn Trạng Thái Giao Diện
- **Loading State**: Skeleton bảng khiếu nại.
- **Empty State**: Icon `ShieldCheck`, thông báo "Hệ thống ghi nhận không có khiếu nại nào chưa xử lý".
- **Success State**: Hiển thị đầy đủ video chứng cứ và dòng thời gian xử lý khiếu nại.
- **Error State**: Báo lỗi khi cập nhật quyết định xử lý khiếu nại.
