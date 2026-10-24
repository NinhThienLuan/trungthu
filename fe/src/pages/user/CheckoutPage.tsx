import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { errorMessage } from '../../apis/http'
import { groupByProvider, useCartStore, type CartGroup } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { checkoutSchema, fieldErrors } from '../../schemas'
import { COD_MAX_TOTAL, DEPOSIT_RATE, ROUTES } from '../../constants'
import { cn, formatVnd } from '../../lib/format'
import { TextInput } from '../../components/ui/Field'
import { OrderItemsSummary } from '../../components/OrderItemsSummary'
import { ShippingZoneSelect, type ShippingZone } from '../../components/ShippingZoneSelect'
import { PageHeader } from '../../components/ui/PageHeader'
import { Notice, Spinner } from '../../components/ui/States'
import type { CheckoutGroup, CheckoutPreviewGroup, CheckoutRequest } from '../../types/order'

/** Lựa chọn thanh toán của một xưởng: COD hoặc VietQR (cọc 50% / trả đủ) */
type PayChoice = 'COD' | 'MIN_DEPOSIT' | 'FULL'

const toGroups = (groups: CartGroup[], dates: Record<string, string>, choices: Record<string, PayChoice>,
  zones: Record<string, ShippingZone>): CheckoutGroup[] =>
  groups.map((g) => {
    const choice = choices[g.providerId] ?? 'MIN_DEPOSIT'
    return {
      providerId: g.providerId,
      deliveryDate: dates[g.providerId],
      province: zones[g.providerId]?.province,
      district: zones[g.providerId]?.district,
      paymentMethod: choice === 'COD' ? 'COD' : 'VIETQR',
      depositOption: choice === 'COD' ? undefined : choice,
      items: g.items.filter((i) => i.kind === 'single').map((i) =>
        i.setProductId ? { setProductId: i.setProductId, quantity: i.quantity } : { variantId: i.variantId, quantity: i.quantity }),
      boxes: g.items
        .filter((i) => i.kind === 'box')
        .map((i) => ({ boxVariantId: i.variantId, quantity: i.quantity, cakeVariantIds: (i.slots ?? []).map((s) => s.variantId), note: i.note })),
    }
  })

