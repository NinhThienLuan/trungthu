import { http, unwrap } from '../apis/http'
import type { ApiResponse, Page } from '../types/api'
import type { CheckoutPreview, CheckoutRequest, OrderDetail, OrderQuery, OrderSummary, VietQrInstruction } from '../types/order'

/**
 * Đơn hàng theo hợp đồng BE (backend-ownership-and-order-contract.md):
 * - BE4: GET /api/orders/me, GET /api/orders/{id}
 * - BE3: POST /api/checkout/preview, POST /api/checkout, GET /api/orders/{id}/vietqr, POST /api/orders/{id}/cancel
 */
export const orderService = {
  /** Chỉ đọc, không giữ hàng / năng lực nướng */
  preview: (body: CheckoutRequest): Promise<CheckoutPreview> =>
    unwrap(http.post<ApiResponse<CheckoutPreview>>('/checkout/preview', body)),

  /**
   * Mỗi nhóm (xưởng / người nhận) một Order. Một nhóm lỗi -> BE rollback toàn bộ,
   * trả 409 (hết hàng / hết năng lực nướng) hoặc 400 (đầu vào sai).
   */
  checkout: (body: CheckoutRequest): Promise<OrderDetail[]> =>
    unwrap(http.post<ApiResponse<OrderDetail[]>>('/checkout', body)),

  /** Thông tin chuyển khoản của đúng đơn và đúng tài khoản seller */
  vietQr: (id: string): Promise<VietQrInstruction> =>
    unwrap(http.get<ApiResponse<VietQrInstruction>>(`/orders/${id}/vietqr`)),

  /** Phân trang, lọc trạng thái và ngày nhận (from/to gồm cả hai đầu) */
  myOrders: ({ page = 0, size = 10, status, from, to }: OrderQuery = {}): Promise<Page<OrderSummary>> =>
    unwrap(http.get<ApiResponse<Page<OrderSummary>>>('/orders/me', { params: { page, size, status, from, to } })),

  /** Ngoài phạm vi trả 404 */
  detail: (id: string): Promise<OrderDetail> => unwrap(http.get<ApiResponse<OrderDetail>>(`/orders/${id}`)),

  /** Chỉ khi PENDING_DEPOSIT hoặc CONFIRMED (COD chưa sản xuất) */
  cancel: (id: string): Promise<OrderDetail> => unwrap(http.post<ApiResponse<OrderDetail>>(`/orders/${id}/cancel`)),
}
