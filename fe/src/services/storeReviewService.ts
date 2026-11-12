import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'

export interface StoreReview {
  id?: string
  orderId: string
  providerId: string
  customerName: string
  rating: number
  comment: string | null
  createdAt: string
}

export const storeReviewService = {
  store: (providerId: string) => unwrap(http.get<ApiResponse<{ id: string; name: string }>>(`/public/stores/${providerId}`)),
  byStore: (providerId: string) => unwrap(http.get<ApiResponse<StoreReview[]>>(`/public/stores/${providerId}/reviews`)),
  list: (providerId: string) => unwrap(http.get<ApiResponse<StoreReview[]>>(`/public/stores/${providerId}/reviews`)),
  create: (providerOrOrderId: string, orderIdOrRating: string | number, ratingOrComment?: number | string, comment?: string) => {
    if (typeof orderIdOrRating === 'string') {
      return unwrap(http.post<ApiResponse<StoreReview>>(`/stores/${providerOrOrderId}/reviews`, {
        orderId: orderIdOrRating,
        rating: Number(ratingOrComment),
        comment: comment ?? '',
      }))
    }
    return unwrap(http.post<ApiResponse<StoreReview>>('/store-reviews', {
      orderId: providerOrOrderId,
      rating: Number(orderIdOrRating),
      comment: typeof ratingOrComment === 'string' ? ratingOrComment : '',
    }))
  },
}
