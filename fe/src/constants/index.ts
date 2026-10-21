import type { ProductType } from '../types/product'
import type { OrderPaymentStatus, OrderStatus, PaymentMethod } from '../types/order'

export const BRAND = 'Nguyệt Viên Đài'

// Quy tắc nghiệp vụ (SRS) — đổi ở đây, không viết số cứng trong component
export const MIN_LEAD_DAYS = 3 // ngày nhận >= hôm nay + 3
export const RFQ_MIN_QUANTITY = 20 // RFQ sỉ từ 20 hộp
export const DEPOSIT_RATE = 0.5 // cọc tối thiểu 50%
export const HOLD_MINUTES = 15 // VietQR cũ; PayOS giới hạn 5 giờ từ backend
export const COD_MAX_TOTAL = 2_000_000 // COD chỉ cho đơn (sau tách theo xưởng) dưới 2 triệu

export const ROUTES = {
  home: '/',
  products: '/products',
  product: (id: string) => `/products/${id}`,
  cart: '/cart',
  checkout: '/checkout',
  payment: '/payment',
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,
  rfq: '/rfq',
  boxBuilder: '/box-builder',
  policy: '/policy',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  changePassword: '/account/password',
} as const

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  LOOSE_CAKE: 'Bánh lẻ',
  BOX_SHELL: 'Hộp quà',
  GREETING_CARD: 'Thiệp chúc',
  ADDON_SERVICE: 'Dịch vụ kèm',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_DEPOSIT: 'Chờ đặt cọc',
  CONFIRMED: 'Đã xác nhận (COD)',
  DEPOSITED: 'Đã nhận cọc',
  BAKING_QUEUED: 'Đang sản xuất',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã huỷ',
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  COD: 'Thanh toán khi nhận (COD)',
  VIETQR: 'Chuyển khoản VietQR',
  PAYOS: 'PayOS',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  DIRECT_BANK: 'Chuyển khoản ngân hàng',
}

export const PAYMENT_STATUS_LABEL: Record<OrderPaymentStatus, string> = {
  UNPAID: 'Chưa thanh toán',
  DEPOSITED: 'Đã cọc',
  PAID_FULL: 'Đã thanh toán đủ',
}

/** Đơn chỉ được huỷ khi chưa cọc / COD chưa vào sản xuất (mục 4 hợp đồng) */
export const CANCELLABLE_STATUSES: OrderStatus[] = ['PENDING_DEPOSIT', 'CONFIRMED']
