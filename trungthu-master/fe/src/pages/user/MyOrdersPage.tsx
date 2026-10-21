import { Link } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ORDER_STATUS_LABEL, ROUTES } from '../../constants'
import { cn, formatDate, formatDateTime, formatVnd } from '../../lib/format'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/States'
import type { OrderStatus } from '../../types/order'

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING_DEPOSIT: 'border-gold bg-champagne text-gold-ink',
  DEPOSITED: 'border-success/30 bg-success-soft text-success',
  BAKING: 'border-success/30 bg-success-soft text-success',
  DELIVERING: 'border-navy/20 bg-ivory text-navy',
  COMPLETED: 'border-navy bg-navy text-gold',
  CANCELLED: 'border-danger/30 bg-danger-soft text-danger',
}

export function MyOrdersPage() {
  useDocumentTitle('Đơn của tôi')
  const { data, loading, error, reload } = useApi(() => orderService.myOrders(), [])

  return (
    <div className="page section">
      <PageHeader title="Đơn của tôi" />
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Bạn chưa có đơn hàng nào" action={<Link to={ROUTES.products} className="btn btn-primary">Mua sắm ngay</Link>} />
      ) : (
        <ul className="flex flex-col gap-4">
          {data.map((order) => (
            <li key={order.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Đơn {order.code}</p>
                  <h2 className="mt-1 text-h3">{order.storeName}</h2>
                  <p className="text-small text-muted">
                    Đặt {formatDateTime(order.createdAt)} · Nhận {formatDate(order.deliveryDate)}
                  </p>
                </div>
                <span className={cn('chip', STATUS_STYLE[order.status])}>{ORDER_STATUS_LABEL[order.status]}</span>
              </div>
              <ul className="mt-4 flex flex-col gap-1 border-t border-line pt-4 text-small">
                {order.lines.map((line, index) => (
                  <li key={`${line.variantId}-${index}`} className="flex justify-between gap-4">
                    <span className="text-muted">
                      {line.productName} · {line.variantName} × {line.quantity}
                      {line.boxContents && <span className="block pl-3">Gồm: {line.boxContents.join(', ')}</span>}
                    </span>
                    <span>{formatVnd(line.unitPrice * line.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-navy">Tổng {formatVnd(order.totalAmount)}</p>
                {order.status === 'PENDING_DEPOSIT' && (
                  <Link to={`${ROUTES.payment}?ids=${order.id}`} className="btn btn-primary btn-sm">
                    Thanh toán cọc
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
