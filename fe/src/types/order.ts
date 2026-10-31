// Kiểu dữ liệu đơn hàng — khớp hợp đồng BE (docs/BRD/04-agent-and-dev-guidelines/backend-ownership-and-order-contract.md)
// và DTO BE4: OrderSummaryResponse, OrderDetailResponse, OrderLineResponse.

/** Trạng thái đơn chuẩn (mục 4 hợp đồng) */
export type OrderStatus = 'PENDING_DEPOSIT' | 'CONFIRMED' | 'DEPOSITED' | 'BAKING_QUEUED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED'

/** Enum BE; checkout dùng COD hoặc VIETQR. */
export type PaymentMethod = 'COD' | 'VIETQR' | 'VNPAY' | 'MOMO' | 'DIRECT_BANK'

export type OrderPaymentStatus = 'UNPAID' | 'DEPOSITED' | 'PAID_FULL'

/** Thanh toán online: cọc tối thiểu 50% hoặc trả đủ */
export type DepositOption = 'MIN_DEPOSIT' | 'FULL'

// ---------- Checkout (BE3: POST /api/checkout/preview, POST /api/checkout) ----------

/** Một dòng là variant HOẶC set quà (GIFT_SET không có variant) */
export interface CheckoutLine {
  variantId?: string
  setProductId?: string
  quantity: number
  /** Hộp tự phối: variant bánh lẻ cho từng ô, đủ đúng sức chứa hộp */
  boxContents?: string[]
}

/** Mỗi Provider một nhóm = một Order: một ngày nhận, một phương thức thanh toán */
export interface CheckoutGroup {
  providerId: string
  deliveryDate: string // yyyy-MM-dd
  province?: string
  district?: string
  wardCode?: string
  paymentMethod: PaymentMethod
  /** Chỉ dùng khi thanh toán online */
  depositOption?: DepositOption
  items: CheckoutLine[]
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
  /** Tổng tiền được giảm nhờ khuyến mãi của xưởng */
  discountAmount: number
  lines: CheckoutPreviewLine[]
}

/** Dòng hàng sau khi BE áp khuyến mãi (unitPrice là giá sau giảm) */
export interface CheckoutPreviewLine {
  variantId: string
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
  subtotal: number
  listAmount: number
  /** Nhãn khuyến mãi đã áp, vd "Mua 3 tặng 1" */
  promotion: string | null
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

/** GET /api/orders/{id}/vietqr */
export interface VietQrInstruction {
  imageUrl: string
  bankCode: string
  accountNumber: string
  accountName: string
  amount: number
  transferContent: string
  holdExpiresAt: string
}

export interface OrderDetail extends OrderSummary {
  receiverName: string
  receiverPhone: string
  shippingAddress: string
  subtotalAmount: number
  shippingFee: number
  /** Số tiền khuyến mãi của xưởng đã trừ (BE: discountAmount) */
  discountAmount?: number
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

/** BE3: CreateRfqRequest (POST /api/rfqs) */
export interface RfqRequest {
  companyName: string
  taxCode: string
  contactName: string
  contactPosition: string
  contactPhone: string
  contactEmail: string
  requestedQuantity: number
  expectedDeliveryDate: string
  description?: string
  expectedBudget?: number
  logoUrl?: string
}

export type RfqStatus = 'NEW' | 'DISTRIBUTED' | 'QUOTES_RECEIVED' | 'WON' | 'LOST'
export type QuoteStatus = 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

export interface RfqResponse {
  id: string
  code: string
  companyName: string
  taxCode: string | null
  contactName: string | null
  contactPosition: string | null
  contactPhone: string | null
  contactEmail: string | null
  requestedQuantity: number
  expectedDeliveryDate: string
  status: RfqStatus
  expectedBudget: number | null
  description: string | null
  logoUrl: string | null
}

export interface SubmitQuoteRequest {
  unitPrice: number
  offeredQuantity: number
  estimatedDeliveryDate: string
  validUntil: string
  note?: string
}

export interface QuoteResponse {
  id: string
  requestId: string
  providerId: string
  providerName: string
  unitPrice: number
  offeredQuantity: number
  estimatedDeliveryDate: string
  validUntil: string | null
  status: QuoteStatus
  note: string | null
  createdAt: string
  /** Liên hệ xưởng: chỉ có khi báo giá đã được chấp nhận */
  providerPhone: string | null
  providerEmail: string | null
  providerAddress: string | null
}
