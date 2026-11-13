import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'
import type { BulkOrderResponse, QuoteResponse, RfqRequest, RfqResponse, SubmitQuoteRequest } from '../types/order'

export const rfqService = {
  earliestDelivery: (boxes: number, cakesPerBox: number, providerId?: string) =>
    unwrap(http.get<ApiResponse<{ earliestDeliveryDate: string; providerId: string; cakeQuantity: number; productionDays: number }>>(
      '/rfqs/earliest-delivery', { params: { boxes, cakesPerBox, ...(providerId ? { providerId } : {}) } })),
  /** BE3: POST /api/rfqs (CUSTOMER) */
  submit: (body: RfqRequest) => unwrap(http.post<ApiResponse<RfqResponse>>('/rfqs', body)),
  mine: () => unwrap(http.get<ApiResponse<RfqResponse[]>>('/rfqs/me')),
  providerFeed: () => unwrap(http.get<ApiResponse<RfqResponse[]>>('/provider/rfqs')),
  providerQuotes: () => unwrap(http.get<ApiResponse<QuoteResponse[]>>('/provider/rfqs/quotes/me')),
  submitQuote: (requestId: string, body: SubmitQuoteRequest) =>
    unwrap(http.post<ApiResponse<QuoteResponse>>(`/provider/rfqs/${requestId}/quotes`, body)),
  reviseQuote: (requestId: string, quoteId: string, body: SubmitQuoteRequest) =>
    unwrap(http.put<ApiResponse<QuoteResponse>>(`/provider/rfqs/${requestId}/quotes/${quoteId}`, body)),
  quotes: (requestId: string) => unwrap(http.get<ApiResponse<QuoteResponse[]>>(`/rfqs/${requestId}/quotes`)),
  acceptQuote: (requestId: string, quoteId: string) =>
    unwrap(http.post<ApiResponse<QuoteResponse>>(`/rfqs/${requestId}/quotes/${quoteId}/accept`)),
  /** Chia RFQ cho nhiều xưởng: mỗi xưởng một đơn sỉ con với số hộp khách chọn */
  acceptQuotes: (requestId: string, items: { quoteId: string; quantity: number }[]) =>
    unwrap(http.post<ApiResponse<QuoteResponse[]>>(`/rfqs/${requestId}/accept`, { items })),
  /** Mở RFQ mới cho phần hộp đơn tổng còn thiếu (chốt chưa đủ hoặc một xưởng bị huỷ) */
  reorderShortfall: (requestId: string) => unwrap(http.post<ApiResponse<RfqResponse>>(`/rfqs/${requestId}/shortfall`)),
  buyerOrders: () => unwrap(http.get<ApiResponse<BulkOrderResponse[]>>('/bulk-orders/me')),
  providerOrders: () => unwrap(http.get<ApiResponse<BulkOrderResponse[]>>('/provider/bulk-orders')),
  delivery: (id: string, body: { recipientName: string; recipientPhone: string; deliveryAddress: string }) =>
    unwrap(http.put<ApiResponse<BulkOrderResponse>>(`/bulk-orders/${id}/delivery`, body)),
  cancelOrder: (id: string) => unwrap(http.post<ApiResponse<BulkOrderResponse>>(`/bulk-orders/${id}/cancel`)),
  confirmDeposit: (id: string) => unwrap(http.post<ApiResponse<BulkOrderResponse>>(`/provider/bulk-orders/${id}/deposit`)),
  completeDay: (id: string, dayId: string) =>
    unwrap(http.post<ApiResponse<BulkOrderResponse>>(`/provider/bulk-orders/${id}/days/${dayId}/complete`)),
  dispatch: (id: string) => unwrap(http.post<ApiResponse<BulkOrderResponse>>(`/provider/bulk-orders/${id}/dispatch`)),
  delivered: (id: string) => unwrap(http.post<ApiResponse<BulkOrderResponse>>(`/provider/bulk-orders/${id}/delivered`)),
  confirmBalance: (id: string) => unwrap(http.post<ApiResponse<BulkOrderResponse>>(`/provider/bulk-orders/${id}/balance`)),
}
