import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { CANCELLABLE_STATUSES, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, ROUTES } from '../../constants'
import { formatDate, formatDateTime, formatVnd } from '../../lib/format'
import { OrderPaymentPanel } from '../../components/OrderPaymentPanel'
import { OrderStatusChip } from '../../components/OrderStatusChip'
import { ErrorState, Notice, Spinner } from '../../components/ui/States'

/** GET /api/orders/{id} + huỷ đơn (POST /api/orders/{id}/cancel) khi còn được phép */
export function OrderDetailPage() {
  const { id = '' } = useParams()
  const { data: order, loading, error, reload } = useApi(() => orderService.detail(id), [id])
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string>()
  useDocumentTitle(order ? `Đơn ${order.code}` : 'Chi tiết đơn')

  if (loading) return <Spinner />
  if (error || !order) {
    return (
      <div className="page section">
        <ErrorState message={error ?? 'Không tìm thấy đơn hàng'} onRetry={reload} />
      </div>
    )
  }

  const handleCancel = async () => {
    if (!window.confirm(`Huỷ đơn ${order.code}? Hàng và suất nướng sẽ được trả lại cho xưởng.`)) return
    setCancelling(true)
    setCancelError(undefined)
    try {
      await orderService.cancel(order.id)
      reload()
    } catch (err) {
      setCancelError(errorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="page section">
      <Link to={ROUTES.orders} className="mb-6 inline-flex items-center gap-1 text-small text-muted hover:text-navy">
        <ChevronLeft className="size-4" aria-hidden /> Đơn của tôi
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 pb-6">
        <div>
          <p className="eyebrow">Đơn {order.code}</p>
          <h1 className="mt-1 text-h1">{order.storeName}</h1>
          <p className="mt-1 text-small text-muted">
            Đặt {formatDateTime(order.createdAt)} · Nhận {formatDate(order.deliveryDate)}
          </p>
        </div>
        <OrderStatusChip status={order.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <section className="card p-5 md:p-6">
            <h2 className="text-h3">Thanh toán</h2>
            <p className="mt-1 text-small text-muted">
              {PAYMENT_METHOD_LABEL[order.paymentMethod]} · {PAYMENT_STATUS_LABEL[order.paymentStatus]}
            </p>
            <div className="mt-4">
              <OrderPaymentPanel order={order} />
            </div>
          </section>

          <section className="card p-5 md:p-6">
            <h2 className="text-h3">Sản phẩm</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {order.lines.map((line, i) => (
                <li key={`${line.variantId}-${i}`} className="flex justify-between gap-4 text-small">
                  <span>
                    <span className="font-semibold text-navy">{line.productName}</span>
                    <span className="text-muted"> · {line.variantName}</span>
                    <span className="block text-muted">
                      {line.quantity} × {formatVnd(line.unitPrice)}
                    </span>
                    {line.boxContents && <span className="block text-muted">Gồm: {line.boxContents.join(', ')}</span>}
                  </span>
                  <span className="shrink-0 font-semibold text-navy">{formatVnd(line.subtotal)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-6">
          <section className="card p-5">
            <h2 className="text-h3">Số tiền</h2>
            <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-1.5 text-small">
              <dt className="text-muted">Tiền hàng</dt>
              <dd>{formatVnd(order.subtotalAmount)}</dd>
              <dt className="text-muted">Phí giao hàng</dt>
              <dd>{formatVnd(order.shippingFee)}</dd>
              <dt className="font-semibold">Tổng</dt>
              <dd className="font-semibold text-navy">{formatVnd(order.totalAmount)}</dd>
              <dt className="text-muted">Đã thanh toán</dt>
              <dd>{formatVnd(order.paidAmount)}</dd>
              <dt className="text-muted">Còn lại</dt>
              <dd>{formatVnd(order.remainingAmount)}</dd>
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="text-h3">Người nhận</h2>
            <p className="mt-3 text-small text-ink">{order.receiverName}</p>
            <p className="text-small text-muted">{order.receiverPhone}</p>
            <p className="mt-1 text-small text-muted">{order.shippingAddress}</p>
          </section>

          {CANCELLABLE_STATUSES.includes(order.status) && (
            <div>
              {cancelError && (
                <div className="mb-3">
                  <Notice tone="danger">{cancelError}</Notice>
                </div>
              )}
              <button type="button" className="btn btn-outline w-full" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Đang huỷ...' : 'Huỷ đơn'}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
