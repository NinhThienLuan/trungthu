import { Link, useSearchParams } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, ROUTES } from '../../constants'
import { cn, formatDate, formatDateTime, formatVnd } from '../../lib/format'
import { OrderStatusChip } from '../../components/OrderStatusChip'
import { StitchPagination } from '../../components/StitchPagination'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/States'
import type { OrderStatus } from '../../types/order'

const PAGE_SIZE = 10
const STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]

/** GET /api/orders/me: lọc trạng thái + phân trang (bộ lọc nằm trên URL) */
export function MyOrdersPage() {
  useDocumentTitle('Đơn của tôi')
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') as OrderStatus | null) ?? undefined
  const page = Number(params.get('page') ?? 0)
  const { data, loading, error, reload } = useApi(() => orderService.myOrders({ page, size: PAGE_SIZE, status }), [page, status])

  const update = (next: { status?: OrderStatus; page?: number }) => {
    const p = new URLSearchParams()
    if (next.status) p.set('status', next.status)
    if (next.page) p.set('page', String(next.page))
    setParams(p)
  }

  return (
    <div className="page section">
      <PageHeader title="Đơn của tôi" />

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Lọc theo trạng thái">
        <button type="button" className={cn('chip', !status && 'chip-active')} onClick={() => update({})}>
          Tất cả
        </button>
        {STATUSES.map((s) => (
          <button key={s} type="button" className={cn('chip', status === s && 'chip-active')} onClick={() => update({ status: s })}>
            {ORDER_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title={status ? 'Không có đơn ở trạng thái này' : 'Bạn chưa có đơn hàng nào'}
          action={<Link to={ROUTES.products} className="btn btn-primary">Mua sắm ngay</Link>}
        />
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {data.content.map((order) => (
              <li key={order.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow">Đơn {order.code}</p>
                    <h2 className="mt-1 text-h3">{order.storeName}</h2>
                    <p className="text-small text-muted">
                      Đặt {formatDateTime(order.createdAt)} · Nhận {formatDate(order.deliveryDate)}
                    </p>
                  </div>
                  <OrderStatusChip status={order.status} />
                </div>
                <dl className="mt-4 grid gap-x-6 gap-y-1 text-small sm:grid-cols-[auto_1fr]">
                  <dt className="text-muted">Thanh toán</dt>
                  <dd>
                    {PAYMENT_METHOD_LABEL[order.paymentMethod]} · {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                  </dd>
                  <dt className="text-muted">Đã trả / còn lại</dt>
                  <dd>
                    {formatVnd(order.paidAmount)} / {formatVnd(order.remainingAmount)}
                  </dd>
                </dl>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-navy">Tổng {formatVnd(order.totalAmount)}</p>
                  <Link to={ROUTES.order(order.id)} className={cn('btn btn-sm', order.status === 'PENDING_DEPOSIT' ? 'btn-primary' : 'btn-outline')}>
                    {order.status === 'PENDING_DEPOSIT' ? 'Thanh toán cọc' : 'Xem chi tiết'}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <StitchPagination page={data.page} totalPages={data.totalPages} onChange={(p) => update({ status, page: p })} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
