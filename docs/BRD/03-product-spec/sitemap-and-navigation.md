# 🗺️ Sitemap & Navigation Design Specification

- **Mã tài liệu**: `SPEC-NAV-01`
- **Dự án**: `Nền Tảng Bán Bánh Trung Thu Trực Tuyến`
- **Phiên bản**: `v1.0.0`
- **Thư mục**: `docs/specs/sitemap-and-navigation.md`

---

## 1. Cấu Trúc Cây Điều Hướng Toàn Hệ Thống (Application Route Taxonomy)

```text
/ (Trang Chủ / Landing Page)
├── /products (Danh Mục Bánh Lẻ & Hộp Quà Có Sẵn)
│   └── /products/:id (Chi Tiết Sản Phẩm & Khuyến Cáo HSD)
├── /custom-box (Công Cụ Phối Hộp Quà Tùy Chỉnh & Live Preview CSS 60fps)
├── /b2b-rfq (Cổng Gửi Yêu Cầu Báo Giá Doanh Nghiệp >= 20 Hộp)
├── /b2b-portal (Portal Doanh Nghiệp Theo Dõi Báo Giá & Đấu Thầu)
│   ├── /b2b-portal/rfqs (Danh Sách Yêu Cầu Đã Gửi)
│   └── /b2b-portal/rfqs/:rfqId/compare (So Sánh Báo Giá Từ Các Provider)
├── /cart (Giỏ Hàng & Tách Đợt Giao Hàng Bánh Tươi)
├── /checkout (Xác Nhận Đặt Cọc >= 50%, Hóa Đơn VAT & Đợt Giao)
├── /order-success/:orderId (Xác Nhận Đơn Hàng & Hướng Dẫn VietQR)
├── /order-tracking (Tra Cứu Đơn Hàng & Đợt Giao Hàng Bằng Số Điện Thoại/Mã Đơn)
│   └── /order-tracking/:orderId (Chi Tiết Tiến Độ Ra Lò & Khiếu Nại 24h)
├── /compliance (Hồ Sơ Năng Lực, Giấy ATTP & Mẫu Hợp Đồng B2B Của Toàn Bộ Xưởng)
├── /auth
│   ├── /auth/login (Đăng Nhập Đa Vai Trò)
│   ├── /auth/register (Đăng Ký Tài Khoản Khách Hàng / Nhà Bán Hàng)
│   └── /auth/forgot-password (Khôi Phục Mật Khẩu)
│
├── /seller (Khu Vực Quản Trị Dành Cho Provider / Seller)
│   ├── /seller/onboarding (Tải Lên Hồ Sơ Pháp Lý ATTT & KYC)
│   ├── /seller/subscription (Đăng Ký & Thanh Toán Gói SaaS Mùa Vụ)
│   ├── /seller/dashboard (Tổng Quan Doanh Thu & Chỉ Số Hoạt Động)
│   ├── /seller/products (Quản Lý Dòng Sản Phẩm & Biến Thể SKU)
│   │   ├── /seller/products/new (Thêm Mới Biến Thể Bánh Lẻ / Vỏ Hộp)
│   │   └── /seller/products/:id/edit (Chỉnh Sửa Đơn Giá & Tồn Kho)
│   ├── /seller/calendar (Dashboard Lịch Sản Xuất Song Lịch Âm/Dương)
│   ├── /seller/daily-sheet (Phiếu Ra Lò Bánh Tươi Tổng Hợp & In Ấn Xưởng)
│   ├── /seller/orders (Quản Lý Đơn Hàng & Tiến Độ Đợt Giao Bánh)
│   ├── /seller/b2b-bids (Tham Gia Đấu Thầu Nộp Báo Giá RFQ Doanh Nghiệp)
│   └── /seller/settings (Cấu Hình Hạn Ngạch Nướng Bánh & Công Tắc Mùa Vụ)
│
└── /admin (Khu Vực Quản Trị Sàn Trung Gian - Platform Admin)
    ├── /admin/dashboard (Chỉ Số Toàn Sàn & Doanh Thu Thuê SaaS)
    ├── /admin/compliance-review (Kiểm Duyệt Hồ Sơ ATTP & Giấy Phép Seller)
    ├── /admin/sellers (Quản Lý Danh Sách Provider & Tình Trạng Gói Dịch Vụ)
    ├── /admin/subscriptions (Quản Lý Cấu Hình Các Gói Thuê SaaS)
    └── /admin/complaints (Giám Sát Khiếu Nại Bánh Tươi & Xử Lý Cảnh Báo)
```

---

## 2. Bảng Phân Quyền & Route Guard (Access Control Matrix)

