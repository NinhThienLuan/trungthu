import { BULK_LEAD_DAYS, BULK_ORDER_QUANTITY, MIN_LEAD_DAYS } from '../constants'
import { groupByProvider, type CartItem } from '../stores/cartStore'
import type { CheckoutGroup } from '../types/order'

export type PayChoice = 'COD' | 'MIN_DEPOSIT' | 'FULL'

// Hộp tự phối = vỏ + bánh từng ô (BE đếm cả hai vào số lượng đơn)
const unitsOf = (item: CartItem) => item.quantity * (item.kind === 'box' ? 1 + (item.slots?.length ?? 0) : 1)

export const leadDaysForItems = (items: CartItem[]) =>
  items.reduce((total, item) => total + unitsOf(item), 0) >= BULK_ORDER_QUANTITY
    || items.some((item) => item.canPreorder && item.quantity > item.stock)
    ? BULK_LEAD_DAYS : MIN_LEAD_DAYS

export const toCheckoutGroups = (cart: CartItem[], dates: Record<string, string>,
  choices: Record<string, PayChoice>): CheckoutGroup[] =>
  groupByProvider(cart).map((group) => {
    const choice = choices[group.providerId] ?? 'MIN_DEPOSIT'
    return {
      providerId: group.providerId,
      deliveryDate: dates[group.providerId],
      paymentMethod: choice === 'COD' ? 'COD' : 'VIETQR',
      depositOption: choice === 'COD' ? undefined : choice,
      // Hộp tự phối = dòng vỏ hộp kèm vị từng ô (BE: Item.boxContents)
      items: group.items.map((item) =>
        item.setProductId ? { setProductId: item.setProductId, quantity: item.quantity }
          : item.kind === 'box'
            ? { variantId: item.variantId, quantity: item.quantity, boxContents: (item.slots ?? []).map((slot) => slot.variantId) }
            : { variantId: item.variantId, quantity: item.quantity }),
    }
  })
