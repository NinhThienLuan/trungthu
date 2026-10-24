import { http, unwrap } from '../apis/http'
import { USE_MOCK, delay } from '../apis/mock'
import { MOCK_PRODUCTS } from '../apis/mockData'
import type { ApiResponse, Page } from '../types/api'
import type { Product, ProductType } from '../types/product'

export interface ProductQuery {
  type?: ProductType
  page?: number
  size?: number
}

/** ProductResponse của BE2 (chỉ các trường FE dùng) */
interface BeProduct {
  id: string
  providerId: string
  storeName: string
  name: string
  description: string | null
  productType: ProductType | 'GIFT_SET'
  status: 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'ARCHIVED'
  createdAt: string
  primaryImageUrl: string | null
  images: Array<{ imageUrl: string; displayOrder: number }> | null
  variants: Array<{
    id: string
    variantName: string
    sku: string
    price: number
    weightGram: number | null
    boxCapacity: number | null
    purchasable: boolean
  }>
}

// ponytail: BE không trả số tồn, chỉ `purchasable` -> giới hạn tạm số lượng trong giỏ; BE vẫn chặn khi checkout nếu thiếu hàng
const STOCK_WHEN_PURCHASABLE = 99

const toProduct = (p: BeProduct): Product => {
  const gallery = [...(p.images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder).map((i) => i.imageUrl)
  return {
    id: p.id,
    providerId: p.providerId,
    storeName: p.storeName,
    name: p.name,
    description: p.description,
    productType: p.productType as ProductType,
    status: p.status === 'ACTIVE' ? 'ACTIVE' : 'OUT_OF_STOCK',
    createdAt: p.createdAt,
    imageUrl: p.primaryImageUrl ?? gallery[0] ?? null,
    imageAlt: p.name,
    gallery,
    variants: p.variants.map((v) => ({
      id: v.id,
      variantName: v.variantName,
      sku: v.sku,
      price: v.price,
      weightGram: v.weightGram,
      boxCapacity: v.boxCapacity,
      stockQuantity: v.purchasable ? STOCK_WHEN_PURCHASABLE : 0,
      status: v.purchasable ? 'ACTIVE' : 'OUT_OF_STOCK',
    })),
  }
}

// Set quà (GIFT_SET) không có variant, mà checkout BE3 chỉ nhận variantId -> chưa bán được, ẩn khỏi danh mục
const sellable = (p: BeProduct) => p.productType !== 'GIFT_SET'

export const productService = {
  list: async ({ type, page = 0, size = 12 }: ProductQuery = {}): Promise<Page<Product>> => {
    if (!USE_MOCK.products) {
      const res = await unwrap(http.get<ApiResponse<Page<BeProduct>>>('/products', { params: { type, page, size } }))
      return { ...res, content: res.content.filter(sellable).map(toProduct) }
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
      return toProduct(await unwrap(http.get<ApiResponse<BeProduct>>(`/products/${id}`)))
    }
    await delay(200)
    const product = MOCK_PRODUCTS.find((p) => p.id === id)
    if (!product) throw new Error('Không tìm thấy sản phẩm')
    return product
  },
}
