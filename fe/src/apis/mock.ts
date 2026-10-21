/**
 * Bật/tắt dữ liệu giả cho các API BE chưa làm xong.
 * Khi BE xong module nào -> đổi cờ module đó thành false.
 */
export const USE_MOCK = {
  auth: false, // Nối API thật /api/auth của Spring Boot backend
  products: true, // danh mục mẫu 14 sản phẩm có ảnh (đổi false để dùng BE thật)
  capacity: true, // BE2 Đạt: ngày khả dụng theo hạn ngạch
  checkout: true, // Demo PayOS; tắt khi cart dùng UUID sản phẩm thật và seller đã cấu hình kênh
  orders: true, // Tắt cùng checkout để đọc trạng thái thanh toán từ backend
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
