import { http, unwrap } from '../apis/http'
import { MAX_RETAIL_QUANTITY } from '../constants'
import type { ApiResponse, Page } from '../types/api'
import type { Product, ProductType } from '../types/product'

export interface ProductQuery {
  type?: ProductType
  page?: number
  size?: number
  /** Trường của Product ở BE: createdAt | name */
  sortBy?: 'createdAt' | 'name'
  direction?: 'asc' | 'desc'
}

/** ProductResponse của BE2 (chỉ các trường FE dùng) */
interface BeProduct {
  id: string
  providerId: string
  storeName: string
  name: string
  description: string | null
  story: string | null
  ingredients: string | null
  productType: ProductType
  status: 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'ARCHIVED'
  createdAt: string
  primaryImageUrl: string | null
  salePrice: number
  listPrice: number
  assembledQuantity: number
  images: Array<{ imageUrl: string; displayOrder: number }> | null
  components: Array<{ productName: string; variantName: string; productType: ProductType; perSetQuantity: number | null; price: number }> | null
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


const toProduct = (p: BeProduct): Product => {
  const gallery = [...(p.images ?? [])].sort((a, b) => a.displayOrder - b.displayOrder).map((i) => i.imageUrl)
  return {
    id: p.id,
    providerId: p.providerId,
    storeName: p.storeName,
    name: p.name,
    description: p.description,
    story: p.story,
    ingredients: p.ingredients,
    productType: p.productType,
    status: p.status === 'ACTIVE' ? 'ACTIVE' : 'OUT_OF_STOCK',
    createdAt: p.createdAt,
    imageUrl: p.primaryImageUrl ?? gallery[0] ?? null,
    imageAlt: p.name,
    gallery,
    components: p.components ?? undefined,
    // Set quà không có variant: dựng 1 "variant" ảo mang id của set, giá bán set và số set đã đóng sẵn
    variants: p.productType === 'GIFT_SET'
      ? [{
          id: p.id,
          variantName: 'Set quà',
          sku: '',
          price: p.salePrice || p.listPrice,
          weightGram: null,
          boxCapacity: null,
          stockQuantity: p.assembledQuantity,
          status: p.assembledQuantity > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
        }]
      : p.variants.map((v) => ({
      id: v.id,
      variantName: v.variantName,
      sku: v.sku,
      price: v.price,
      weightGram: v.weightGram,
      boxCapacity: v.boxCapacity,
      // BE công khai không trả số tồn, chỉ `purchasable`: giới hạn mỗi loại theo đơn lẻ; BE vẫn chặn khi thiếu hàng
      stockQuantity: v.purchasable ? MAX_RETAIL_QUANTITY : 0,
      status: v.purchasable ? 'ACTIVE' : 'OUT_OF_STOCK',
    })),
  }
}

export const productService = {
  list: async ({ type, page = 0, size = 12, sortBy, direction }: ProductQuery = {}): Promise<Page<Product>> => {
    const res = await unwrap(http.get<ApiResponse<Page<BeProduct>>>('/products', { params: { type, page, size, sortBy, direction } }))
    return { ...res, content: res.content.map(toProduct) }
  },

  detail: async (id: string): Promise<Product> =>
    toProduct(await unwrap(http.get<ApiResponse<BeProduct>>(`/products/${id}`))),
}
