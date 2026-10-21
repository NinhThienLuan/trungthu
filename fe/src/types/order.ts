// Hợp đồng dữ liệu đề xuất cho Checkout (BE3 Phát) và Orders (BE4 Luân).
// Khi BE chốt API thật, chỉ cần sửa file này + src/apis/*.ts.

export type OrderStatus =
  | 'PENDING_DEPOSIT'
  | 'CONFIRMED'
  | 'DEPOSITED'
  | 'BAKING_QUEUED'
  | 'BAKING' // Alias tương thích ngược với BAKING_QUEUED
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED'

export interface CheckoutLine {
  variantId: string
  quantity: number
}

/** Hộp tự phối -> BE lưu vào custom_boxes + custom_box_items (mỗi phần tử cakeVariantIds là 1 ô) */
export interface CheckoutBox {
  boxVariantId: string
  quantity: number
  cakeVariantIds: string[]
  note?: string
}

/** Mỗi Provider một nhóm: một ngày nhận, một đơn con */
export interface CheckoutGroup {
  providerId: string
  deliveryDate: string // yyyy-MM-dd
  items: CheckoutLine[]
  boxes: CheckoutBox[]
}

export interface VatInfo {
  taxCode: string
  companyName: string
  companyAddress: string
  invoiceEmail: string
}

export interface CheckoutRequest {
  receiverName: string
  receiverPhone: string
  shippingAddress: string
  note?: string
  vat?: VatInfo
  groups: CheckoutGroup[]
}

export interface OrderLine {
  variantId: string
  productName: string
  variantName: string
  unitPrice: number
  quantity: number
  /** Tên các bánh trong hộp tự phối (theo thứ tự ô) */
  boxContents?: string[]
}

export interface Order {
  id: string
  code: string
  providerId: string
  storeName: string
  deliveryDate: string
  status: OrderStatus
  totalAmount: number
  depositAmount: number
  holdExpiresAt: string | null
  /** Ảnh VietQR do BE sinh; null khi chưa có */
  qrImageUrl: string | null
  bankName: string | null
  bankAccount: string | null
  transferNote: string
  createdAt: string
  lines: OrderLine[]
}

export interface RfqRequest {
  companyName: string
  contactName: string
  phone: string
  email: string
  quantity: number
  expectedDate: string
  budgetNote?: string
  message?: string
}
