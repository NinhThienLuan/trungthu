import type { OrderLine } from '../types/order'

export interface DisplayOrderLine {
  key: string
  name: string
  quantity?: number
  unitPrice?: number
  boxContents?: string[]
  subtotal: number
  components?: OrderLine[]
}

/** BE lưu các thành phần để quản lý kho; khách mua set với một giá chung. */
export function displayOrderLines(lines: OrderLine[]): DisplayOrderLine[] {
  const result: DisplayOrderLine[] = []
  const sets = new Map<string, DisplayOrderLine>()

  lines.forEach((line, index) => {
    if (!line.sourceSetId) {
      result.push({ key: `${line.variantId}-${index}`, name: `${line.productName} · ${line.variantName}`,
        quantity: line.quantity, unitPrice: line.unitPrice, subtotal: line.subtotal, boxContents: line.boxContents })
      return
    }

    let set = sets.get(line.sourceSetId)
    if (!set) {
      set = { key: line.sourceSetId, name: line.sourceSetName || 'Set quà', quantity: line.quantity,
        subtotal: 0, components: [] }
      sets.set(line.sourceSetId, set)
      result.push(set)
    }
    set.subtotal += line.subtotal
    set.quantity = Math.min(set.quantity ?? line.quantity, line.quantity)
    set.components!.push(line)
  })

  return result
}
