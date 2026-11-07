import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, CheckCircle2, Plus, Sparkles, Store, Trash2 } from 'lucide-react'
import { groupByProvider, maxOrderQuantity, useCartStore, type CartItem } from '../../stores/cartStore'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useAuthStore } from '../../stores/authStore'
import { orderService } from '../../services/orderService'
import { promotionService, type Promotion } from '../../services/sellerService'
import { useApi } from '../../hooks/useApi'
import { errorMessage } from '../../apis/http'
import { BULK_LEAD_DAYS, BULK_ORDER_QUANTITY, DEPOSIT_RATE, MIN_LEAD_DAYS, ROUTES } from '../../constants'
import { addDays, cn, formatVnd, toIsoDate } from '../../lib/format'
import { leadDaysForItems, toCheckoutGroups } from '../../lib/checkoutGroups'
import { DeliveryDateField } from '../../components/DeliveryDateField'
import { BoxItemDetails } from '../../components/OrderItemsSummary'
import { PageHeader } from '../../components/ui/PageHeader'
import { QuantityStepper } from '../../components/ui/QuantityStepper'
import { EmptyState } from '../../components/ui/States'

interface PromotionEval {
  promotion: Promotion
  status: 'achieved' | 'almost'
  message: string
  neededQuantity?: number
  savedAmount: number
}

function evaluateItemPromotion(item: CartItem, promotions: Promotion[]): PromotionEval | null {
  if (item.kind !== 'single' || item.setProductId) return null
  const matched = promotions.filter(
    (p) => p.providerId === item.providerId && (!p.productId || p.productId === item.productId),
  )
  if (!matched.length) return null

  const evals: PromotionEval[] = []

  for (const p of matched) {
    if (p.type === 'BUY_X_GET_Y' && p.buyQuantity && p.freeQuantity) {
      const bundle = p.buyQuantity + p.freeQuantity
      const sets = Math.floor(item.quantity / bundle)
      const remainder = item.quantity % bundle
      const freeGained = sets * p.freeQuantity
      const savedAmount = freeGained * item.unitPrice

      if (sets > 0 && remainder === 0) {
        evals.push({
          promotion: p,
          status: 'achieved',
          message: `Đã kích hoạt ${p.label}: Đã tặng ${freeGained} bánh miễn phí (${bundle} bánh chỉ tính tiền ${p.buyQuantity})!`,
          savedAmount,
        })
      } else {
        const needed = bundle - remainder
        const isReadyForFreeCake = item.quantity >= p.buyQuantity && remainder === p.buyQuantity
        const message = sets > 0
          ? `Đã nhận ${freeGained} bánh miễn phí. Thêm ${needed} bánh nữa để nhận thêm ${p.freeQuantity} bánh tặng!`
          : isReadyForFreeCake
            ? `Bạn đã chọn ${item.quantity} bánh! Thêm ${needed} bánh nữa để được TẶNG ${p.freeQuantity} (${bundle} bánh chỉ tính tiền ${p.buyQuantity})`
            : `Chọn đủ ${bundle} bánh (Mua ${p.buyQuantity} tặng ${p.freeQuantity}) để nhận ${p.freeQuantity} bánh miễn phí`

        evals.push({
          promotion: p,
          status: sets > 0 ? 'achieved' : 'almost',
          message,
          neededQuantity: needed,
          savedAmount,
        })
      }
    } else if (p.type === 'PERCENT_OFF' && p.minQuantity && p.percentOff) {
      if (item.quantity >= p.minQuantity) {
        const savedAmount = Math.floor((item.unitPrice * item.quantity * p.percentOff) / 100)
        evals.push({
          promotion: p,
          status: 'achieved',
          message: `Đã kích hoạt ${p.label}: Giảm ${p.percentOff}% toàn bộ số lượng!`,
          savedAmount,
        })
      } else {
        const needed = p.minQuantity - item.quantity
        evals.push({
          promotion: p,
          status: 'almost',
          message: `Mua thêm ${needed} bánh nữa để được giảm ${p.percentOff}% (${p.label})`,
          neededQuantity: needed,
          savedAmount: 0,
        })
      }
    }
  }

  if (!evals.length) return null
  const achieved = evals.filter((e) => e.status === 'achieved')
  if (achieved.length > 0) {
    return achieved.sort((a, b) => b.savedAmount - a.savedAmount)[0]
  }
  return evals.sort((a, b) => (a.neededQuantity ?? 999) - (b.neededQuantity ?? 999))[0]
}

