export type ProductType = 'LOOSE_CAKE' | 'BOX_SHELL' | 'GREETING_CARD' | 'ADDON_SERVICE'
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
  productType: ProductType
  shelfLifeDays: number | null
  status: ProductStatus
  createdAt: string
  variants: ProductVariant[]
}
