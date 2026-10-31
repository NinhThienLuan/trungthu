import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, Store, Trash2 } from 'lucide-react'
import { groupByProvider, useCartStore } from '../../stores/cartStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAuthStore } from '../../stores/authStore'
import { orderService } from '../../services/orderService'
import { errorMessage } from '../../apis/http'
import { BULK_LEAD_DAYS, BULK_ORDER_QUANTITY, DEPOSIT_RATE, MIN_LEAD_DAYS, ROUTES } from '../../constants'
import { addDays, formatVnd, toIsoDate } from '../../lib/format'
import { leadDaysForItems, toCheckoutGroups } from '../../lib/checkoutGroups'
import { DeliveryDateField } from '../../components/DeliveryDateField'
import { BoxItemDetails } from '../../components/OrderItemsSummary'
import { PageHeader } from '../../components/ui/PageHeader'
import { QuantityStepper } from '../../components/ui/QuantityStepper'
import { EmptyState } from '../../components/ui/States'

export function CartPage() {
  useDocumentTitle('Giỏ hàng')
  const { items, deliveryDates, setQuantity, remove, setDeliveryDate } = useCartStore()
  const user = useAuthStore((state) => state.user)
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({})
  const [checkingDates, setCheckingDates] = useState(false)
  const navigate = useNavigate()
  const groups = groupByProvider(items)
  const total = groups.reduce((sum, g) => sum + g.subtotal, 0)
  const missingDate = groups.some((group) => !deliveryDates[group.providerId]
    || deliveryDates[group.providerId] < toIsoDate(addDays(new Date(), leadDaysForItems(group.items))))

  // Kiểm tra đủ hàng và suất nướng khi chọn ngày hoặc đổi số lượng trong giỏ.
  useEffect(() => {
    if (user?.role !== 'CUSTOMER') {
      setDateErrors({})
      setCheckingDates(false)
      return
    }
    const datedGroups = groupByProvider(items).filter((group) => deliveryDates[group.providerId])
    if (datedGroups.length === 0) {
      setDateErrors({})
      setCheckingDates(false)
      return
    }
    let cancelled = false
    setCheckingDates(true)
    Promise.all(datedGroups.map(async (group) => {
      const date = deliveryDates[group.providerId]
      if (date < toIsoDate(addDays(new Date(), leadDaysForItems(group.items)))) return null
      try {
        await orderService.preview({ receiverName: '', receiverPhone: '', shippingAddress: '',
          groups: toCheckoutGroups(group.items, { [group.providerId]: date }, {}) }, group.items)
        return null
      } catch (error) {
        return { providerId: group.providerId, message: errorMessage(error) }
      }
    })).then((results) => {
      if (!cancelled) setDateErrors(Object.fromEntries(results.filter((result) => result)
        .map((result) => [result!.providerId, result!.message])))
    }).finally(() => { if (!cancelled) setCheckingDates(false) })
    return () => { cancelled = true }
  }, [items, deliveryDates, user?.role])

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
                  <li key={item.lineId} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                      {item.imageUrl && <img src={item.imageUrl} alt="" className="size-14 rounded-sm object-cover" />}
                      <div className="min-w-0 flex-1">
                        <Link
                          to={item.kind === 'box' ? ROUTES.boxBuilder : ROUTES.product(item.productId)}
                          className="font-semibold text-navy hover:underline"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-small text-muted">
                          {item.kind === 'box' && <span className="font-semibold text-gold-ink">Hộp tự phối · </span>}
                          {item.variantName}
                        </p>
                        <p className="text-small text-muted">
                          {item.quantity} × {formatVnd(item.unitPrice)}
                        </p>
                      </div>
                      <QuantityStepper size="sm" value={item.quantity} max={item.canPreorder ? 10_000 : item.stock}
                        onChange={(q) => setQuantity(item.lineId, q)} />
                      <p className="w-28 text-right font-semibold text-navy">{formatVnd(item.unitPrice * item.quantity)}</p>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => remove(item.lineId)}
                        aria-label={`Xoá ${item.productName} ${item.variantName}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <BoxItemDetails item={item} />
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 border-t border-line bg-ivory/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 font-semibold text-navy">
                  <CalendarDays className="size-4 text-gold" aria-hidden /> Ngày nhận
                </p>
                <DeliveryDateField
                  providerId={group.providerId}
                  value={deliveryDates[group.providerId]}
                  minLeadDays={leadDaysForItems(group.items)}
                  onChange={(d) => setDeliveryDate(group.providerId, d)}
                />
              </div>
              {leadDaysForItems(group.items) === BULK_LEAD_DAYS && (
                <p className="px-5 pb-2 text-small text-gold-ink">
                  {group.items.reduce((sum, item) => sum + item.quantity, 0) >= BULK_ORDER_QUANTITY
                    ? `Từ ${BULK_ORDER_QUANTITY} sản phẩm cần chọn ngày nhận cách ít nhất ${BULK_LEAD_DAYS} ngày.`
                    : `Bánh nướng theo đơn khi vượt tồn kho cần chọn ngày nhận cách ít nhất ${BULK_LEAD_DAYS} ngày.`}
                </p>
              )}
              {deliveryDates[group.providerId] && deliveryDates[group.providerId] < toIsoDate(addDays(new Date(), leadDaysForItems(group.items))) && (
                <p className="px-5 pb-3 text-small text-danger" role="alert">
                  Ngày đã chọn không còn hợp lệ. Vui lòng chọn ngày nhận cách ít nhất {leadDaysForItems(group.items)} ngày.
                </p>
              )}
              {dateErrors[group.providerId] && (
                <p className="px-5 pb-3 text-small text-danger" role="alert">{dateErrors[group.providerId]}</p>
              )}
              {checkingDates && deliveryDates[group.providerId] && (
                <p className="px-5 pb-3 text-small text-muted">Đang kiểm tra số lượng và lịch nướng...</p>
              )}
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
          <button type="button" className="btn btn-primary mt-5 w-full"
            disabled={missingDate || checkingDates || Object.keys(dateErrors).length > 0}
            onClick={() => navigate(ROUTES.checkout)}>
            Đặt hàng
          </button>
          {missingDate && <p className="mt-2 text-small text-danger">Chọn ngày nhận hợp lệ cho tất cả các xưởng. Đơn thường tối thiểu {MIN_LEAD_DAYS} ngày.</p>}
        </aside>
      </div>
    </div>
  )
}
