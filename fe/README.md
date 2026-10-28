# Frontend – Nguyệt Viên Đài

React 19 + Vite + TypeScript + Tailwind CSS v4.

## Chạy

```bash
cd fe
npm install
npm run dev        # http://localhost:5173, /api được proxy sang Spring Boot :8080
```

Chạy backend (`be/`) trước để có dữ liệu thật cho đăng nhập và sản phẩm.

## Đăng nhập Google

1. Tạo OAuth Client ID loại **Web application** trong Google Cloud Console. Thêm `http://localhost:5173` vào **Authorized JavaScript origins** (và origin FE thật khi triển khai). Luồng FE dùng Google Identity Services lấy ID token, không dùng redirect URI.
2. Tạo `fe/.env.local` từ `fe/.env.example`, đặt `VITE_GOOGLE_CLIENT_ID` bằng Client ID trên. Đặt cùng Client ID vào biến `GOOGLE_CLIENT_ID` của BE (hoặc `spring.security.oauth2.client.registration.google.client-id` trong `secrets.properties`). Client secret không được đưa vào FE.
3. Khởi động lại Vite sau khi đổi `.env.local`. Tại `/login`, nút Google gửi ID token tới `POST /api/auth/google`; BE xác minh token và đặt cookie đăng nhập. Nếu chưa có Client ID, nút Google sẽ không xuất hiện.

Khi FE gọi BE qua domain khác, cấu hình `VITE_API_BASE_URL`, CORS origin và cookie phù hợp trên BE. Ưu tiên proxy `/api` cùng origin để cookie hoạt động ổn định.

## Quy tắc giao diện (bắt buộc)

- Giao diện chuyển từ bản thiết kế **Stitch** (`artisanal_confectionery_luxury`). Mọi token màu / font / cỡ chữ / khoảng cách
  nằm trong `src/assets/style.css`; bảng màu mặc định của Tailwind đã bị tắt nên chỉ dùng được màu thương hiệu.
- Trang Stitch dùng tên token của Stitch: `bg-primary-container`, `text-secondary`, `text-on-surface-variant`,
  `font-headline-sm text-headline-sm`, `font-body-md text-body-md`, `p-space-md`, `px-margin`...
- Trang tự viết (giỏ hàng, checkout...) dùng bộ rút gọn cùng giá trị: `navy`, `gold`, `ivory`, `text-h1..text-label`,
  `card`, `btn btn-primary`, `input`, `chip`.
- Icon: `<Icon name="tên_material" />` (map sang lucide-react) hoặc import thẳng từ `lucide-react`. Không dùng emoji.
- Không viết mã màu hex trực tiếp trong className.

## Cấu trúc

```
src/
├── apis/          # tầng gọi mạng: http.ts (axios + refresh token), mock.ts (cờ bật/tắt mock), mockData.ts
├── services/      # nghiệp vụ gọi BE: authService, productService, orderService, capacityService, rfqService
├── assets/        # style.css — design system duy nhất (Tailwind v4, cấu hình bằng @theme)
├── components/
│   ├── layouts/   # UserLayout, AdminLayout, AuthLayout, Header, Footer, StitchPage
│   └── ui/        # Field, States, QuantityStepper, PageHeader
├── constants/     # ROUTES, label, quy tắc nghiệp vụ (MIN_LEAD_DAYS...)
├── hooks/         # useApi, useDocumentTitle
├── lib/           # format tiền, ngày, cn()
├── pages/
│   ├── user/      # trang người mua: Home, Catalog, ProductDetail, BoxBuilder, Cart, Checkout, Payment, MyOrders, B2B, Policy
│   ├── admin/     # khu vực nghệ nhân / quản trị sàn (FE2)
│   ├── auth/      # Login, Register
│   └── NotFoundPage.tsx
├── routes/        # router, ProtectedRoute, stitchPaths (data-path của Stitch -> route)
├── schemas/       # validate form bằng zod
├── stores/        # zustand: auth, cart
└── types/         # kiểu dữ liệu khớp DTO của BE
```

Tailwind v4 không cần `tailwind.config.js`: toàn bộ cấu hình (màu, font, cỡ chữ, khoảng cách) khai báo bằng `@theme` trong `src/assets/style.css`.

## API đang dùng dữ liệu giả

Xem `src/apis/mock.ts`. Hợp đồng chuẩn: `docs/BRD/04-agent-and-dev-guidelines/backend-ownership-and-order-contract.md`.

| Cờ | Module BE | Endpoint | Trạng thái BE |
|---|---|---|---|
| `auth` | BE1 Tiến | `/api/auth/*` | Đã có |
| `products` | BE2 Đạt | `GET /api/products`, `GET /api/products/{id}` | Đã có (chưa có ảnh) |
| `orders` | BE4 Luân | `GET /api/orders/me` (page/size/status/from/to), `GET /api/orders/{id}` | Đã có |
| `orders` | BE3 Phát | `POST /api/orders/{id}/cancel` | Chưa có |
| `checkout` | BE3 Phát | `POST /api/checkout/preview`, `POST /api/checkout` | Chưa có |
| `capacity` | BE2 Đạt | `GET /api/providers/{id}/available-dates?from=&to=` | Chưa có |
| `rfq` | BE3 Phát | `POST /api/rfqs` | Chưa có |

`orders` cần token thật (role CUSTOMER) nên chỉ tắt mock `orders` khi đã tắt mock `auth`.
Kiểu dữ liệu trong `src/types/order.ts` khớp DTO BE4 (`OrderSummaryResponse`, `OrderDetailResponse`); hộp tự phối (`boxes`)
và thông tin VietQR (`payment`) là phần FE đề xuất — hợp đồng MVP chưa có.
