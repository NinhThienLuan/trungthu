import { http, unwrap } from '../apis/http'
import type { ApiResponse } from '../types/api'

export interface ProductReviewItem {
  id: string
  productId: string
  orderId: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

export interface ProductReviewSummary {
  averageRating: number
  totalReviews: number
  reviews: ProductReviewItem[]
}

export const productReviewService = {
  /** Danh sách đánh giá công khai cho một sản phẩm */
  list: (productId: string) =>
    unwrap(http.get<ApiResponse<ProductReviewSummary>>(`/public/products/${productId}/reviews`)),

  /** Khách gửi đánh giá bánh sau khi hoàn tất đơn */
  create: (productId: string, orderId: string, rating: number, comment: string) =>
    unwrap(http.post<ApiResponse<ProductReviewItem>>(`/products/${productId}/reviews`, { orderId, rating, comment })),

  /** Lấy danh sách ID các sản phẩm đã được đánh giá trong đơn hàng này */
  reviewedProductIds: (orderId: string) =>
    unwrap(http.get<ApiResponse<string[]>>(`/orders/${orderId}/product-reviews`)),
}
