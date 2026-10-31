import { useRef, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { errorMessage } from '../../apis/http'
import { groupByProvider, useCartStore, type CartItem } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { checkoutSchema, fieldErrors } from '../../schemas'
import { COD_MAX_TOTAL, DEPOSIT_RATE, ROUTES } from '../../constants'
import { cn, formatVnd } from '../../lib/format'
import { addDays, toIsoDate } from '../../lib/format'
import { leadDaysForItems, toCheckoutGroups, type PayChoice } from '../../lib/checkoutGroups'
import { Field, TextInput } from '../../components/ui/Field'
import { OrderItemsSummary } from '../../components/OrderItemsSummary'
import { SearchableSelect, type SelectGroup } from '../../components/ui/SearchableSelect'
import administrativeUnits from '../../data/vietnamAdministrativeUnits.json'
import { PageHeader } from '../../components/ui/PageHeader'
import { Notice, Spinner } from '../../components/ui/States'
import type { CheckoutPreview, OrderDetail } from '../../types/order'

/** Một người nhận: địa chỉ riêng + số lượng mỗi món gửi cho người này (người đầu tiên nhận phần còn lại) */
interface Recipient {
  key: string
  name: string
  phone: string
  provinceCode: string
  wardCode: string
  street: string
  qty: Record<string, number>
}

const provinceOf = (code: string) => administrativeUnits.find((province) => province.code === code)
const wardOf = (provinceCode: string, wardCode: string) =>
  provinceOf(provinceCode)?.wards.find((ward) => ward.code === wardCode)

const collator = new Intl.Collator('vi', { sensitivity: 'base' })
const shortName = (name: string) => name.replace(/^(Thành phố|Tỉnh|Phường|Xã|Đặc khu)\s+/u, '')
const sortByName = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) => collator.compare(shortName(a.name), shortName(b.name)))

const provinceGroups: SelectGroup[] = [
  { label: 'Thành phố', options: sortByName(administrativeUnits.filter((p) => p.name.startsWith('Thành phố ')))
    .map((p) => ({ value: p.code, label: p.name })) },
  { label: 'Tỉnh', options: sortByName(administrativeUnits.filter((p) => p.name.startsWith('Tỉnh ')))
    .map((p) => ({ value: p.code, label: p.name })) },
]
const wardGroups = (provinceCode: string): SelectGroup[] =>
  [{ options: sortByName(provinceOf(provinceCode)?.wards ?? []).map((ward) => ({ value: ward.code, label: ward.name })) }]

const newRecipient = (name = '', phone = ''): Recipient =>
  ({ key: crypto.randomUUID(), name, phone, provinceCode: '', wardCode: '', street: '', qty: {} })

/** Chia giỏ cho từng người nhận; người đầu tiên nhận phần còn lại của mỗi món */
function allocate(items: CartItem[], recipients: Recipient[]): CartItem[][] {
  return recipients.map((r, index) => items
    .map((item) => {
      const others = recipients.slice(1).reduce((sum, o) => sum + (o.qty[item.lineId] ?? 0), 0)
      return { ...item, quantity: index === 0 ? item.quantity - others : (r.qty[item.lineId] ?? 0) }
    })
    .filter((item) => item.quantity > 0))
}

const fullAddress = (r: Recipient) =>
  `${r.street.trim()}, ${wardOf(r.provinceCode, r.wardCode)?.name}, ${provinceOf(r.provinceCode)?.name}`

