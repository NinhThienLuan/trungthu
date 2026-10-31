import { http, unwrap } from '../apis/http'
import type { ApiResponse, Page } from '../types/api'
import type { OrderDetail, OrderQuery, OrderStatus, OrderSummary } from '../types/order'
import type { ProductType } from '../types/product'

/** GET /api/provider/dashboard (ProviderDashboardResponse) */
export interface SellerDashboard {
  totalOrders: number
  soldOrders: number
  cancelledOrders: number
  pendingOrders: number
  listRevenue: number
  discountTotal: number
  revenue: number
  variants: Array<{ variantId: string; productName: string; variantName: string; soldQuantity: number; cancelledQuantity: number; soldOrders: number; cancelledOrders: number }>
  topBuyers: Array<{ customerId: string; fullName: string; email: string; quantity: number; orders: number }>
  topCancellers: Array<{ customerId: string; fullName: string; email: string; quantity: number; orders: number }>
}

export type SellerProductStatus = 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'ARCHIVED'

/** ProductResponse (view PROVIDER: có số tồn) */
export interface SellerProduct {
  id: string
  name: string
  description: string | null
  productType: ProductType
  status: SellerProductStatus
  primaryImageUrl: string | null
  variants: Array<{
    id: string
    variantName: string
    sku: string
    price: number
    stockQuantity: number | null
    weightGram: number | null
    boxCapacity: number | null
    status: 'IN_STOCK' | 'OUT_OF_STOCK'
  }>
}

export interface ProductInput {
  name: string
  description?: string
  productType: ProductType
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
}

export interface VariantInput {
  variantName: string
  sku: string
  price: number
  stockQuantity?: number
  weightGram?: number
  boxCapacity?: number
}

export type ComplianceDocType = 'FOOD_SAFETY_CERT' | 'BUSINESS_LICENSE' | 'IDENTITY_KYC'

export interface ComplianceDoc {
  id: string
  documentType: ComplianceDocType
  documentUrl: string
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  rejectionReason: string | null
  verifiedAt: string | null
  submittedAt: string
}

const P = '/provider/products'

/** API khu vực seller: BE2 sản phẩm/kho, BE4 đơn, BE3 vòng đời đơn, BE1 hồ sơ thẩm định */
export const sellerService = {
  dashboard: () => unwrap(http.get<ApiResponse<SellerDashboard>>('/provider/dashboard')),

  orders: (query: OrderQuery = {}) =>
    unwrap(http.get<ApiResponse<Page<OrderSummary>>>('/provider/orders', { params: query })),
  confirmDeposit: (id: string, receivedAmount: number) =>
    unwrap(http.post<ApiResponse<OrderDetail>>(`/provider/orders/${id}/confirm-deposit`, { receivedAmount })),
  changeStatus: (id: string, status: OrderStatus, collectedAmount?: number) =>
    unwrap(http.patch<ApiResponse<OrderDetail>>(`/provider/orders/${id}/status`, { status, collectedAmount })),

  products: () => unwrap(http.get<ApiResponse<SellerProduct[]>>(P)),
  createProduct: (body: ProductInput) => unwrap(http.post<ApiResponse<SellerProduct>>(P, body)),
  updateProduct: (id: string, body: ProductInput) => unwrap(http.put<ApiResponse<SellerProduct>>(`${P}/${id}`, body)),
  /** Thay album bằng một ảnh đại diện (URL hoặc data URI, BE giới hạn 2MB ký tự) */
  setImage: (id: string, imageUrl: string) =>
    unwrap(http.put<ApiResponse<SellerProduct>>(`${P}/${id}/images`, { images: [{ imageUrl, isPrimary: true, displayOrder: 0 }] })),
  archiveProduct: (id: string) => unwrap(http.post<ApiResponse<SellerProduct>>(`${P}/${id}/archive`)),
  addVariant: (productId: string, body: VariantInput) => unwrap(http.post<ApiResponse<unknown>>(`${P}/${productId}/variants`, body)),
  /** Sửa phân loại: SKU/khối lượng/sức chứa gửi lại giá trị cũ; tồn chỉ sửa được khi sản phẩm còn nháp */
  updateVariant: (productId: string, variantId: string, body: VariantInput) =>
    unwrap(http.put<ApiResponse<unknown>>(`${P}/${productId}/variants/${variantId}`, body)),
  importStock: (productId: string, variantId: string, quantity: number, reason: string) =>
    unwrap(http.post<ApiResponse<unknown>>(`${P}/${productId}/variants/${variantId}/imports`, { quantity, reason })),
  markOutOfStock: (productId: string, variantId: string, reason: string) =>
    unwrap(http.post<ApiResponse<unknown>>(`${P}/${productId}/variants/${variantId}/terminate`, { reason })),

  documents: () => unwrap(http.get<ApiResponse<ComplianceDoc[]>>('/provider/compliance')),
  uploadDocument: (documentType: ComplianceDocType, file: File) => {
    const form = new FormData()
    form.append('documentType', documentType)
    form.append('file', file)
    return unwrap(http.post<ApiResponse<ComplianceDoc>>('/provider/compliance/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }))
  },
}

export type PromotionType = 'PERCENT_OFF' | 'BUY_X_GET_Y'

/** PromotionController.PromotionResponse */
export interface Promotion {
  id: string
  providerId: string
  storeName: string
  productId: string | null
  productName: string | null
  name: string
  type: PromotionType
  minQuantity: number | null
  percentOff: number | null
  buyQuantity: number | null
  freeQuantity: number | null
  startDate: string
  endDate: string
  active: boolean
  /** Đang chạy hôm nay */
  running: boolean
  /** Nhãn cho khách, vd "Mua 3 tặng 1" */
  label: string
}

export interface PromotionInput {
  name: string
  type: PromotionType
  productId?: string
  minQuantity?: number
  percentOff?: number
  buyQuantity?: number
  freeQuantity?: number
  startDate: string
  endDate: string
  active?: boolean
}

/** Sự kiện khuyến mãi: seller quản lý, khách xem nhãn đang chạy */
export const promotionService = {
  mine: () => unwrap(http.get<ApiResponse<Promotion[]>>('/provider/promotions')),
  create: (body: PromotionInput) => unwrap(http.post<ApiResponse<Promotion>>('/provider/promotions', body)),
  update: (id: string, body: PromotionInput) => unwrap(http.put<ApiResponse<Promotion>>(`/provider/promotions/${id}`, body)),
  remove: (id: string) => unwrap(http.delete<ApiResponse<null>>(`/provider/promotions/${id}`)),
  /** Công khai: khuyến mãi đang chạy hôm nay */
  running: (providerId?: string) => unwrap(http.get<ApiResponse<Promotion[]>>('/public/promotions', { params: { providerId } })),
}
