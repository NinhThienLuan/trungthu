import { productService } from '../services/productService'
import { groupByProvider, type CartItem } from '../stores/cartStore'
import { leadDaysForItems } from '../lib/checkoutGroups'
import { toIsoDate } from '../lib/format'
import type { LeadTime } from '../types/product'
import { useApi } from './useApi'

/** variantId -> số lượng như BE tính: hộp tự phối = vỏ hộp + từng bánh trong ô; set quà không gửi (giữ hàng riêng) */
function linesOf(items: CartItem[]): Record<string, number> {
  const lines: Record<string, number> = {}
  const add = (variantId: string, quantity: number) => { lines[variantId] = (lines[variantId] ?? 0) + quantity }
  for (const item of items) {
    if (item.setProductId) continue
    add(item.variantId, item.quantity)
    item.slots?.forEach((slot) => add(slot.variantId, item.quantity))
  }
  return lines
}

const daysUntil = (iso: string) => Math.round((Date.parse(iso) - Date.parse(toIsoDate(new Date()))) / 86_400_000)

/**
 * Ngày nhận sớm nhất mỗi xưởng theo tồn kho thật (BE /products/lead-time):
 * đủ hàng sẵn -> từ ngày mai; vượt số có sẵn -> nướng theo đơn. Chưa có kết quả thì dùng ước lượng cục bộ.
 */
export function useLeadTimes(items: CartItem[]) {
  const groups = groupByProvider(items)
  const requests = groups.map((g) => [g.providerId, linesOf(g.items)] as const)
  const { data } = useApi(() => Promise.all(requests.map(async ([providerId, lines]) =>
    [providerId, Object.keys(lines).length ? await productService.leadTime(lines).catch(() => null) : null] as const)),
  [JSON.stringify(requests)])
  const leadTimes: Record<string, LeadTime | null> = Object.fromEntries(data ?? [])

  const leadDays = (group: { providerId: string; items: CartItem[] }) => {
    const lead = leadTimes[group.providerId]
    return Math.max(leadDaysForItems(group.items), lead ? daysUntil(lead.earliestDelivery) : 0)
  }
  return { leadDays, leadTimes }
}
