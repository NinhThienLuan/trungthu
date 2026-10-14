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

- **Mọi màu, font, cỡ chữ chỉ khai báo trong `src/assets/style.css`.** Bảng màu mặc định của Tailwind đã bị tắt,
  nên `bg-blue-500`, `text-gray-600`... sẽ không có tác dụng. Chỉ dùng màu thương hiệu: `navy`, `navy-deep`, `gold`,
  `gold-ink`, `champagne`, `ivory`, `jade`, `ink`, `muted`, `line`, `success`, `danger`.
- Cỡ chữ chỉ dùng 7 bậc: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small`, `text-label`.
- Dùng class có sẵn thay vì tự viết lại: `page`, `section`, `card`, `btn btn-primary | btn-outline | btn-ghost`,
  `input`, `field-label`, `chip`, `eyebrow`.
- Icon chỉ dùng `lucide-react`, không dùng emoji.
- Chữ trên UI ngắn gọn: tiêu đề + tối đa 1 dòng mô tả.

## Cấu trúc

```
src/
├── apis/        # gọi BE; mock.ts bật/tắt dữ liệu giả cho API chưa xong
├── assets/      # style.css (design system duy nhất)
├── components/  # Header, Footer, ProductCard, DeliveryDatePicker, ui/*
├── constants/   # ROUTES, label, quy tắc nghiệp vụ (MIN_LEAD_DAYS...)
├── hooks/       # useApi, useDocumentTitle
├── layouts/     # MainLayout, AuthLayout
├── lib/         # format tiền, ngày, cn()
├── pages/       # mỗi route một trang
├── routes/      # router + ProtectedRoute
├── schemas/     # validate form bằng zod
├── stores/      # zustand: auth, cart
└── types/       # kiểu dữ liệu khớp DTO của BE
```

## API đang dùng dữ liệu giả

Xem `src/apis/mock.ts`. Khi BE xong module nào thì đổi cờ tương ứng thành `false`:

| Cờ | Module BE | Endpoint đề xuất |
|---|---|---|
| `capacity` | BE2 Đạt | `GET /api/providers/{id}/available-dates?from=&to=` |
| `checkout` | BE3 Phát | `POST /api/checkout` → danh sách đơn con |
| `orders` | BE4 Luân | `GET /api/orders/me`, `GET /api/orders/{id}` |
| `rfq` | BE3 Phát | `POST /api/rfqs` |

Định dạng request/response nằm trong `src/types/order.ts`.
