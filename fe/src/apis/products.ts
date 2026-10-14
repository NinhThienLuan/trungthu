import { http, unwrap } from './http'
import type { ApiResponse, Page } from '../types/api'
import type { Product, ProductType } from '../types/product'

export interface ProductQuery {
  type?: ProductType
  page?: number
  size?: number
}

export const productApi = {
  list: ({ type, page = 0, size = 12 }: ProductQuery = {}) =>
    unwrap(http.get<ApiResponse<Page<Product>>>('/products', { params: { type, page, size } })),

  detail: (id: string) => unwrap(http.get<ApiResponse<Product>>(`/products/${id}`)),
}
