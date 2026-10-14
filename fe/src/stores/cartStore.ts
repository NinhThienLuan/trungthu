import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Một bánh đặt vào 1 ô của hộp tự phối */
export interface BoxSlot {
  variantId: string
  productName: string
  variantName: string
  unitPrice: number
  imageUrl?: string | null
}

export interface CartItem {
  /** Khoá dòng: bánh lẻ = variantId; hộp tự phối = id ngẫu nhiên (cùng 1 vỏ hộp có thể khác bánh bên trong) */
  lineId: string
  kind: 'single' | 'box'
  variantId: string // bánh lẻ: variant đó; hộp: variant vỏ hộp
  productId: string
  providerId: string
  storeName: string
  productName: string
  variantName: string
  /** Giá 1 đơn vị: bánh lẻ = giá variant; hộp = giá vỏ + tổng giá bánh trong hộp */
  unitPrice: number
  stock: number
  quantity: number
  imageUrl?: string | null
  /** Chỉ có ở hộp tự phối */
  slots?: BoxSlot[]
  note?: string
  /** Bảng tách giá 1 hộp (quy cách, vỏ hộp, logo, trà, chiết khấu) để hiện ở checkout */
  priceLines?: Array<{ label: string; amount: number }>
}

export interface CartGroup {
  providerId: string
  storeName: string
  items: CartItem[]
  subtotal: number
}

type NewItem = Omit<CartItem, 'quantity' | 'lineId' | 'kind'>

interface CartState {
  items: CartItem[]
  /** Ngày nhận đã chọn cho từng Provider (yyyy-MM-dd) */
  deliveryDates: Record<string, string>
  add: (item: NewItem, quantity: number) => void
  addBox: (item: NewItem & { slots: BoxSlot[]; note?: string }, quantity: number) => void
  setQuantity: (lineId: string, quantity: number) => void
  remove: (lineId: string) => void
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
          const existing = state.items.find((i) => i.lineId === item.variantId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === item.variantId ? { ...i, quantity: clamp(i.quantity + quantity, item.stock) } : i,
              ),
            }
          }
          const line: CartItem = { ...item, lineId: item.variantId, kind: 'single', quantity: clamp(quantity, item.stock) }
          return { items: [...state.items, line] }
        }),

      addBox: (item, quantity) =>
        set((state) => ({
          items: [...state.items, { ...item, lineId: crypto.randomUUID(), kind: 'box', quantity: clamp(quantity, item.stock) }],
        })),

      setQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.lineId === lineId ? { ...i, quantity: clamp(quantity, i.stock) } : i)),
        })),

      remove: (lineId) =>
        set((state) => {
          const items = state.items.filter((i) => i.lineId !== lineId)
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
    {
      name: 'cart',
      version: 1,
      // Giỏ lưu từ bản cũ (chưa có lineId/kind) -> coi là bánh lẻ
      migrate: (persisted) => {
        const state = persisted as { items?: CartItem[]; deliveryDates?: Record<string, string> }
        return {
          ...state,
          items: (state.items ?? []).map((i) => ({ ...i, lineId: i.lineId ?? i.variantId, kind: i.kind ?? 'single' })),
        } as CartState
      },
    },
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
