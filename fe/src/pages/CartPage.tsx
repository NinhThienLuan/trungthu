import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, Store, Trash2 } from 'lucide-react'
import { groupByProvider, useCartStore } from '../stores/cartStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { DEPOSIT_RATE, ROUTES } from '../constants'
import { formatDate, formatVnd } from '../lib/format'
import { DeliveryDatePicker } from '../components/DeliveryDatePicker'
import { PageHeader } from '../components/ui/PageHeader'
import { QuantityStepper } from '../components/ui/QuantityStepper'
import { EmptyState } from '../components/ui/States'

export function CartPage() {
  useDocumentTitle('Giỏ hàng')
  const { items, deliveryDates, setQuantity, remove, setDeliveryDate } = useCartStore()
  const navigate = useNavigate()
  const groups = groupByProvider(items)
  const total = groups.reduce((sum, g) => sum + g.subtotal, 0)
  const missingDate = groups.some((g) => !deliveryDates[g.providerId])

  if (items.length === 0) {
    return (
      <div className="page section">
        <EmptyState title="Giỏ hàng đang trống" action={<Link to={ROUTES.products} className="btn btn-primary">Xem bộ sưu tập</Link>} />
      </div>
    )
  }

  return (
    <div className="page section">
      <PageHeader
        title="Giỏ hàng"
        description={groups.length > 1 ? `Giỏ có ${groups.length} xưởng — mỗi xưởng là một đơn riêng, chọn ngày nhận cho từng xưởng.` : undefined}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.providerId} className="card" aria-labelledby={`store-${group.providerId}`}>
              <h2 id={`store-${group.providerId}`} className="flex items-center gap-2 border-b border-line px-5 py-4 text-h3">
                <Store className="size-5 text-gold" aria-hidden /> {group.storeName}
              </h2>

              <ul className="divide-y divide-line">
                {group.items.map((item) => (
                  <li key={item.lineId} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    {item.imageUrl && <img src={item.imageUrl} alt="" className="size-14 rounded-sm object-cover" />}
                    <div className="min-w-0 flex-1">
                      <Link to={item.kind === 'box' ? ROUTES.boxBuilder : ROUTES.product(item.productId)} className="font-semibold text-navy hover:underline">
                        {item.productName}
                      </Link>
                      <p className="text-small text-muted">
                        {item.kind === 'box' && <span className="font-semibold text-gold-ink">Hộp tự phối · </span>}
                        {item.variantName} · {formatVnd(item.unitPrice)}
                      </p>
                      {item.slots && (
                        <p className="mt-1 text-small text-muted">
                          Gồm: {item.slots.map((s) => `${s.productName} ${s.variantName}`).join(', ')}
                        </p>
                      )}
                      {item.note && <p className="mt-1 text-small italic text-muted">Lời chúc: “{item.note}”</p>}
                    </div>
                    <QuantityStepper size="sm" value={item.quantity} max={item.stock} onChange={(q) => setQuantity(item.lineId, q)} />
                    <p className="w-28 text-right font-semibold text-navy">{formatVnd(item.unitPrice * item.quantity)}</p>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => remove(item.lineId)}
                      aria-label={`Xoá ${item.productName} ${item.variantName}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4 border-t border-line bg-ivory/60 px-5 py-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-navy">
                    <CalendarDays className="size-4 text-gold" aria-hidden /> Ngày nhận
                  </p>
                  <p className="mt-1 text-small text-muted">
                    {deliveryDates[group.providerId] ? formatDate(deliveryDates[group.providerId]) : 'Chưa chọn'}
                  </p>
                </div>
                <DeliveryDatePicker
                  providerId={group.providerId}
                  value={deliveryDates[group.providerId]}
                  onChange={(d) => setDeliveryDate(group.providerId, d)}
                />
              </div>
            </section>
          ))}
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="text-h3">Tóm tắt</h2>
          <dl className="mt-4 flex flex-col gap-2 text-small">
            {groups.map((g) => (
              <div key={g.providerId} className="flex justify-between gap-4">
                <dt className="truncate text-muted">{g.storeName}</dt>
                <dd>{formatVnd(g.subtotal)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-semibold">Tạm tính</span>
            <span className="font-serif text-h3 text-navy">{formatVnd(total)}</span>
          </div>
          <p className="mt-1 text-small text-muted">Cọc tối thiểu {DEPOSIT_RATE * 100}% khi đặt.</p>
          <button type="button" className="btn btn-primary mt-5 w-full" disabled={missingDate} onClick={() => navigate(ROUTES.checkout)}>
            Đặt hàng
          </button>
          {missingDate && <p className="mt-2 text-small text-danger">Chọn ngày nhận cho tất cả các xưởng.</p>}
        </aside>
      </div>
    </div>
  )
}
