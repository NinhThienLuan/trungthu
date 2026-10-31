import { BULK_LEAD_DAYS, BULK_ORDER_QUANTITY, MIN_LEAD_DAYS } from '../constants'
import { groupByProvider, type CartItem } from '../stores/cartStore'
import type { CheckoutGroup } from '../types/order'

export type PayChoice = 'COD' | 'MIN_DEPOSIT' | 'FULL'

export const leadDaysForItems = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0) >= BULK_ORDER_QUANTITY
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
      items: group.items.filter((item) => item.kind === 'single').map((item) =>
        item.setProductId ? { setProductId: item.setProductId, quantity: item.quantity }
          : { variantId: item.variantId, quantity: item.quantity }),
      boxes: group.items.filter((item) => item.kind === 'box').map((item) => ({
        boxVariantId: item.variantId, quantity: item.quantity,
        cakeVariantIds: (item.slots ?? []).map((slot) => slot.variantId), note: item.note,
      })),
    }
  })
