import { useEffect, useState } from 'react'
import { productService } from '../services/productService'
import { formatDate, toIsoDate, addDays } from '../lib/format'
import { BULK_ORDER_QUANTITY } from '../constants'
import type { LeadTime, VariantAvailability } from '../types/product'

const STATUS: Record<VariantAvailability, { label: string; tone: string }> = {
  READY: { label: 'Có sẵn', tone: 'bg-secondary-fixed/30 text-secondary' },
  LOW: { label: 'Sắp hết', tone: 'bg-amber-500/15 text-amber-800' },
  BAKE_TO_ORDER: { label: 'Nướng theo đơn', tone: 'bg-surface-container text-ink-dark' },
  UNAVAILABLE: { label: 'Tạm hết hàng', tone: 'bg-error/10 text-error' },
}

/** Trạng thái hàng + ngày nhận sớm nhất cho số lượng đang chọn (không lộ số tồn) */
export function DeliveryEstimate({ variantId, quantity, availability }: {
  variantId: string
  quantity: number
  availability?: VariantAvailability
}) {
  const [lead, setLead] = useState<LeadTime | null>(null)
  useEffect(() => {
    let alive = true
    // Chờ khách bấm xong số lượng rồi mới hỏi BE
    const timer = window.setTimeout(() => {
      productService.leadTime({ [variantId]: quantity })
        .then((result) => alive && setLead(result))
        .catch(() => alive && setLead(null))
    }, 250)
    return () => { alive = false; window.clearTimeout(timer) }
  }, [variantId, quantity])

  const status = availability ? STATUS[availability] : null
  const tomorrow = toIsoDate(addDays(new Date(), 1))
  const message = !lead ? null
    : lead.unavailable.length ? 'Không đủ hàng cho số lượng này.'
    : lead.bakeToOrder.length ? `Vượt số bánh có sẵn — cả đơn sẽ nướng theo đơn, nhận sớm nhất ${formatDate(lead.earliestDelivery)}.`
    : quantity >= BULK_ORDER_QUANTITY ? `Đặt từ ${BULK_ORDER_QUANTITY} cái — xưởng cần chuẩn bị, nhận sớm nhất ${formatDate(lead.earliestDelivery)}.`
    : lead.earliestDelivery === tomorrow ? `Có sẵn — nhận sớm nhất ngày mai (${formatDate(lead.earliestDelivery)}).`
    : `Nhận sớm nhất ${formatDate(lead.earliestDelivery)}.`

  return (
    <div className="flex flex-wrap items-center gap-2 text-small" role="status" aria-live="polite">
      {status && <span className={`rounded-[0.125rem] px-2 py-0.5 font-semibold ${status.tone}`}>{status.label}</span>}
      {message && <span className={lead?.unavailable.length ? 'text-error' : 'text-on-surface-variant'}>{message}</span>}
    </div>
  )
}
