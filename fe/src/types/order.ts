// Kiểu dữ liệu đơn hàng — khớp hợp đồng BE (docs/BRD/04-agent-and-dev-guidelines/backend-ownership-and-order-contract.md)
// và DTO BE4: OrderSummaryResponse, OrderDetailResponse, OrderLineResponse.

/** Trạng thái đơn chuẩn (mục 4 hợp đồng) */
export type OrderStatus = 'PENDING_DEPOSIT' | 'CONFIRMED' | 'DEPOSITED' | 'BAKING_QUEUED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED'

/** Enum BE; checkout dùng COD hoặc PAYOS. */
export type PaymentMethod = 'COD' | 'VIETQR' | 'PAYOS' | 'VNPAY' | 'MOMO' | 'DIRECT_BANK'

export type OrderPaymentStatus = 'UNPAID' | 'DEPOSITED' | 'PAID_FULL'

/** Thanh toán online: cọc tối thiểu 50% hoặc trả đủ */
export type DepositOption = 'MIN_DEPOSIT' | 'FULL'

// ---------- Checkout (BE3: POST /api/checkout/preview, POST /api/checkout) ----------

export interface CheckoutLine {
  variantId: string
  quantity: number
}

/** [Phase 2 — FE đề xuất] Hộp tự phối; hợp đồng MVP chưa nhận trường này */
export interface CheckoutBox {
  boxVariantId: string
  quantity: number
  cakeVariantIds: string[]
  note?: string
}

/** Mỗi Provider một nhóm = một Order: một ngày nhận, một phương thức thanh toán */
export interface CheckoutGroup {
  providerId: string
  deliveryDate: string // yyyy-MM-dd
  province?: string
  district?: string
  paymentMethod: PaymentMethod
  /** Chỉ dùng khi thanh toán online */
  depositOption?: DepositOption
  items: CheckoutLine[]
  boxes?: CheckoutBox[]
}

/** Khớp CreateOrdersCommand.VatInfo */
export interface VatInfo {
  companyName: string
  taxCode: string
  companyAddress: string
  invoiceEmail: string
}

export interface CheckoutRequest {
  receiverName: string
  receiverPhone: string
  shippingAddress: string
  vat?: VatInfo
  groups: CheckoutGroup[]
}

/** Kết quả preview (chỉ đọc, không giữ tài nguyên) cho từng Provider */
export interface CheckoutPreviewGroup {
  providerId: string
  subtotalAmount: number
  shippingFee: number
  totalAmount: number
  /** Cọc tối thiểu khi thanh toán online (50%, làm tròn lên) */
  minDepositAmount: number
  /** COD chỉ cho đơn tiêu chuẩn < 2.000.000đ, không in riêng */
  codAllowed: boolean
}

export interface CheckoutPreview {
  groups: CheckoutPreviewGroup[]
  grandTotal: number
}

// ---------- Đơn hàng (BE4: GET /api/orders/me, GET /api/orders/{id}) ----------

export interface OrderSummary {
  id: string
  code: string
  providerId: string
  storeName: string
  deliveryDate: string // yyyy-MM-dd
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: OrderPaymentStatus
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  createdAt: string // ISO UTC (orderedAt)
}

export interface OrderLine {
  variantId: string
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
  subtotal: number
  /** [Phase 2 — FE] Tên bánh trong hộp tự phối */
  boxContents?: string[]
}

/** [FE đề xuất cho BE3] Thông tin chuyển khoản VietQR — chưa có trong API đọc hiện tại */
export interface VietQrPayment {
  qrImageUrl: string | null
  bankName: string
  bankAccount: string
  accountName?: string
  transferNote: string
}

export interface PayosPayment {
  orderId: string
  payosOrderCode: number
  amount: number
  paymentLinkId: string
  checkoutUrl: string | null
  qrCode: string | null
  expiresAt: string
}

export interface OrderDetail extends OrderSummary {
  receiverName: string
  receiverPhone: string
  shippingAddress: string
  subtotalAmount: number
  shippingFee: number
  depositAmount: number
  holdExpiresAt: string | null
  lines: OrderLine[]
  payment?: VietQrPayment
}

/** Bộ lọc GET /api/orders/me: from/to là ngày nhận, gồm cả hai đầu */
export interface OrderQuery {
  page?: number
  size?: number
  status?: OrderStatus
  from?: string
  to?: string
}

// ---------- RFQ ----------

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
