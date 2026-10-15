# Frontend – Nguyệt Viên Đài

React 19 + Vite + TypeScript + Tailwind CSS v4.

## Chạy

```bash
cd fe
npm install
npm run dev        # http://localhost:5173, /api được proxy sang Spring Boot :8080
```

Chạy backend (`be/`) trước để có dữ liệu thật cho đăng nhập và sản phẩm.

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

Xem `src/apis/mock.ts`. Khi BE xong module nào thì đổi cờ tương ứng thành `false`:

| Cờ | Module BE | Endpoint đề xuất |
|---|---|---|
| `capacity` | BE2 Đạt | `GET /api/providers/{id}/available-dates?from=&to=` |
| `checkout` | BE3 Phát | `POST /api/checkout` → danh sách đơn con |
| `orders` | BE4 Luân | `GET /api/orders/me`, `GET /api/orders/{id}` |
| `rfq` | BE3 Phát | `POST /api/rfqs` |

Định dạng request/response nằm trong `src/types/order.ts`; hàm gọi API nằm trong `src/services/`.
