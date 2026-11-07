export type ProductType = 'LOOSE_CAKE' | 'BOX_SHELL' | 'GREETING_CARD' | 'ADDON_SERVICE' | 'GIFT_SET'
export type ProductStatus = 'ACTIVE' | 'HIDDEN' | 'OUT_OF_STOCK'

export interface ProductVariant {
  id: string
  variantName: string
  sku: string
  price: number
  stockQuantity: number
  weightGram: number | null
  boxCapacity: number | null
  status: ProductStatus
  /** Trạng thái cho khách, không lộ số tồn (BE ProductVariantResponse.availability) */
  availability?: VariantAvailability
}

export type VariantAvailability = 'READY' | 'LOW' | 'BAKE_TO_ORDER' | 'UNAVAILABLE'

/** GET /api/products/lead-time: ngày nhận sớm nhất cho số lượng đã chọn */
export interface LeadTime {
  earliestDelivery: string
  bakeToOrder: string[]
  unavailable: string[]
}

export interface Product {
  id: string
  providerId: string
  storeName: string
  name: string
  description: string | null
  /** Câu chuyện, nguyên liệu/dinh dưỡng do xưởng nhập */
  story?: string | null
  ingredients?: string | null
  productType: ProductType
  status: ProductStatus
  createdAt: string
  /** Ảnh đại diện (BE: primaryImageUrl) */
  imageUrl?: string | null
  imageAlt?: string
  /** Toàn bộ ảnh theo thứ tự hiển thị (BE: images) */
  gallery?: string[]
  variants: ProductVariant[]
  /** Set quà: thành phần mỗi set (vỏ hộp + từng loại bánh) */
  components?: SetComponent[]
}


/** BE GiftSetComponentResponse (phần FE dùng) */
export interface SetComponent {
  productName: string
  variantName: string
  productType: ProductType
  perSetQuantity: number | null
  price: number
}
