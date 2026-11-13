import type { OrderLine } from '../types/order'

/** Parse variant name thành các thành phần riêng biệt: size, spec, personalization
 * Ví dụ:
 * - "4 bánh" -> { size: "4 bánh", spec: null, personalization: null }
 * - "6 bánh | Phối các vị dưới 500k" -> { size: "6 bánh", spec: "Phối các vị dưới 500k", personalization: null }
 * - "8 bánh | In tên Công ty ABC, logo file đính kèm" -> { size: "8 bánh", spec: null, personalization: "In tên Công ty ABC, logo file đính kèm" }
 * - "10 bánh | Phối vị cao cấp | In chữ Happy Birthday" -> { size: "10 bánh", spec: "Phối vị cao cấp", personalization: "In chữ Happy Birthday" }
 */
export interface ParsedVariantName {
  size: string
  spec: string | null
  personalization: string | null
}

export function parseVariantName(variantName: string): ParsedVariantName {
  const parts = variantName.split('|').map((s) => s.trim())
  const size = parts[0] || variantName
  
  // Tìm phần có "In ", "in ", hoặc "logo" -> personalization
  const personalizationIndex = parts.findIndex((p, i) => i > 0 && /\b(in|In|logo|Logo|khắc|Khắc)\b/.test(p))
  const personalization = personalizationIndex > 0 ? parts[personalizationIndex] : null
  
  // Phần còn lại (không phải size, không phải personalization) -> spec
  const spec = parts.slice(1, personalizationIndex > 0 ? personalizationIndex : parts.length)
    .filter((p) => p && !/\b(in|In|logo|Logo|khắc|Khắc)\b/.test(p))
    .join(' | ') || null
  
  return { size, spec, personalization }
}

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
