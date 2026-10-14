import type { ProductType } from '../types/product'
import type { OrderStatus } from '../types/order'

export const BRAND = 'Nguyệt Viên Đài'

// Quy tắc nghiệp vụ (SRS) — đổi ở đây, không viết số cứng trong component
export const MIN_LEAD_DAYS = 3 // ngày nhận >= hôm nay + 3
export const RFQ_MIN_QUANTITY = 20 // RFQ sỉ từ 20 hộp
export const DEPOSIT_RATE = 0.5 // cọc tối thiểu 50%
export const HOLD_MINUTES = 15 // giữ chỗ chờ cọc

export const ROUTES = {
  home: '/',
  products: '/products',
  product: (id: string) => `/products/${id}`,
  cart: '/cart',
  checkout: '/checkout',
  payment: '/payment',
  orders: '/orders',
  rfq: '/rfq',
  policy: '/policy',
  login: '/login',
  register: '/register',
} as const

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  LOOSE_CAKE: 'Bánh lẻ',
  BOX_SHELL: 'Hộp quà',
  GREETING_CARD: 'Thiệp chúc',
  ADDON_SERVICE: 'Dịch vụ kèm',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_DEPOSIT: 'Chờ đặt cọc',
  DEPOSITED: 'Đã nhận cọc',
  BAKING: 'Đang nướng',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã huỷ',
}
