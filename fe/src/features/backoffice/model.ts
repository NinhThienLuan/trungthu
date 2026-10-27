export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type SaleStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN'
export type OrderStage = 'PENDING_DEPOSIT' | 'DEPOSITED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED'
export type PlanId = 'STANDARD' | 'VIP'

export const DEMO_DATE = '2026-10-28'
export const SELLER_ID = 'NVD-001'
export const STORE_NAME = 'Xưởng bánh Đông Phương'
export const PLANS = {
  STANDARD: { name: 'Standard', price: 1_000_000, limit: 20, featured: false },
  VIP: { name: 'VIP', price: 3_000_000, limit: 100, featured: true },
} as const
export const STAGES: Record<OrderStage, string> = {
  PENDING_DEPOSIT: 'Chờ cọc', DEPOSITED: 'Đã cọc / COD', DELIVERING: 'Đang giao', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy',
}
export const REVIEWS: Record<ReviewStatus, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' }

export interface ComplianceDoc {
  id: string; type: 'FOOD_SAFETY' | 'LEGAL'; name: string; filename: string
  status: ReviewStatus; submittedAt: string; reason?: string; url?: string
}
export interface Subscription {
  id: string; plan: PlanId; status: 'PENDING' | 'ACTIVE' | 'EXPIRED'; start?: string; end?: string
  transferNote: string; submittedAt: string
}
export interface Sku {
  id: string; name: string; variant: string; price: number; stock: number; cakeUnits: number; status: SaleStatus
}
export interface OrderLine { skuId: string; quantity: number; unitPrice: number }
export interface DemoOrder {
  id: string; customer: string; phone: string; address: string; deliveryDate: string; stage: OrderStage
  method: 'TRANSFER' | 'COD'; printName?: string; lines: OrderLine[]; shipping: number; paid: number; holdUntil?: number
}
export interface Rfq {
  code: string; company: string; taxCode: string; contact: string; phone: string; email: string
  quantity: number; deliveryDate: string; submittedAt: string; note: string; logo?: string
}

