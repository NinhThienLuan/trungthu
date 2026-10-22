import type { Product } from './types'

export const productTypeLabel: Record<Product['productType'], string> = {
  LOOSE_CAKE: 'Bánh lẻ',
  BOX_SHELL: 'Hộp bánh',
  GIFT_SET: 'Set hộp',
  GREETING_CARD: 'Thiệp',
  ADDON_SERVICE: 'Dịch vụ thêm',
}

export const productStatusLabel: Record<Product['status'], string> = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang bán',
  SOLD_OUT: 'Hết hàng',
  ARCHIVED: 'Đã lưu trữ',
}

export const variantStatusLabel = {
  IN_STOCK: 'Còn hàng',
  OUT_OF_STOCK: 'Hết hàng',
} as const

export const auditLabel: Record<string, string> = {
  INBOUND_IMPORT: 'Nhập kho',
  TERMINATE_CLEAR: 'Báo hết hàng',
  ADJUSTMENT_BROKEN: 'Hỏng',
  ADJUSTMENT_EXPIRED: 'Hết dùng',
  ORDER_HOLD: 'Giữ cho đơn',
  ORDER_RETURN: 'Trả từ đơn hủy',
  ORDER_SALE: 'Đã bán',
}

export const orderStatusLabel: Record<string, string> = {
  PENDING_DEPOSIT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận (COD)',
  DEPOSITED: 'Đã thanh toán',
  BAKING_QUEUED: 'Đang nướng',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
}

export function formatTime(value: string) {
  return new Date(value).toLocaleString('vi-VN')
}
