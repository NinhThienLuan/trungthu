import type { OrderLine } from '../types/order'

export interface DisplayOrderLine {
  key: string
  name: string
  productId?: string
  productName: string
  variantName: string
  quantity?: number
  unitPrice?: number
  promotionLabel?: string | null
  freeQuantity?: number | null
  personalizationText?: string | null
  personalizationFee?: number
  boxContents?: string[]
  subtotal: number
  components?: OrderLine[]
}

function parseBoxContents(contents?: string[] | string | null): string[] | undefined {
  if (!contents) return undefined
  if (Array.isArray(contents)) return contents
  if (typeof contents === 'string' && contents.trim()) {
    return contents.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return undefined
}

/** BE lưu các thành phần để quản lý kho; khách mua set với một giá chung. */
export function displayOrderLines(lines: OrderLine[]): DisplayOrderLine[] {
  const result: DisplayOrderLine[] = []
  const sets = new Map<string, DisplayOrderLine>()

  lines.forEach((line, index) => {
    const boxList = parseBoxContents(line.boxContents)
    if (!line.sourceSetId) {
      result.push({
        key: `${line.variantId}-${index}`,
        name: line.productName,
        productName: line.productName,
        variantName: line.variantName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: line.subtotal,
        promotionLabel: line.promotionLabel,
        freeQuantity: line.freeQuantity,
        personalizationText: line.personalizationText,
        personalizationFee: line.personalizationFee,
        boxContents: boxList,
      })
      return
    }

    let set = sets.get(line.sourceSetId)
    if (!set) {
      set = {
        key: line.sourceSetId,
        name: line.sourceSetName || 'Set quà',
        productName: line.sourceSetName || 'Set quà',
        variantName: 'Set quà tặng',
        quantity: line.quantity,
        subtotal: 0,
        components: [],
      }
      sets.set(line.sourceSetId, set)
      result.push(set)
    }
    set.subtotal += line.subtotal
    set.quantity = Math.min(set.quantity ?? line.quantity, line.quantity)
    set.components!.push(line)
  })

  return result
}