export const INITIAL_DOCS: ComplianceDoc[] = [
  { id: 'food', type: 'FOOD_SAFETY', name: 'Giấy chứng nhận an toàn thực phẩm', filename: 'giay-attp.pdf', status: 'PENDING', submittedAt: DEMO_DATE },
  { id: 'legal', type: 'LEGAL', name: 'Đăng ký kinh doanh / CCCD', filename: 'dang-ky-kinh-doanh.pdf', status: 'APPROVED', submittedAt: '2026-10-27' },
]
export const INITIAL_SKUS: Sku[] = [
  { id: 'DP-SEN-150', name: 'Bánh nướng hạt sen', variant: '150g · 1 trứng', price: 85000, stock: 120, cakeUnits: 1, status: 'PUBLISHED' },
  { id: 'DP-TC-150', name: 'Bánh nướng thập cẩm', variant: '150g · 1 trứng', price: 95000, stock: 80, cakeUnits: 1, status: 'PUBLISHED' },
  { id: 'DP-DX-150', name: 'Bánh nướng đậu xanh', variant: '150g · Không trứng', price: 75000, stock: 65, cakeUnits: 1, status: 'PUBLISHED' },
  { id: 'DP-SET4', name: 'Hộp đoàn viên 4 bánh', variant: '2 sen · 2 thập cẩm', price: 390000, stock: 30, cakeUnits: 4, status: 'PUBLISHED' },
  { id: 'DP-DEO-150', name: 'Bánh dẻo hạt sen', variant: '150g · Không trứng', price: 80000, stock: 0, cakeUnits: 1, status: 'DRAFT' },
]
export function initialOrders(): DemoOrder[] {
  return [
    { id: 'NVD-1028-001', customer: 'Nguyễn Minh Anh', phone: '0901234567', address: '18 Nguyễn Đình Chiểu, TP.HCM', deliveryDate: '2026-11-01', stage: 'PENDING_DEPOSIT', method: 'TRANSFER', lines: [{ skuId: 'DP-SET4', quantity: 3, unitPrice: 390000 }], shipping: 35000, paid: 0, holdUntil: Date.now() + 12 * 60000 },
    { id: 'NVD-1028-002', customer: 'Trần Hoàng Nam', phone: '0912345678', address: '42 Lê Lợi, TP.HCM', deliveryDate: '2026-11-01', stage: 'DEPOSITED', method: 'TRANSFER', printName: 'Gia đình Hoàng Nam', lines: [{ skuId: 'DP-SEN-150', quantity: 8, unitPrice: 85000 }, { skuId: 'DP-TC-150', quantity: 8, unitPrice: 95000 }], shipping: 35000, paid: 737500 },
    { id: 'NVD-1028-003', customer: 'Lê Thu Hà', phone: '0934567890', address: '15 Pasteur, TP.HCM', deliveryDate: '2026-10-31', stage: 'DELIVERING', method: 'COD', lines: [{ skuId: 'DP-SET4', quantity: 2, unitPrice: 390000 }], shipping: 35000, paid: 0 },
    { id: 'NVD-1028-004', customer: 'Phạm Ngọc Lan', phone: '0987654321', address: '36 Võ Văn Tần, TP.HCM', deliveryDate: '2026-10-31', stage: 'COMPLETED', method: 'TRANSFER', lines: [{ skuId: 'DP-DX-150', quantity: 6, unitPrice: 75000 }], shipping: 35000, paid: 485000 },
    { id: 'NVD-1028-005', customer: 'Vũ Thanh Tâm', phone: '0976543210', address: '22 Hai Bà Trưng, TP.HCM', deliveryDate: '2026-11-01', stage: 'CANCELLED', method: 'TRANSFER', lines: [{ skuId: 'DP-SEN-150', quantity: 4, unitPrice: 85000 }], shipping: 35000, paid: 0 },
  ]
}
export const RFQS: Rfq[] = [
  { code: 'RFQ-20261028-0001', company: 'Công ty Hoa An', taxCode: '0312345678', contact: 'Nguyễn Thảo Vy', phone: '0902345678', email: 'thao.vy@hoaan.example', quantity: 120, deliveryDate: '2026-11-04', submittedAt: DEMO_DATE, note: 'Hộp 4 bánh, kèm thiệp cảm ơn. Vui lòng liên hệ để thống nhất mẫu hộp và chi phí in logo.', logo: 'Hoa An' },
  { code: 'RFQ-20261028-0002', company: 'Công ty Minh Hòa', taxCode: '0313456789', contact: 'Trần Quốc Bảo', phone: '0913456789', email: 'quoc.bao@minhhoa.example', quantity: 40, deliveryDate: '2026-11-02', submittedAt: DEMO_DATE, note: 'Quà tặng nhân viên, ưu tiên bánh ít ngọt. Nhận hàng tại một địa chỉ ở TP.HCM.' },
  { code: 'RFQ-20261027-0003', company: 'Văn phòng An Nhiên', taxCode: '0314567890', contact: 'Lê Mai Chi', phone: '0935678901', email: 'mai.chi@annhien.example', quantity: 20, deliveryDate: '2026-11-01', submittedAt: '2026-10-27', note: '20 hộp phối vị sen và đậu xanh. Không in logo.' },
]
export const orderTotal = (order: DemoOrder) => order.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, order.shipping)
export const bakeDate = (delivery: string) => {
  const date = new Date(`${delivery}T12:00:00`)
  date.setDate(date.getDate() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export const orderUnits = (order: DemoOrder, skus: Sku[]) => order.lines.reduce((sum, line) => sum + line.quantity * (skus.find(sku => sku.id === line.skuId)?.cakeUnits ?? 0), 0)
export const isProductionOrder = (order: DemoOrder) => ['DEPOSITED', 'DELIVERING', 'COMPLETED'].includes(order.stage)

