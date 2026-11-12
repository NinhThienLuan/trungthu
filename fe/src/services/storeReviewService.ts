import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'

export interface StoreReview {
  id: string
  orderId: string
  providerId: string
  customerName: string
  rating: number
  comment: string | null
  createdAt: string
}

export const storeReviewService = {
  byStore: (providerId: string) => unwrap(http.get<ApiResponse<StoreReview[]>>(`/public/stores/${providerId}/reviews`)),
  create: (orderId: string, rating: number, comment: string) =>
    unwrap(http.post<ApiResponse<StoreReview>>('/store-reviews', { orderId, rating, comment })),
}
