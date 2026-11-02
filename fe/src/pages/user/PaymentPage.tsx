import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { PAYMENT_METHOD_LABEL, ROUTES } from '../../constants'
import { formatDate, formatVnd } from '../../lib/format'
import { displayOrderLines } from '../../lib/orderDisplay'
import { cn } from '../../lib/format'
import { OrderPaymentPanel } from '../../components/OrderPaymentPanel'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, Spinner } from '../../components/ui/States'
import type { OrderDetail } from '../../types/order'

/** Sau Checkout: mỗi xưởng một đơn và một mã thanh toán riêng. */
export function PaymentPage() {
  useDocumentTitle('Đặt hàng thành công')
  const [params] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const idsParam = params.get('ids') ?? ''
  const { data, loading, error, reload } = useApi(
    () => Promise.all(idsParam.split(',').filter(Boolean).map((id) => orderService.detail(id))),
    [idsParam],
  )

  if (loading) return <Spinner />
  const hasVietQr = data?.some((o) => o.paymentMethod === 'VIETQR' && o.status === 'PENDING_DEPOSIT')
  const selected = data?.find((order) => order.id === selectedId) ?? data?.[0]

  return (
    <div className="page section">
      <PageHeader
        eyebrow="Đặt hàng thành công"
        title={hasVietQr ? 'Thanh toán VietQR' : 'Đơn hàng đã được xác nhận'}
        description={hasVietQr ? 'Mỗi xưởng một mã QR riêng. Thanh toán từng đơn trước khi hết hạn 5 giờ.' : undefined}
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="flex flex-col gap-6">
          {data && data.length > 1 && (
            <div className="card p-5 md:p-6" aria-label="Chọn đơn để thanh toán">
              <h2 className="text-h3">Chọn đơn để thanh toán</h2>
              <p className="mt-1 text-small text-muted">Mỗi đơn có mã QR và số tiền riêng. Hãy chọn một đơn để xem chi tiết.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {data.map((order) => (
                  <button key={order.id} type="button" aria-pressed={selected?.id === order.id}
                    onClick={() => setSelectedId(order.id)}
                    className={cn('rounded-sm border p-4 text-left transition-colors',
                      selected?.id === order.id ? 'border-navy bg-champagne/40' : 'border-line hover:bg-ivory')}>
                    <span className="block font-semibold text-navy">{order.storeName} · {order.code}</span>
                    <span className="block text-small text-muted">Giao cho {order.receiverName} · {formatDate(order.deliveryDate)}</span>
                    <span className="mt-2 block font-semibold text-gold-ink">
                      {order.paymentMethod === 'VIETQR' && order.status === 'PENDING_DEPOSIT'
                        ? `Cần chuyển ${formatVnd(order.depositAmount)}`
                        : order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Đã xác nhận thanh toán'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {selected && (
            <section key={selected.id} className="card p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="eyebrow">Đơn {selected.code}</p>
                  <h2 className="mt-1 text-h3">{selected.storeName}</h2>
                </div>
                <p className="text-small text-muted">
                  Nhận {formatDate(selected.deliveryDate)} · {PAYMENT_METHOD_LABEL[selected.paymentMethod]}
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                <OrderPaymentPanel order={selected} />
                <OrderSummary order={selected} />
              </div>
            </section>
          )}
          <Link to={ROUTES.orders} className="btn btn-outline self-start">
            Xem đơn của tôi
          </Link>
        </div>
      )}
    </div>
  )
}

/** Món trong đơn + tạm tính, khuyến mãi, tổng (số liệu của BE) */
function OrderSummary({ order }: { order: OrderDetail }) {
  const lines = displayOrderLines(order.lines)
  const discount = order.discountAmount ?? 0
  const setOnly = order.lines.length > 0 && order.lines.every((line) => !!line.sourceSetId)
  const hasDeposit = order.paymentMethod === 'VIETQR' && order.status === 'PENDING_DEPOSIT' && order.depositAmount > 0
  return (
    <div className="rounded-sm border border-line p-4 text-small">
      <h3 className="font-semibold text-navy">Chi tiết đơn hàng</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {lines.map((line) => (
          <li key={line.key} className="flex justify-between gap-3">
            <span>
              {line.name}{line.quantity && <span className="text-muted"> × {line.quantity}</span>}
              {line.components && <span className="mt-1 block text-muted">
                Gồm: {line.components.map((item) => `${item.productName} · ${item.variantName} × ${item.quantity}`).join('; ')}
              </span>}
            </span>
            <span className="shrink-0">{formatVnd(line.subtotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 flex flex-col gap-1 border-t border-line pt-3">
        <div className="flex justify-between text-muted"><dt>{discount > 0 ? 'Giá gốc' : 'Tạm tính'}</dt>
          <dd>{formatVnd(order.subtotalAmount + discount)}</dd></div>
        {discount > 0 && <div className="flex justify-between text-success">
          <dt>{setOnly ? 'Ưu đãi set quà' : 'Giảm giá'}</dt><dd>−{formatVnd(discount)}</dd>
        </div>}
        <div className="flex justify-between text-muted"><dt>Giao hàng</dt><dd>Miễn phí</dd></div>
        <div className="flex justify-between font-semibold text-navy"><dt>Tổng cộng</dt><dd>{formatVnd(order.totalAmount)}</dd></div>
        {hasDeposit && <>
          <div className="flex justify-between gap-2 text-navy"><dt>{order.depositAmount < order.totalAmount
            ? 'Cọc VietQR (50%, làm tròn lên nghìn)' : 'Chuyển khoản toàn bộ'}</dt>
            <dd className="shrink-0 font-semibold">{formatVnd(order.depositAmount)}</dd></div>
          {order.depositAmount < order.totalAmount && <div className="flex justify-between text-muted">
            <dt>Còn lại khi nhận</dt><dd>{formatVnd(order.totalAmount - order.depositAmount)}</dd>
          </div>}
        </>}
      </dl>
      <p className="mt-3 text-muted">Giao tới: {order.receiverName} · {order.receiverPhone}<br />{order.shippingAddress}</p>
    </div>
  )
}
