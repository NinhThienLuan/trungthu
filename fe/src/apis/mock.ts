/**
 * Bật/tắt dữ liệu giả cho các API BE chưa làm xong.
 * Khi BE xong module nào -> đổi cờ module đó thành false.
 */
export const USE_MOCK = {
  auth: false, // Nối API thật /api/auth của Spring Boot backend
  products: false, // BE2 Đạt: /api/products (sản phẩm demo do DemoProductSeeder tạo)
  capacity: true, // BE2 Đạt: CHƯA có API ngày khả dụng -> vẫn giả lập
  checkout: false, // BE3 Phát: /api/checkout, /api/orders/{id}/vietqr
  orders: false, // BE4 Luân: /api/orders/me, /api/orders/{id}
  rfq: false, // BE3 Phát: /api/rfqs
}

export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

/** Đọc / ghi localStorage an toàn (private mode có thể throw) */
export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* bỏ qua */
  }
}
