import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'

export interface StoreReview {
  orderId: string
  providerId: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

export const storeReviewService = {
  store: (providerId: string) => unwrap(http.get<ApiResponse<{ id: string; name: string }>>(`/public/stores/${providerId}`)),
  list: (providerId: string) => unwrap(http.get<ApiResponse<StoreReview[]>>(`/public/stores/${providerId}/reviews`)),
  create: (providerId: string, orderId: string, rating: number, comment: string) =>
    unwrap(http.post<ApiResponse<StoreReview>>(`/stores/${providerId}/reviews`, { orderId, rating, comment })),
}