export function CheckoutPage() {
  useDocumentTitle('Thanh toán')
  const { items, deliveryDates, clear } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [wantVat, setWantVat] = useState(false)
  const [choices, setChoices] = useState<Record<string, PayChoice>>({})
  const [zones, setZones] = useState<Record<string, ShippingZone>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const groups = groupByProvider(items)
  const ready = groups.length > 0 && groups.every((g) => deliveryDates[g.providerId])
  const zonesReady = groups.every((g) => zones[g.providerId]?.province && zones[g.providerId]?.district)

  // Preview (BE3) chỉ đọc: tổng tiền, phí ship, cọc tối thiểu, có được COD không
  const { data: preview, loading: previewLoading, error: previewError } = useApi(
    () =>
      ready && zonesReady
        ? orderService.preview({ receiverName: '', receiverPhone: '', shippingAddress: '', groups: toGroups(groups, deliveryDates, {}, zones) }, items)
        : Promise.resolve(null),
    [items, deliveryDates, zones],
  )

  if (!ready) return <Navigate to={ROUTES.cart} replace />

  const previewOf = (providerId: string) => preview?.groups.find((p) => p.providerId === providerId)
  // Mặc định: COD nếu được phép, không thì VietQR cọc 50%.
  const choiceOf = (p?: CheckoutPreviewGroup): PayChoice => {
    if (!p) return 'MIN_DEPOSIT'
    const picked = choices[p.providerId] ?? (p.codAllowed ? 'COD' : 'MIN_DEPOSIT')
    return picked === 'COD' && !p.codAllowed ? 'MIN_DEPOSIT' : picked
  }
  const effectiveChoices = Object.fromEntries(groups.map((g) => [g.providerId, choiceOf(previewOf(g.providerId))]))

  const payNow = (preview?.groups ?? []).reduce((sum, p) => {
    const c = effectiveChoices[p.providerId]
    return sum + (c === 'FULL' ? p.totalAmount : c === 'MIN_DEPOSIT' ? p.minDepositAmount : 0)
  }, 0)
  const grandTotal = preview?.grandTotal ?? groups.reduce((sum, g) => sum + g.subtotal, 0)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    const parsed = checkoutSchema.safeParse({
      receiverName: form.receiverName,
      receiverPhone: form.receiverPhone,
      shippingAddress: form.shippingAddress,
      vat: wantVat
        ? { taxCode: form.taxCode, companyName: form.companyName, companyAddress: form.companyAddress, invoiceEmail: form.invoiceEmail }
        : undefined,
    })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setSubmitError(undefined)
    if (!zonesReady) {
      setSubmitError('Nhập tỉnh/thành phố và quận/huyện giao hàng cho từng xưởng.')
      return
    }
    setSubmitting(true)

    const body: CheckoutRequest = {
      receiverName: parsed.data.receiverName,
      receiverPhone: parsed.data.receiverPhone,
      shippingAddress: parsed.data.shippingAddress,
      vat: parsed.data.vat,
      groups: toGroups(groups, deliveryDates, effectiveChoices, zones),
    }
    try {
      const orders = await orderService.checkout(body, items)
      clear()
      navigate(`${ROUTES.payment}?ids=${orders.map((o) => o.id).join(',')}`, { replace: true })
    } catch (err) {
      // BE rollback toàn bộ nếu 1 xưởng lỗi (hết slot/hàng) -> giữ nguyên giỏ để khách chọn lại
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page section">
      <PageHeader title="Thông tin đặt hàng" />

      <form noValidate onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_26rem]">
        <div className="flex flex-col gap-6">
          <section className="card p-5 md:p-6">
            <h2 className="text-h3">Người nhận</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextInput label="Họ tên" name="receiverName" defaultValue={user?.fullName} autoComplete="name" error={errors.receiverName} />
              <TextInput label="Số điện thoại" name="receiverPhone" type="tel" defaultValue={user?.phone ?? ''} autoComplete="tel" error={errors.receiverPhone} />
              <TextInput label="Địa chỉ giao hàng" name="shippingAddress" defaultValue={user?.address ?? ''} autoComplete="street-address" error={errors.shippingAddress} className="md:col-span-2" />
            </div>
          </section>

          <section className="card p-5 md:p-6" aria-labelledby="pay-title">
            <h2 id="pay-title" className="text-h3">Thanh toán</h2>
            <p className="mt-1 text-small text-muted">
              Mỗi xưởng là một đơn riêng. COD áp dụng cho đơn dưới {formatVnd(COD_MAX_TOTAL)}, không có hộp tự phối.
            </p>
            <div className="mt-5 grid gap-4">
              {groups.map((g) => (
                <ShippingZoneSelect key={g.providerId} providerId={g.providerId} storeName={g.storeName}
                  value={zones[g.providerId]}
                  onChange={(zone) => setZones((current) => ({ ...current, [g.providerId]: zone }))} />
              ))}
            </div>
            {previewLoading ? (
              <Spinner label="Đang tính tiền..." />
            ) : !zonesReady ? (
              <div className="mt-4"><Notice>Chọn khu vực giao hàng để xem giá và phương thức thanh toán.</Notice></div>
            ) : previewError ? (
              <div className="mt-4">
                <Notice tone="danger">{previewError}</Notice>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-4">
                {groups.map((g) => {
                  const p = previewOf(g.providerId)
                  if (!p) return null
                  const choice = effectiveChoices[g.providerId]
                  const options: Array<{ value: PayChoice; title: string; note: string; disabled?: boolean }> = [
                    {
                      value: 'COD',
                      title: 'Thanh toán khi nhận (COD)',
                      note: p.codAllowed ? 'Không cần cọc trước' : `Không áp dụng: đơn từ ${formatVnd(COD_MAX_TOTAL)} hoặc có hộp tự phối`,
                      disabled: !p.codAllowed,
                    },
                    { value: 'MIN_DEPOSIT', title: `VietQR — cọc ${DEPOSIT_RATE * 100}%`, note: `Chuyển ${formatVnd(p.minDepositAmount)} trong 5 giờ; xưởng xác nhận khi nhận tiền` },
                    { value: 'FULL', title: 'VietQR — trả đủ', note: `Chuyển ${formatVnd(p.totalAmount)} trong 5 giờ; xưởng xác nhận khi nhận tiền` },
                  ]
                  return (
                    <fieldset key={g.providerId} className="rounded-sm border border-line p-4">
                      <legend className="px-1 font-semibold text-navy">
                        {g.storeName} · {formatVnd(p.totalAmount)}
                      </legend>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {options.map((o) => (
                          <label
                            key={o.value}
                            className={cn(
                              'flex cursor-pointer gap-2 rounded-sm border p-3 transition-colors',
                              choice === o.value ? 'border-navy bg-champagne/40' : 'border-line',
                              o.disabled && 'cursor-not-allowed opacity-50',
                            )}
                          >
                            <input
                              type="radio"
                              name={`pay-${g.providerId}`}
                              className="mt-0.5 accent-navy"
                              checked={choice === o.value}
                              disabled={o.disabled}
                              onChange={() => setChoices((c) => ({ ...c, [g.providerId]: o.value }))}
                            />
                            <span>
                              <span className="block text-small font-semibold text-navy">{o.title}</span>
                              <span className="block text-small text-muted">{o.note}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )
                })}
              </div>
            )}
          </section>

          <section className="card p-5 md:p-6">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" className="size-4 accent-navy" checked={wantVat} onChange={(e) => setWantVat(e.target.checked)} />
              <span className="font-semibold text-navy">Xuất hoá đơn VAT cho doanh nghiệp</span>
            </label>
            {wantVat && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TextInput label="Mã số thuế" name="taxCode" inputMode="numeric" error={errors['vat.taxCode']} />
                <TextInput label="Tên công ty" name="companyName" error={errors['vat.companyName']} />
                <TextInput label="Địa chỉ công ty" name="companyAddress" error={errors['vat.companyAddress']} className="md:col-span-2" />
                <TextInput label="Email nhận hoá đơn" name="invoiceEmail" type="email" error={errors['vat.invoiceEmail']} className="md:col-span-2" />
              </div>
            )}
          </section>
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="text-h3">Chi tiết đơn hàng ({groups.length} xưởng)</h2>
          <div className="mt-4">
            <OrderItemsSummary groups={groups} deliveryDates={deliveryDates} />
          </div>
          <dl className="mt-4 flex flex-col gap-1 border-t border-line pt-4 text-small">
            <div className="flex justify-between">
              <dt className="font-semibold text-ink">Tổng cộng</dt>
              <dd className="font-serif text-h3 text-navy">{formatVnd(grandTotal)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Chuyển khoản VietQR</dt>
              <dd className="font-semibold text-navy">{formatVnd(payNow)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Trả khi nhận hàng</dt>
              <dd>{formatVnd(grandTotal - payNow)}</dd>
            </div>
          </dl>
          {submitError && (
            <div className="mt-4">
              <Notice tone="danger">{submitError}</Notice>
            </div>
          )}
          <button type="submit" className="btn btn-primary mt-5 w-full" disabled={submitting || previewLoading || !!previewError}>
            {submitting ? 'Đang giữ chỗ...' : 'Xác nhận đặt hàng'}
          </button>
        </aside>
      </form>
    </div>
  )
}
