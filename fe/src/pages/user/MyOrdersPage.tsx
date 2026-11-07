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
import { BuyerRfqDashboard } from '../../components/BuyerRfqDashboard'
import { Icon } from '../../components/Icon'
import type { OrderStatus } from '../../types/order'

const PAGE_SIZE = 10
const STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]

/** GET /api/orders/me: lọc trạng thái + phân trang (bộ lọc nằm trên URL) */
export function MyOrdersPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'rfq' ? 'rfq' : 'retail'
  useDocumentTitle(tab === 'rfq' ? 'Đơn lớn & Báo giá B2B' : 'Đơn của tôi')

  const status = (params.get('status') as OrderStatus | null) ?? undefined
  const page = Number(params.get('page') ?? 0)
  const { data, loading, error, reload } = useApi(
    () => (tab === 'retail' ? orderService.myOrders({ page, size: PAGE_SIZE, status }) : Promise.resolve(null)),
    [tab, page, status],
  )

  const update = (next: { status?: OrderStatus; page?: number }) => {
    const p = new URLSearchParams()
    if (tab === 'rfq') p.set('tab', 'rfq')
    if (next.status) p.set('status', next.status)
    if (next.page) p.set('page', String(next.page))
    setParams(p)
  }

  const switchTab = (nextTab: 'retail' | 'rfq') => {
    const p = new URLSearchParams()
    if (nextTab === 'rfq') {
      p.set('tab', 'rfq')
    }
    setParams(p)
  }

  return (
    <div className="page section">
      <PageHeader
        title={tab === 'rfq' ? 'Đơn Lớn & Báo Giá Doanh Nghiệp (B2B)' : 'Đơn Hàng Của Tôi'}
        description="Theo dõi chi tiết tiến độ đặt bánh, giao nhận và các yêu cầu báo giá sỉ với xưởng nghệ nhân."
      />

      {/* Tabs chuyển đổi giữa Đơn lẻ và Đơn lớn B2B */}
      <div className="mb-6 flex border-b border-line gap-2" role="tablist" aria-label="Phân loại đơn hàng">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'retail'}
          onClick={() => switchTab('retail')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all cursor-pointer',
            tab === 'retail'
              ? 'border-secondary text-secondary font-bold'
              : 'border-transparent text-muted hover:text-navy',
          )}
        >
          <Icon name="receipt_long" className="text-[18px]" aria-hidden />
          <span>Đơn Hàng Lẻ</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === 'rfq'}
          onClick={() => switchTab('rfq')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all cursor-pointer',
            tab === 'rfq'
              ? 'border-secondary text-secondary font-bold'
              : 'border-transparent text-muted hover:text-navy',
          )}
        >
          <Icon name="request_quote" className="text-[18px]" aria-hidden />
          <span>Đơn Lớn & Báo Giá B2B</span>
        </button>
      </div>

      {tab === 'rfq' ? (
        <BuyerRfqDashboard />
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
