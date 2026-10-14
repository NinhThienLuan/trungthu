import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { orderApi } from '../apis/orders'
import { errorMessage } from '../apis/http'
import { groupByProvider, useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { checkoutSchema, fieldErrors } from '../schemas'
import { DEPOSIT_RATE, ROUTES } from '../constants'
import { formatDate, formatVnd } from '../lib/format'
import { TextArea, TextInput } from '../components/ui/Field'
import { PageHeader } from '../components/ui/PageHeader'
import { Notice } from '../components/ui/States'
import type { CheckoutRequest } from '../types/order'

export function CheckoutPage() {
  useDocumentTitle('Thanh toán')
  const { items, deliveryDates, clear } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [wantVat, setWantVat] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const groups = groupByProvider(items)
  if (groups.length === 0 || groups.some((g) => !deliveryDates[g.providerId])) {
    return <Navigate to={ROUTES.cart} replace />
  }
  const total = groups.reduce((sum, g) => sum + g.subtotal, 0)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    const parsed = checkoutSchema.safeParse({
      receiverName: form.receiverName,
      receiverPhone: form.receiverPhone,
      shippingAddress: form.shippingAddress,
      note: form.note || undefined,
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
    setSubmitting(true)

    const body: CheckoutRequest = {
      ...parsed.data,
      groups: groups.map((g) => ({
        providerId: g.providerId,
        deliveryDate: deliveryDates[g.providerId],
        items: g.items.filter((i) => i.kind === 'single').map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        boxes: g.items
          .filter((i) => i.kind === 'box')
          .map((i) => ({
            boxVariantId: i.variantId,
            quantity: i.quantity,
            cakeVariantIds: (i.slots ?? []).map((s) => s.variantId),
            note: i.note,
          })),
      })),
    }
    try {
      const orders = await orderApi.checkout(body, items)
      clear()
      navigate(`${ROUTES.payment}?ids=${orders.map((o) => o.id).join(',')}`, { replace: true })
    } catch (err) {
      // BE rollback toàn bộ nếu 1 xưởng hết slot -> giữ nguyên giỏ để khách chọn lại ngày
      setSubmitError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page section">
      <PageHeader title="Thông tin đặt hàng" />

      <form noValidate onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <section className="card p-5 md:p-6">
            <h2 className="text-h3">Người nhận</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextInput label="Họ tên" name="receiverName" defaultValue={user?.fullName} autoComplete="name" error={errors.receiverName} />
              <TextInput label="Số điện thoại" name="receiverPhone" type="tel" defaultValue={user?.phone ?? ''} autoComplete="tel" error={errors.receiverPhone} />
              <TextInput label="Địa chỉ giao hàng" name="shippingAddress" defaultValue={user?.address ?? ''} autoComplete="street-address" error={errors.shippingAddress} className="md:col-span-2" />
              <TextArea label="Ghi chú (không bắt buộc)" name="note" error={errors.note} className="md:col-span-2" />
            </div>
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
          <h2 className="text-h3">{groups.length} đơn hàng</h2>
          <ul className="mt-4 flex flex-col gap-3 text-small">
            {groups.map((g) => (
              <li key={g.providerId} className="rounded-sm bg-ivory p-3">
                <p className="font-semibold text-navy">{g.storeName}</p>
                <p className="text-muted">Nhận {formatDate(deliveryDates[g.providerId])}</p>
                <p className="mt-1 flex justify-between">
                  <span className="text-muted">{g.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm</span>
                  <span>{formatVnd(g.subtotal)}</span>
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-semibold">Tổng cộng</span>
            <span className="font-serif text-h3 text-navy">{formatVnd(total)}</span>
          </div>
          <div className="mt-1 flex justify-between text-small text-muted">
            <span>Cọc {DEPOSIT_RATE * 100}%</span>
            <span>{formatVnd(Math.ceil(total * DEPOSIT_RATE))}</span>
          </div>
          {submitError && (
            <div className="mt-4">
              <Notice tone="danger">{submitError}</Notice>
            </div>
          )}
          <button type="submit" className="btn btn-primary mt-5 w-full" disabled={submitting}>
            {submitting ? 'Đang giữ chỗ...' : 'Xác nhận đặt hàng'}
          </button>
        </aside>
      </form>
    </div>
  )
}
