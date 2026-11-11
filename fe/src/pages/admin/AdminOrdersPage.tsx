import { AdminListPagination } from '../../components/AdminListPagination'
import { OrderStatusChip } from '../../components/OrderStatusChip'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/States'
import { ORDER_STATUS_LABEL } from '../../constants'
import { useAdminList } from '../../hooks/useAdminList'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatVnd } from '../../lib/format'
import { adminService, type AdminOrder } from '../../services/adminService'
import type { OrderStatus } from '../../types/order'

const STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]
const dateTime = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' })

export function AdminOrdersPage() {
  useDocumentTitle('Đơn hàng hệ thống')
  const { status, setStatus, page, setPage, pagination, data, loading, error, reload } =
    useAdminList(undefined, adminService.orders)

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Quản trị sàn" title="Đơn hàng hệ thống"
        description="Theo dõi đơn hàng từ tất cả gian hàng trên sàn." />

      <div role="group" aria-label="Lọc theo trạng thái đơn hàng" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={status === undefined}
          className={cn('chip', status === undefined && 'chip-active')} onClick={() => setStatus(undefined)}>
          Tất cả
        </button>
        {STATUSES.map((value) => (
          <button key={value} type="button" aria-pressed={status === value}
            className={cn('chip', status === value && 'chip-active')} onClick={() => setStatus(value)}>
            {ORDER_STATUS_LABEL[value]}
          </button>
        ))}
      </div>

      <AdminListPagination data={pagination} page={page} loading={loading} error={error} noun="đơn hàng" onChange={setPage} />

      {loading ? <Spinner label="Đang tải đơn hàng…" />
        : error ? <ErrorState message={error} onRetry={reload} />
        : !data?.content.length ? <EmptyState title={status ? 'Không có đơn hàng ở trạng thái này' : 'Hệ thống chưa có đơn hàng.'} />
        : (
          <div className="flex flex-col gap-4" aria-label="Danh sách đơn hàng">
            {data.content.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
    </div>
  )
}

function OrderCard({ order }: { order: AdminOrder }) {
  const shop = order.storeName?.trim() || order.providerName?.trim() || order.providerEmail
  const buyer = order.buyerName?.trim() || order.buyerEmail

  return (
    <article className="card flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-all text-body font-semibold sm:text-h3">{order.code}</h2>
          <p className="mt-1 text-small text-muted">
            Đặt lúc <time dateTime={order.orderedAt}>{dateTime.format(new Date(order.orderedAt))}</time>
          </p>
        </div>
        <OrderStatusChip status={order.status} />
      </div>
      <dl className="grid gap-3 border-t border-line pt-3 text-small sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="[overflow-wrap:anywhere]">
          <dt className="text-muted">Gian hàng</dt>
          <dd className="font-medium">{shop}</dd>
        </div>
        <div className="[overflow-wrap:anywhere]">
          <dt className="text-muted">Người mua</dt>
          <dd>
            <span className="font-medium">{buyer}</span>
            {buyer !== order.buyerEmail && <span className="block text-muted">{order.buyerEmail}</span>}
          </dd>
        </div>
        <div className="sm:text-right">
          <dt className="text-muted">Tổng tiền</dt>
          <dd className="font-semibold tabular-nums">{formatVnd(order.totalAmount)}</dd>
        </div>
      </dl>
    </article>
  )
}
