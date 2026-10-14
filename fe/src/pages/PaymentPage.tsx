import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, QrCode } from 'lucide-react'
import { orderApi } from '../apis/orders'
import { useApi } from '../hooks/useApi'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { ROUTES } from '../constants'
import { formatDate, formatVnd } from '../lib/format'
import { PageHeader } from '../components/ui/PageHeader'
import { ErrorState, Notice, Spinner } from '../components/ui/States'
import type { Order } from '../types/order'

function useCountdown(deadline: string | null) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  if (!deadline) return null
  return Math.max(0, Math.floor((Date.parse(deadline) - now) / 1000))
}

function PaymentCard({ order }: { order: Order }) {
  const seconds = useCountdown(order.holdExpiresAt)
  const expired = order.status === 'CANCELLED' || seconds === 0
  const mm = String(Math.floor((seconds ?? 0) / 60)).padStart(2, '0')
  const ss = String((seconds ?? 0) % 60).padStart(2, '0')

  return (
    <section className="card grid gap-6 p-5 md:grid-cols-[12rem_1fr] md:p-6">
      <div className="flex aspect-square items-center justify-center rounded-sm border border-line bg-ivory">
        {order.qrImageUrl ? (
          <img src={order.qrImageUrl} alt={`Mã VietQR đơn ${order.code}`} className="size-full object-contain p-2" />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center text-muted">
            <QrCode className="size-12 text-gold" aria-hidden />
            <span className="text-small">Mã QR sẽ hiển thị khi xưởng cấu hình tài khoản</span>
          </div>
        )}
      </div>

      <div>
        <p className="eyebrow">Đơn {order.code}</p>
        <h2 className="mt-1 text-h3">{order.storeName}</h2>
        <p className="text-small text-muted">Nhận {formatDate(order.deliveryDate)}</p>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-small">
          <dt className="text-muted">Số tiền cọc</dt>
          <dd className="font-serif text-h3 text-navy">{formatVnd(order.depositAmount)}</dd>
          <dt className="text-muted">Tổng đơn</dt>
          <dd>{formatVnd(order.totalAmount)}</dd>
          {order.bankName && (
            <>
              <dt className="text-muted">Ngân hàng</dt>
              <dd>{order.bankName}</dd>
              <dt className="text-muted">Số tài khoản</dt>
              <dd className="font-semibold">{order.bankAccount}</dd>
            </>
          )}
          <dt className="text-muted">Nội dung CK</dt>
          <dd className="font-semibold">{order.transferNote}</dd>
        </dl>

        <div className="mt-4">
          {expired ? (
            <Notice tone="danger">Đã hết thời gian giữ chỗ, đơn bị huỷ. Vui lòng đặt lại.</Notice>
          ) : order.status === 'PENDING_DEPOSIT' && seconds !== null ? (
            <Notice>
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4" aria-hidden />
                Giữ chỗ còn <strong className="tabular-nums">{mm}:{ss}</strong>. Xưởng xác nhận sau khi nhận được cọc.
              </span>
            </Notice>
          ) : (
            <Notice tone="success">Xưởng đã xác nhận cọc.</Notice>
          )}
        </div>
      </div>
    </section>
  )
}

export function PaymentPage() {
  useDocumentTitle('Đặt cọc')
  const [params] = useSearchParams()
  const ids = (params.get('ids') ?? '').split(',').filter(Boolean)
  const { data, loading, error, reload } = useApi(() => orderApi.byIds(ids), [params.get('ids')])

  if (loading) return <Spinner />

  return (
    <div className="page section">
      <PageHeader
        eyebrow="Đặt hàng thành công"
        title="Chuyển khoản đặt cọc"
        description="Mỗi xưởng một mã QR riêng. Chuyển đúng số tiền và nội dung để xưởng đối soát."
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="flex flex-col gap-6">
          {data?.map((order) => <PaymentCard key={order.id} order={order} />)}
          <Link to={ROUTES.orders} className="btn btn-outline self-start">
            Xem đơn của tôi
          </Link>
        </div>
      )}
    </div>
  )
}
