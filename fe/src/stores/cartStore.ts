import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  variantId: string
  productId: string
  providerId: string
  storeName: string
  productName: string
  variantName: string
  unitPrice: number
  stock: number
  quantity: number
}

export interface CartGroup {
  providerId: string
  storeName: string
  items: CartItem[]
  subtotal: number
}

interface CartState {
  items: CartItem[]
  /** Ngày nhận đã chọn cho từng Provider (yyyy-MM-dd) */
  deliveryDates: Record<string, string>
  add: (item: Omit<CartItem, 'quantity'>, quantity: number) => void
  setQuantity: (variantId: string, quantity: number) => void
  remove: (variantId: string) => void
  setDeliveryDate: (providerId: string, date: string) => void
  clear: () => void
}

const clamp = (value: number, max: number) => Math.max(1, Math.min(value, Math.max(max, 1)))

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      deliveryDates: {},

      add: (item, quantity) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: clamp(i.quantity + quantity, item.stock) } : i,
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: clamp(quantity, item.stock) }] }
        }),

      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.variantId === variantId ? { ...i, quantity: clamp(quantity, i.stock) } : i)),
        })),

      remove: (variantId) =>
        set((state) => {
          const items = state.items.filter((i) => i.variantId !== variantId)
          // Bỏ ngày nhận của shop không còn món nào
          const providers = new Set(items.map((i) => i.providerId))
          const deliveryDates = Object.fromEntries(
            Object.entries(state.deliveryDates).filter(([providerId]) => providers.has(providerId)),
          )
          return { items, deliveryDates }
        }),

      setDeliveryDate: (providerId, date) =>
        set((state) => ({ deliveryDates: { ...state.deliveryDates, [providerId]: date } })),

      clear: () => set({ items: [], deliveryDates: {} }),
    }),
    { name: 'cart' },
  ),
)

/** Gom giỏ theo Provider — mỗi nhóm sẽ thành 1 đơn con khi checkout */
export function groupByProvider(items: CartItem[]): CartGroup[] {
  const groups = new Map<string, CartGroup>()
  for (const item of items) {
    const group = groups.get(item.providerId) ?? {
      providerId: item.providerId,
      storeName: item.storeName,
      items: [],
      subtotal: 0,
    }
    group.items.push(item)
    group.subtotal += item.unitPrice * item.quantity
    groups.set(item.providerId, group)
  }
  return [...groups.values()]
}

export const cartCount = (items: CartItem[]) => items.reduce((sum, i) => sum + i.quantity, 0)
