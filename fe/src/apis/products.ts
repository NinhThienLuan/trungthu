import { http, unwrap } from './http'
import { USE_MOCK, delay } from './mock'
import { MOCK_PRODUCTS } from './mockData'
import type { ApiResponse, Page } from '../types/api'
import type { Product, ProductType } from '../types/product'

export interface ProductQuery {
  type?: ProductType
  page?: number
  size?: number
}

export const productApi = {
  list: async ({ type, page = 0, size = 12 }: ProductQuery = {}): Promise<Page<Product>> => {
    if (!USE_MOCK.products) {
      return unwrap(http.get<ApiResponse<Page<Product>>>('/products', { params: { type, page, size } }))
    }
    await delay(300)
    const all = MOCK_PRODUCTS.filter((p) => !type || p.productType === type)
    const totalPages = Math.max(1, Math.ceil(all.length / size))
    return {
      content: all.slice(page * size, page * size + size),
      page,
      size,
      totalElements: all.length,
      totalPages,
      first: page === 0,
      last: page >= totalPages - 1,
    }
  },

  detail: async (id: string): Promise<Product> => {
    if (!USE_MOCK.products) {
      return unwrap(http.get<ApiResponse<Product>>(`/products/${id}`))
    }
    await delay(200)
    const product = MOCK_PRODUCTS.find((p) => p.id === id)
    if (!product) throw new Error('Không tìm thấy sản phẩm')
    return product
  },
}
