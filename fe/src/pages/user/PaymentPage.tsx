import { Link, useSearchParams } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { PAYMENT_METHOD_LABEL, ROUTES } from '../../constants'
import { formatDate, formatVnd } from '../../lib/format'
import { OrderPaymentPanel } from '../../components/OrderPaymentPanel'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, Spinner } from '../../components/ui/States'
import type { OrderDetail } from '../../types/order'

/** Sau Checkout: mỗi xưởng một đơn và một mã thanh toán riêng. */
export function PaymentPage() {
  useDocumentTitle('Đặt hàng thành công')
  const [params] = useSearchParams()
  const idsParam = params.get('ids') ?? ''
  const { data, loading, error, reload } = useApi(
    () => Promise.all(idsParam.split(',').filter(Boolean).map((id) => orderService.detail(id))),
    [idsParam],
  )

  if (loading) return <Spinner />
  const hasVietQr = data?.some((o) => o.paymentMethod === 'VIETQR' && o.status === 'PENDING_DEPOSIT')

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
          {data?.map((order) => (
            <section key={order.id} className="card p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="eyebrow">Đơn {order.code}</p>
                  <h2 className="mt-1 text-h3">{order.storeName}</h2>
                </div>
                <p className="text-small text-muted">
                  Nhận {formatDate(order.deliveryDate)} · {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                <OrderPaymentPanel order={order} />
                <OrderSummary order={order} />
              </div>
            </section>
          ))}
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
  return (
    <div className="rounded-sm border border-line p-4 text-small">
      <h3 className="font-semibold text-navy">Chi tiết đơn hàng</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {order.lines.map((line, i) => (
          <li key={`${line.variantId}-${i}`} className="flex justify-between gap-3">
            <span>
              {line.productName} <span className="text-muted">· {line.variantName} × {line.quantity}</span>
            </span>
            <span className="shrink-0">{formatVnd(line.subtotal)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 flex flex-col gap-1 border-t border-line pt-3">
        <div className="flex justify-between text-muted"><dt>Tạm tính</dt><dd>{formatVnd(order.subtotalAmount)}</dd></div>
        {!!order.discountAmount && <div className="flex justify-between text-success"><dt>Đã giảm (khuyến mãi)</dt><dd>{formatVnd(order.discountAmount)}</dd></div>}
        <div className="flex justify-between text-muted"><dt>Giao hàng</dt><dd>Miễn phí</dd></div>
        <div className="flex justify-between font-semibold text-navy"><dt>Tổng cộng</dt><dd>{formatVnd(order.totalAmount)}</dd></div>
      </dl>
      <p className="mt-3 text-muted">Giao tới: {order.receiverName} · {order.receiverPhone}<br />{order.shippingAddress}</p>
    </div>
  )
}
