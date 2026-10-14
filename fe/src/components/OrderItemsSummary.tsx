import type { CartGroup } from '../stores/cartStore'
import { formatDate, formatVnd } from '../lib/format'

/** Chi tiết từng món + giá ở checkout, nhóm theo xưởng (mỗi xưởng = 1 đơn) */
export function OrderItemsSummary({ groups, deliveryDates }: { groups: CartGroup[]; deliveryDates: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <section key={g.providerId} className="rounded-sm border border-line bg-ivory/60" aria-label={`Đơn của ${g.storeName}`}>
          <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-3 py-2">
            <p className="font-semibold text-navy">{g.storeName}</p>
            <p className="text-small text-muted">Nhận {formatDate(deliveryDates[g.providerId])}</p>
          </header>

          <ul className="divide-y divide-line">
            {g.items.map((item) => (
              <li key={item.lineId} className="px-3 py-3">
                <div className="flex gap-3">
                  {item.imageUrl && <img src={item.imageUrl} alt="" className="size-12 shrink-0 rounded-sm object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-small font-semibold text-navy">{item.productName}</p>
                    <p className="text-small text-muted">{item.variantName}</p>
                    <p className="mt-1 flex justify-between gap-2 text-small">
                      <span className="text-muted">
                        {item.quantity} × {formatVnd(item.unitPrice)}
                      </span>
                      <span className="font-semibold text-navy">{formatVnd(item.unitPrice * item.quantity)}</span>
                    </p>
                  </div>
                </div>

                {item.slots && (
                  <div className="mt-2 rounded-sm bg-white px-3 py-2">
                    <p className="text-label font-semibold uppercase text-gold-ink">Bánh trong hộp ({item.slots.length})</p>
                    <ul className="mt-1 flex flex-col gap-0.5">
                      {item.slots.map((slot, i) => (
                        <li key={`${slot.variantId}-${i}`} className="flex justify-between gap-2 text-small">
                          <span className="text-ink">
                            {i + 1}. {slot.productName} <span className="text-muted">· {slot.variantName}</span>
                          </span>
                          <span className="shrink-0 text-muted">{formatVnd(slot.unitPrice)}</span>
                        </li>
                      ))}
                    </ul>
                    {item.priceLines && (
                      <>
                        <p className="mt-2 text-label font-semibold uppercase text-gold-ink">Giá 1 hộp</p>
                        <ul className="mt-1 flex flex-col gap-0.5">
                          {item.priceLines.map((line) => (
                            <li key={line.label} className="flex justify-between gap-2 text-small">
                              <span className="text-muted">{line.label}</span>
                              <span className={line.amount < 0 ? 'shrink-0 text-success' : 'shrink-0 text-ink'}>{formatVnd(line.amount)}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-1 text-small text-muted">Giá bánh lẻ chỉ để tham khảo — đã gồm trong giá quy cách.</p>
                      </>
                    )}
                    {item.note && <p className="mt-2 text-small italic text-muted">Lời chúc: “{item.note}”</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <footer className="flex justify-between border-t border-line px-3 py-2 text-small">
            <span className="text-muted">Tạm tính đơn này</span>
            <span className="font-semibold text-navy">{formatVnd(g.subtotal)}</span>
          </footer>
        </section>
      ))}
    </div>
  )
}
