import { Link, useSearchParams } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { PAYMENT_METHOD_LABEL, ROUTES } from '../../constants'
import { formatDate } from '../../lib/format'
import { OrderPaymentPanel } from '../../components/OrderPaymentPanel'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, Spinner } from '../../components/ui/States'

/** Sau Checkout: mỗi xưởng một đơn; mỗi đơn PayOS có link và QR riêng. */
export function PaymentPage() {
  useDocumentTitle('Đặt hàng thành công')
  const [params] = useSearchParams()
  const idsParam = params.get('ids') ?? ''
  const { data, loading, error, reload } = useApi(
    () => Promise.all(idsParam.split(',').filter(Boolean).map((id) => orderService.detail(id))),
    [idsParam],
  )

  if (loading) return <Spinner />
  const hasOnlinePayment = data?.some((o) => o.paymentMethod === 'PAYOS' && o.status === 'PENDING_DEPOSIT')

  return (
    <div className="page section">
      <PageHeader
        eyebrow="Đặt hàng thành công"
        title={hasOnlinePayment ? 'Thanh toán PayOS' : 'Đơn hàng đã được xác nhận'}
        description={hasOnlinePayment ? 'Mỗi xưởng một mã QR riêng. Thanh toán từng đơn trước khi hết hạn 5 giờ.' : undefined}
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
              <OrderPaymentPanel order={order} />
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
