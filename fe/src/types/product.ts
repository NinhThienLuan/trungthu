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
  /** Thông tin trình bày theo bản Stitch (BE chưa có các trường này) */
  display?: ProductDisplay
}

export interface ProductDisplay {
  badgeIcon: string // tên icon Material, vd 'schedule'
  badgeLabel: string // vd 'Mới ra lò 05:00'
  rating: string
  reviews: string // vd '(184)'
  packLabel: string // vd 'Hộp 4 Bánh Ngự Thiện'
  weightLabel: string // vd 'Trọng lượng 880g'
  oldPrice: number
  unit: string // vd '/hộp'
  wholesaleLabel: string // vd 'Sỉ >100: 600.000 đ'
  discountLabel: string // vd 'Chiết khấu 20%'
  tiers: string[] // 3 bậc giá sỉ
  /** Nút "Chọn quy cách hộp quà" ở trang chi tiết, mỗi nút ứng với 1 variant */
  configs?: Array<{ variantId: string; label: string; title: string; sub: string }>
}