| URL Route | Phân Loại Tuyến | Quyền Truy Cập Yêu Cầu | Xử Lý Khi Không Hợp Lệ |
| :--- | :--- | :--- | :--- |
| `/` | Công khai | Mọi người dùng (`ANONYMOUS`) | Cho phép truy cập bình thường |
| `/products/**` | Công khai | Mọi người dùng (`ANONYMOUS`) | Cho phép truy cập bình thường |
| `/custom-box` | Công khai | Mọi người dùng (`ANONYMOUS`) | Cho phép truy cập bình thường |
| `/b2b-rfq` | Công khai | Mọi người dùng (`ANONYMOUS`) | Cho phép gửi form |
| `/b2b-portal/**` | Có bảo vệ | `ROLE_BUYER` (Khách doanh nghiệp) | Chuyển hướng về `/auth/login?redirect=...` |
| `/cart` | Công khai | Khách vãng lai + Đã đăng nhập | Cho phép thao tác lưu giỏ cục bộ |
| `/checkout` | Có bảo vệ | `ROLE_BUYER` hoặc Đăng ký nhanh | Yêu cầu số điện thoại / Đăng nhập |
| `/order-tracking/**` | Công khai | Tra cứu qua SĐT + Mã đơn | Kiểm tra mã OTP gửi qua SMS/Zalo |
| `/compliance` | Công khai | Mọi người dùng (`ANONYMOUS`) | Cho phép tải PDF chứng nhận |
| `/seller/onboarding` | Có bảo vệ | `ROLE_SELLER` (Chưa nộp KYC) | Chặn truy cập nếu không phải Seller |
| `/seller/subscription` | Có bảo vệ | `ROLE_SELLER` (Chưa có gói Active) | Yêu cầu chọn gói SaaS trước |
| `/seller/**` (Các trang khác) | Có bảo vệ nghiêm ngặt | `ROLE_SELLER` + `is_compliance_approved` + `ACTIVE` SaaS | Điều hướng về trang Onboarding/Subscription nếu chưa đủ điều kiện |
| `/admin/**` | Quản trị tối cao | `ROLE_PLATFORM_ADMIN` | Trả về mã lỗi `403 Forbidden` |

---

## 3. Chiến Lược Điều Hướng Đa Nền Tảng (Responsive Navigation Patterns)

### 3.1 Giao Diện Người Dùng (Client Navigation - Mobile & Desktop)
- **Desktop Header Navigation**:
  - Logo thương hiệu + Tên nền tảng.
  - Menu ngang: Trang chủ, Khám phá bánh lẻ, Tự phối hộp quà (Highlight), Báo giá doanh nghiệp B2B, Hồ sơ ATTP xưởng.
  - Khối Action bên phải: Ô tìm kiếm nhanh, Icon Giỏ hàng (kèm badge số lượng), Nút "Đăng nhập / Vào gian hàng".
- **Mobile Bottom Navigation Bar (Thanh điều hướng cố định chân trang)**:
  - Tab 1: Trang chủ (`Home` icon).
  - Tab 2: Danh mục bánh (`Cake` icon).
  - Tab 3: Phối hộp quà (`Box` icon - Nút nổi bật trung tâm CTA).
  - Tab 4: Tra cứu đơn hàng (`SearchCheck` icon).
  - Tab 5: Tài khoản (`User` icon).

### 3.2 Giao Diện Quản Trị Gian Hàng (Seller Sidebar Navigation)
- Sidebar cố định bên trái (thu gọn trên tablet/mobile):
  - Nhóm Vận Hành: Tổng quan Dashboard, Lịch Song Lịch Âm/Dương, Phiếu Ra Lò Bánh Tươi, Quản lý Đơn Hàng.
  - Nhóm Kinh Doanh: Sản phẩm & Biến thể SKU, Đấu thầu B2B RFQ, Cấu hình Hạn Ngạch Nướng.
  - Nhóm Tài Khoản: Gói SaaS Dịch Vụ, Hồ sơ Pháp lý ATTP, Thiết lập Gian Hàng.

---

## 4. Chuẩn Mực Iconography (Strict UI Standard)
- **Tuyệt đối tuân thủ**: Không sử dụng emoji trong các liên kết điều hướng và menu.
- **Thư viện icon**: Toàn bộ icon điều hướng sử dụng chuẩn SVG vector từ thư viện `lucide-react` (Ví dụ: `LayoutDashboard`, `CalendarDays`, `Layers`, `Store`, `ShieldCheck`, `FileText`, `PackageSearch`, `ShoppingCart`).
