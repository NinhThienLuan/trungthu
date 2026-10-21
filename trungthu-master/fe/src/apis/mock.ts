/**
 * Bật/tắt dữ liệu giả cho các API BE chưa làm xong.
 * Khi BE xong module nào -> đổi cờ module đó thành false.
 */
export const USE_MOCK = {
  auth: true, // đăng nhập giả: demo@buyer.vn / 12345678 (đổi false để dùng BE thật)
  products: true, // danh mục mẫu 14 sản phẩm có ảnh (đổi false để dùng BE thật)
  capacity: true, // BE2 Đạt: ngày khả dụng theo hạn ngạch
  checkout: true, // BE3 Phát: validate giỏ + tách đơn theo Provider
  orders: true, // BE4 Luân: đơn của tôi, trạng thái
  rfq: true, // BE3 Phát: gửi yêu cầu báo giá sỉ
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
