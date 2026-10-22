export type Role = 'CUSTOMER' | 'PROVIDER' | 'PLATFORM_ADMIN'

export interface User {
  id: string
  email: string
  fullName: string
  role: Role
  storeName?: string | null
}

export interface ProductImage {
  id: string
  imageUrl: string
  isPrimary: boolean
  displayOrder: number
}

export interface Variant {
  id: string
  variantName: string
  sku: string
  price: number
  stockQuantity?: number | null
  weightGram?: number | null
  boxCapacity?: number | null
  status: 'IN_STOCK' | 'OUT_OF_STOCK'
  purchasable: boolean
  notifyAvailable: boolean
  hasOrders?: boolean
  components?: GiftComponent[]
}

export interface GiftComponent {
  id: string
  variantId: string
  productId: string
  productName: string
  variantName: string
  productType: 'LOOSE_CAKE' | 'BOX_SHELL'
  perSetQuantity?: number
  quantity: number
  directQuantity?: number
  price: number
  weightGram?: number | null
  boxCapacity?: number | null
}

export interface Product {
  id: string
  providerId: string
  storeName?: string | null
  name: string
  description?: string | null
  productType: 'LOOSE_CAKE' | 'BOX_SHELL' | 'GIFT_SET' | 'GREETING_CARD' | 'ADDON_SERVICE'
  status: 'DRAFT' | 'ACTIVE' | 'SOLD_OUT' | 'ARCHIVED'
  primaryImageUrl?: string | null
  images: ProductImage[]
  discountPercent?: number | null
  discountAmount?: number | null
  discountAccepted?: boolean | null
  assembledQuantity?: number | null
  listPrice?: number | null
  salePrice?: number | null
  components?: GiftComponent[]
  variants: Variant[]
}

export interface Page<T> {
  content: T[]
  totalElements: number
}

export interface DummyOrder {
  id: string
  code: string
  status: string
  paymentStatus: string
  totalAmount: number
}

export interface OrderSummary {
  id: string
  code: string
  storeName?: string | null
  deliveryDate: string
  status: string
  paymentStatus: string
  totalAmount: number
  paidAmount: number
  createdAt: string
}

export interface CartLine {
  variantId?: string | null
  setProductId?: string | null
  productId: string
  productName: string
  variantName: string
  price: number
  quantity: number
  stockQuantity: number
  status: 'IN_STOCK' | 'OUT_OF_STOCK'
  selected: boolean
  buyable: boolean
}

export interface Audit {
  id: string
  type: string
  quantityDelta: number
  stockAfter: number
  reason?: string | null
  createdAt: string
  createdBy: string
}

