import type { ProductType } from '../types/product'
import type { OrderPaymentStatus, OrderStatus, PaymentMethod } from '../types/order'
import type { UserRole } from '../types/user'

export const BRAND = 'Nguyệt Viên Đài'

// Quy tắc nghiệp vụ (SRS) — đổi ở đây, không viết số cứng trong component
export const MIN_LEAD_DAYS = 3 // ngày nhận >= hôm nay + 3
export const RFQ_MIN_QUANTITY = 20 // RFQ sỉ từ 20 hộp
export const DEPOSIT_RATE = 0.5 // cọc tối thiểu 50%
export const HOLD_MINUTES = 300 // VietQR: tối đa 5 giờ từ lúc đặt
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
  // Quên mật khẩu (README 3.2): email -> OTP -> mật khẩu mới
  forgotPassword: '/forgot-password',
  verifyCode: '/verify-code',
  resetPassword: '/reset-password',
  changePassword: '/change-password',
} as const

/** Trang đích sau khi đăng nhập / đổi mật khẩu, theo vai trò */
export const HOME_BY_ROLE: Record<UserRole, string> = {
  CUSTOMER: '/',
  PROVIDER: '/seller',
  PLATFORM_ADMIN: '/admin/kyc',
}

/** OTP quên mật khẩu: 6 số, hiệu lực 10 phút, gửi lại sau 60 giây (khớp AuthServiceImpl) */
export const OTP_LENGTH = 6
export const OTP_EXPIRE_SECONDS = 600
export const OTP_RESEND_SECONDS = 60

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  LOOSE_CAKE: 'Bánh lẻ',
  BOX_SHELL: 'Hộp quà',
  GREETING_CARD: 'Thiệp chúc',
  ADDON_SERVICE: 'Dịch vụ kèm',
  GIFT_SET: 'Set quà',
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