export function CartPage() {
  useDocumentTitle('Giỏ hàng')
  const { items, deliveryDates, setQuantity, remove, setDeliveryDate } = useCartStore()
  const user = useAuthStore((state) => state.user)
  const { data: promotions } = useApi(() => promotionService.running(), [])
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({})
  const [checkingDates, setCheckingDates] = useState(false)
  const navigate = useNavigate()
  const groups = groupByProvider(items)
  const total = groups.reduce((sum, g) => sum + g.subtotal, 0)
  const missingDate = groups.some((group) => !deliveryDates[group.providerId]
    || deliveryDates[group.providerId] < toIsoDate(addDays(new Date(), leadDaysForItems(group.items))))

  const itemEvals = new Map<string, PromotionEval | null>()
  let totalSavings = 0
  for (const item of items) {
    const ev = evaluateItemPromotion(item, promotions ?? [])
    // Như BE (CheckoutServiceImpl.promote): đơn giá sau giảm làm tròn xuống đồng, tổng = đơn giá × số lượng
    if (ev && ev.savedAmount > 0) {
      const list = item.unitPrice * item.quantity
      ev.savedAmount = list - Math.floor((list - ev.savedAmount) / item.quantity) * item.quantity
    }
    itemEvals.set(item.lineId, ev)
    if (ev && ev.savedAmount > 0) {
      totalSavings += ev.savedAmount
    }
  }

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
          groups: toCheckoutGroups(group.items, { [group.providerId]: date }, {}) })
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
                      <QuantityStepper size="sm" value={item.quantity} max={maxOrderQuantity(item)}
                        onChange={(q) => setQuantity(item.lineId, q)} />
                      {(() => {
                        const promo = itemEvals.get(item.lineId)
                        const lineTotal = item.unitPrice * item.quantity
                        const finalLineTotal = Math.max(0, lineTotal - (promo?.savedAmount ?? 0))
                        return (
                          <div className="w-28 text-right shrink-0">
                            {promo && promo.savedAmount > 0 ? (
                              <>
                                <span className="block text-xs text-muted line-through">{formatVnd(lineTotal)}</span>
                                <span className="font-semibold text-secondary">{formatVnd(finalLineTotal)}</span>
                              </>
                            ) : (
                              <span className="font-semibold text-navy">{formatVnd(lineTotal)}</span>
                            )}
                          </div>
                        )
                      })()}
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
                    {(() => {
                      const promo = itemEvals.get(item.lineId)
                      if (!promo) return null
                      const isFreeCakeButton = promo.promotion.type === 'BUY_X_GET_Y' && item.quantity % ((promo.promotion.buyQuantity ?? 0) + (promo.promotion.freeQuantity ?? 0)) >= (promo.promotion.buyQuantity ?? 0)
                      return (
                        <div className={cn(
                          'mt-2 flex flex-wrap items-center justify-between gap-2 rounded-[0.125rem] px-3 py-1.5 text-xs transition-colors',
                          promo.status === 'achieved'
                            ? 'bg-secondary-fixed/20 border border-secondary-fixed/40 text-secondary'
                            : 'bg-surface-container-low border border-line text-navy',
                        )}>
                          <div className="flex items-center gap-1.5 min-w-0">
                            {promo.status === 'achieved' ? (
                              <CheckCircle2 className="size-3.5 text-secondary shrink-0" aria-hidden />
                            ) : (
                              <Sparkles className="size-3.5 text-primary shrink-0" aria-hidden />
                            )}
                            <span className="font-medium truncate">{promo.message}</span>
                            {promo.savedAmount > 0 && (
                              <span className="font-bold text-secondary shrink-0">
                                (−{formatVnd(promo.savedAmount)})
                              </span>
                            )}
                          </div>
                          {promo.neededQuantity && item.quantity + promo.neededQuantity <= maxOrderQuantity(item) && (
                            <button
                              type="button"
                              onClick={() => setQuantity(item.lineId, item.quantity + promo.neededQuantity!)}
                              className="inline-flex items-center gap-1 rounded-[0.125rem] bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container transition-colors shrink-0 cursor-pointer shadow-sm"
                            >
                              <Plus className="size-3" aria-hidden />
                              {isFreeCakeButton ? 'Lấy bánh tặng' : `Thêm ${promo.neededQuantity} cái`}
                            </button>
                          )}
                        </div>
                      )
                    })()}
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
            {groups.map((g) => {
              const groupSavings = g.items.reduce((sum, item) => sum + (itemEvals.get(item.lineId)?.savedAmount ?? 0), 0)
              return (
                <div key={g.providerId} className="flex justify-between gap-4">
                  <dt className="truncate text-muted">{g.storeName}</dt>
                  <dd>
                    {groupSavings > 0 ? (
                      <>
                        <span className="text-muted line-through mr-1.5 text-xs">{formatVnd(g.subtotal)}</span>
                        <span className="font-semibold text-secondary">{formatVnd(g.subtotal - groupSavings)}</span>
                      </>
                    ) : (
                      formatVnd(g.subtotal)
                    )}
                  </dd>
                </div>
              )
            })}
            {totalSavings > 0 && (
              <div className="flex justify-between gap-4 text-secondary font-medium pt-1 border-t border-line/60">
                <dt className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 shrink-0" aria-hidden />
                  <span>Ưu đãi xưởng tiết kiệm</span>
                </dt>
                <dd>−{formatVnd(totalSavings)}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-semibold">Tạm tính</span>
            <div className="text-right">
              {totalSavings > 0 && (
                <span className="block text-small text-muted line-through">{formatVnd(total)}</span>
              )}
              <span className="font-sans text-h3 text-navy">{formatVnd(Math.max(0, total - totalSavings))}</span>
            </div>
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
