import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'
import type { QuoteResponse, RfqRequest, RfqResponse, SubmitQuoteRequest } from '../types/order'

export const rfqService = {
  /** BE3: POST /api/rfqs (CUSTOMER) */
  submit: (body: RfqRequest) => unwrap(http.post<ApiResponse<RfqResponse>>('/rfqs', body)),
  mine: () => unwrap(http.get<ApiResponse<RfqResponse[]>>('/rfqs/me')),
  providerFeed: () => unwrap(http.get<ApiResponse<RfqResponse[]>>('/provider/rfqs')),
  providerQuotes: () => unwrap(http.get<ApiResponse<QuoteResponse[]>>('/provider/rfqs/quotes/me')),
  submitQuote: (requestId: string, body: SubmitQuoteRequest) =>
    unwrap(http.post<ApiResponse<QuoteResponse>>(`/provider/rfqs/${requestId}/quotes`, body)),
  quotes: (requestId: string) => unwrap(http.get<ApiResponse<QuoteResponse[]>>(`/rfqs/${requestId}/quotes`)),
  acceptQuote: (requestId: string, quoteId: string) =>
    unwrap(http.post<ApiResponse<QuoteResponse>>(`/rfqs/${requestId}/quotes/${quoteId}/accept`)),
}