export function CheckoutPage() {
  useDocumentTitle('Thanh toán')
  const { items, deliveryDates, clear } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [wantVat, setWantVat] = useState(false)
  const [choices, setChoices] = useState<Record<string, PayChoice>>({})
  const [recipients, setRecipients] = useState<Recipient[]>(() => [newRecipient(user?.fullName ?? '', user?.phone ?? '')])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const placed = useRef(false)

  const groups = groupByProvider(items)
  const ready = groups.length > 0 && groups.every((group) => deliveryDates[group.providerId]
    && deliveryDates[group.providerId] >= toIsoDate(addDays(new Date(), leadDaysForItems(group.items))))
  const carts = allocate(items, recipients)
  const overAllocated = items.filter((item) => recipients.slice(1)
    .reduce((sum, r) => sum + (r.qty[item.lineId] ?? 0), 0) > item.quantity)
  // Người nhận có hàng mới tạo đơn
  const active = recipients.map((r, i) => ({ r, cart: carts[i] })).filter((x) => x.cart.length > 0)
  const allocationKey = JSON.stringify(recipients.map((r) => r.qty))

  // Mỗi người nhận một bản tính riêng: khuyến mãi tính theo số lượng trong từng đơn
  const { data: previews, loading: previewLoading, error: previewError } = useApi(
    (): Promise<CheckoutPreview[] | null> => ready && overAllocated.length === 0
      ? Promise.all(active.map(({ cart }) => orderService.preview(
          { receiverName: '', receiverPhone: '', shippingAddress: '', groups: toCheckoutGroups(cart, deliveryDates, {}) }, cart)))
      : Promise.resolve(null),
    [items, deliveryDates, allocationKey],
  )

  // Đã đặt xong thì giỏ trống là bình thường: đừng chuyển về /cart, chờ sang trang QR
  if (!ready && !placed.current) return <Navigate to={ROUTES.cart} replace />

  const previewGroups = (previews ?? []).flatMap((p) => p.groups)
  const byProvider = (providerId: string) => previewGroups.filter((p) => p.providerId === providerId)
  const codAllowed = (providerId: string) => byProvider(providerId).every((p) => p.codAllowed)
  // Mặc định VietQR cọc 50% -> đặt xong hiện mã QR ngay; COD vẫn chọn được nếu mọi đơn của xưởng đủ điều kiện
  const choiceOf = (providerId: string): PayChoice => {
    const picked = choices[providerId] ?? 'MIN_DEPOSIT'
    return picked === 'COD' && !codAllowed(providerId) ? 'MIN_DEPOSIT' : picked
  }
  const effectiveChoices = Object.fromEntries(groups.map((g) => [g.providerId, choiceOf(g.providerId)]))
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)
  const payNow = sum(previewGroups.map((p) => {
    const c = effectiveChoices[p.providerId]
    return c === 'FULL' ? p.totalAmount : c === 'MIN_DEPOSIT' ? p.minDepositAmount : 0
  }))
  const grandTotal = previews ? sum(previews.map((p) => p.grandTotal)) : sum(groups.map((g) => g.subtotal))
  const discount = sum(previewGroups.map((p) => p.discountAmount ?? 0))
  const promoLines = previewGroups.flatMap((p) => p.lines ?? []).filter((l) => l.promotion)

  const update = (key: string, patch: Partial<Recipient>) =>
    setRecipients((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    const nextErrors: Record<string, string> = {}
    const vat = wantVat
      ? { taxCode: form.taxCode, companyName: form.companyName, companyAddress: form.companyAddress, invoiceEmail: form.invoiceEmail }
      : undefined
    const vatCheck = checkoutSchema.pick({ vat: true }).safeParse({ vat })
    if (!vatCheck.success) Object.assign(nextErrors, fieldErrors(vatCheck.error))
    for (const { r } of active) {
      const check = checkoutSchema.omit({ vat: true }).safeParse({ receiverName: r.name, receiverPhone: r.phone, shippingAddress: r.street })
      if (!check.success) for (const [field, message] of Object.entries(fieldErrors(check.error))) nextErrors[`${r.key}.${field}`] = message
      if (!wardOf(r.provinceCode, r.wardCode)) nextErrors[`${r.key}.ward`] = 'Vui lòng chọn tỉnh/thành và xã/phường'
    }
    setErrors(nextErrors)
    setSubmitError(undefined)
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Vui lòng kiểm tra lại thông tin người nhận.')
      return
    }
    setSubmitting(true)

    // Một lần đặt cho mọi người nhận: mỗi nhóm mang người nhận riêng; BE tạo tất cả hoặc không đơn nào
    let created: OrderDetail[]
    try {
      created = await orderService.checkout({
        receiverName: '',
        receiverPhone: '',
        shippingAddress: '',
        vat: vatCheck.success ? vatCheck.data.vat : undefined,
        groups: active.flatMap(({ r, cart }) => toCheckoutGroups(cart, deliveryDates, effectiveChoices).map((g) => ({
          ...g, receiverName: r.name.trim(), receiverPhone: r.phone.trim(), shippingAddress: fullAddress(r),
        }))),
      }, items)
    } catch (err) {
      // Không đơn nào được tạo -> giữ nguyên giỏ để khách sửa lại
      setSubmitError(errorMessage(err))
      setSubmitting(false)
      return
    }
    setSubmitting(false)
    placed.current = true
    navigate(`${ROUTES.payment}?ids=${created.map((o) => o.id).join(',')}`, { replace: true })
    clear()
  }

  return (
    <div className="page section">
      <PageHeader title="Thông tin đặt hàng" description="Có thể gửi bánh tới nhiều người: thêm người nhận rồi chia số lượng cho từng người." />

      <form noValidate onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_26rem]">
        <div className="flex flex-col gap-6">
          {recipients.map((r, index) => (
            <section key={r.key} className="card p-5 md:p-6" aria-label={`Người nhận ${index + 1}`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-h3">{recipients.length > 1 ? `Người nhận ${index + 1}` : 'Người nhận'}</h2>
                {index > 0 && (
                  <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => setRecipients((list) => list.filter((x) => x.key !== r.key))}>
                    <Trash2 className="size-4" aria-hidden /> Bỏ người nhận
                  </button>
                )}
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TextInput label="Họ tên" name={`name-${r.key}`} value={r.name} autoComplete={index === 0 ? 'name' : 'off'}
                  onChange={(e) => update(r.key, { name: e.target.value })} error={errors[`${r.key}.receiverName`]} />
                <TextInput label="Số điện thoại" name={`phone-${r.key}`} type="tel" value={r.phone} autoComplete={index === 0 ? 'tel' : 'off'}
                  onChange={(e) => update(r.key, { phone: e.target.value })} error={errors[`${r.key}.receiverPhone`]} />
                <Field label="Tỉnh/thành phố" name={`province-${r.key}`}>
                  <SearchableSelect id={`province-${r.key}`} value={r.provinceCode} groups={provinceGroups}
                    placeholder="Tìm tỉnh/thành phố" onChange={(provinceCode) => update(r.key, { provinceCode, wardCode: '' })} />
                </Field>
                <Field label="Xã/phường/đặc khu" name={`ward-${r.key}`} error={errors[`${r.key}.ward`]}>
                  <SearchableSelect id={`ward-${r.key}`} value={r.wardCode} groups={wardGroups(r.provinceCode)}
                    placeholder="Tìm xã/phường/đặc khu" disabled={!r.provinceCode}
                    onChange={(wardCode) => update(r.key, { wardCode })} />
                </Field>
                <TextInput label="Số nhà, tên đường" name={`street-${r.key}`} value={r.street} autoComplete={index === 0 ? 'street-address' : 'off'}
                  onChange={(e) => update(r.key, { street: e.target.value })} error={errors[`${r.key}.shippingAddress`]} className="md:col-span-2" />
              </div>

              {recipients.length > 1 && (
                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-small font-semibold text-navy">Gửi cho người này</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {items.map((item) => {
                      const mine = carts[index].find((c) => c.lineId === item.lineId)?.quantity ?? 0
                      return (
                        <li key={item.lineId} className="flex items-center justify-between gap-3 text-small">
                          <span className="min-w-0">{item.productName}<span className="block text-muted">{item.variantName} · trong giỏ {item.quantity}</span></span>
                          {index === 0 ? (
                            <span className="shrink-0 font-semibold">{Math.max(mine, 0)} (phần còn lại)</span>
                          ) : (
                            <input type="number" min={0} max={item.quantity} aria-label={`Số lượng ${item.productName} cho người nhận ${index + 1}`}
                              className="input w-20 shrink-0 text-right" value={r.qty[item.lineId] ?? 0}
                              onChange={(e) => update(r.key, { qty: { ...r.qty, [item.lineId]: Math.max(0, Math.floor(Number(e.target.value) || 0)) } })} />
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </section>
          ))}

          <button type="button" className="btn btn-outline self-start" onClick={() => setRecipients((list) => [...list, newRecipient()])}>
            <Plus className="size-4" aria-hidden /> Thêm người nhận (giao tới địa chỉ khác)
          </button>
          {overAllocated.length > 0 && (
            <Notice tone="danger">
              Số lượng chia cho người nhận vượt quá số trong giỏ: {overAllocated.map((i) => i.productName).join(', ')}.
            </Notice>
          )}

          <section className="card p-5 md:p-6" aria-labelledby="pay-title">
            <h2 id="pay-title" className="text-h3">Thanh toán</h2>
            {previewLoading ? (
              <Spinner label="Đang tính tiền..." />
            ) : previewError ? (
              <div className="mt-4"><Notice tone="danger">{previewError}</Notice></div>
            ) : previews && (
              <div className="mt-5 flex flex-col gap-4">
                {groups.map((g) => {
                  const rows = byProvider(g.providerId)
                  if (rows.length === 0) return null
                  const total = sum(rows.map((p) => p.totalAmount))
                  const minDeposit = sum(rows.map((p) => p.minDepositAmount))
                  const choice = effectiveChoices[g.providerId]
                  const options: Array<{ value: PayChoice; title: string; note: string; disabled?: boolean }> = [
                    {
                      value: 'COD',
                      title: 'Thanh toán khi nhận (COD)',
                      note: codAllowed(g.providerId) ? 'Không cần cọc trước' : `Không áp dụng: đơn từ ${formatVnd(COD_MAX_TOTAL)} hoặc có in tên`,
                      disabled: !codAllowed(g.providerId),
                    },
                    { value: 'MIN_DEPOSIT', title: `VietQR — cọc ${DEPOSIT_RATE * 100}%`, note: `Chuyển ${formatVnd(minDeposit)} trong 5 giờ; xưởng xác nhận khi nhận tiền` },
                    { value: 'FULL', title: 'VietQR — trả đủ', note: `Chuyển ${formatVnd(total)} trong 5 giờ; xưởng xác nhận khi nhận tiền` },
                  ]
                  return (
                    <fieldset key={g.providerId} className="rounded-sm border border-line p-4">
                      <legend className="px-1 font-semibold text-navy">
                        {g.storeName} · {formatVnd(total)}{rows.length > 1 && ` (${rows.length} đơn)`}
                      </legend>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {options.map((o) => (
                          <label key={o.value} className={cn(
                            'flex cursor-pointer gap-2 rounded-sm border p-3 transition-colors',
                            choice === o.value ? 'border-navy bg-champagne/40' : 'border-line',
                            o.disabled && 'cursor-not-allowed opacity-50',
                          )}>
                            <input type="radio" name={`pay-${g.providerId}`} className="mt-0.5 accent-navy"
                              checked={choice === o.value} disabled={o.disabled}
                              onChange={() => setChoices((c) => ({ ...c, [g.providerId]: o.value }))} />
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
              <span className="font-semibold text-navy">Yêu cầu xuất hoá đơn VAT cho doanh nghiệp</span>
            </label>
            {wantVat && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TextInput label="Mã số thuế" name="taxCode" inputMode="numeric" placeholder="0123456789 hoặc 0123456789-001" error={errors['vat.taxCode']} />
                <TextInput label="Tên công ty" name="companyName" error={errors['vat.companyName']} />
                <TextInput label="Địa chỉ công ty" name="companyAddress" error={errors['vat.companyAddress']} className="md:col-span-2" />
                <TextInput label="Email nhận hoá đơn" name="invoiceEmail" type="email" error={errors['vat.invoiceEmail']} className="md:col-span-2" />
              </div>
            )}
          </section>
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="text-h3">Chi tiết đơn hàng ({groups.length} xưởng{active.length > 1 && ` · ${active.length} người nhận`})</h2>
          <div className="mt-4">
            <OrderItemsSummary groups={groups} deliveryDates={deliveryDates} />
          </div>
          {promoLines.length > 0 && (
            <ul className="mt-4 flex flex-col gap-1 rounded-sm bg-success-soft p-3 text-small text-success">
              {promoLines.map((l, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span>{l.productName} · {l.promotion}</span>
                  <span className="shrink-0">−{formatVnd(l.listAmount - l.subtotal)}</span>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-4 flex flex-col gap-1 border-t border-line pt-4 text-small">
            {discount > 0 && (
              <>
                <div className="flex justify-between text-muted"><dt>Giá gốc</dt><dd>{formatVnd(grandTotal + discount)}</dd></div>
                <div className="flex justify-between text-success"><dt>Khuyến mãi</dt><dd>−{formatVnd(discount)}</dd></div>
              </>
            )}
            <div className="flex justify-between text-muted"><dt>Giao hàng</dt><dd>Miễn phí</dd></div>
            <div className="flex justify-between">
              <dt className="font-semibold text-ink">Tổng cộng</dt>
              <dd className="font-sans text-h3 text-navy">{formatVnd(grandTotal)}</dd>
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
          {submitError && <div className="mt-4"><Notice tone="danger">{submitError}</Notice></div>}
          <button type="submit" className="btn btn-primary mt-5 w-full"
            disabled={submitting || previewLoading || !!previewError || overAllocated.length > 0 || active.length === 0}>
            {submitting ? 'Đang giữ chỗ...' : active.length > 1 ? `Xác nhận đặt ${active.length} đơn giao` : 'Xác nhận đặt hàng'}
          </button>
        </aside>
      </form>
    </div>
  )
}
