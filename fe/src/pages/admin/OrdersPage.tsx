import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatDate, formatDateTime, formatVnd } from '../../lib/format'
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '../../constants'
import { sellerService } from '../../services/sellerService'
import { orderService } from '../../services/orderService'
import type { OrderDetail, OrderStatus } from '../../types/order'
import { OrderStatusChip } from '../../components/OrderStatusChip'
import { TextInput } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/States'

const FILTERS: OrderStatus[] = ['PENDING_DEPOSIT', 'CONFIRMED', 'DEPOSITED', 'BAKING_QUEUED', 'DELIVERING', 'COMPLETED', 'CANCELLED']
const PAGE_SIZE = 20
/** Mã đơn BE là ORD-<uuid 32 ký tự>: bảng chỉ hiện 8 ký tự cuối, rê chuột để xem đủ */
const shortCode = (code: string) => (code.length > 16 ? `…${code.slice(-8).toUpperCase()}` : code)

/** Bước kế tiếp seller được làm (khớp OrderStatus.canTransitionTo ở BE) */
const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  CONFIRMED: { to: 'BAKING_QUEUED', label: 'Đưa vào mẻ nướng' },
  DEPOSITED: { to: 'BAKING_QUEUED', label: 'Đưa vào mẻ nướng' },
  BAKING_QUEUED: { to: 'DELIVERING', label: 'Bắt đầu giao' },
  DELIVERING: { to: 'COMPLETED', label: 'Hoàn tất đơn' },
}

/** Seller: danh sách đơn của xưởng, xác nhận cọc VietQR, chuyển trạng thái, huỷ đơn chưa cọc */
export function OrdersPage() {
  useDocumentTitle('Đơn hàng')
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') as OrderStatus | null) ?? undefined
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string>()
  const list = useApi(() => sellerService.orders({ page, size: PAGE_SIZE, status }), [page, status])

  const filter = (s?: OrderStatus) => {
    setPage(0)
    setParams(s ? { status: s } : {})
  }

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Gian hàng" title="Đơn hàng" description="Chờ cọc → Đã cọc → Vào mẻ nướng → Đang giao → Hoàn tất. Chỉ huỷ được đơn chưa cọc hoặc COD chưa nướng." />

      <div className="flex flex-wrap gap-2">
        <button type="button" className={cn('chip', !status && 'chip-active')} onClick={() => filter()}>Tất cả</button>
        {FILTERS.map((s) => (
          <button key={s} type="button" className={cn('chip', status === s && 'chip-active')} onClick={() => filter(s)}>{ORDER_STATUS_LABEL[s]}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="card overflow-x-auto p-0">
          {list.loading ? <Spinner /> : list.error ? <ErrorState message={list.error} onRetry={list.reload} />
            : !list.data?.content.length ? <EmptyState title="Không có đơn nào" /> : (
              <table className="w-full text-small">
                <thead className="text-left text-muted">
                  <tr><th className="p-3">Mã đơn</th><th>Ngày nhận</th><th className="text-right">Tổng</th><th className="p-3">Trạng thái</th></tr>
                </thead>
                <tbody>
                  {list.data.content.map((o) => (
                    <tr key={o.id} onClick={() => setSelectedId(o.id)}
                      className={cn('cursor-pointer border-t border-line hover:bg-champagne/30', selectedId === o.id && 'bg-champagne/40')}>
                      <td className="p-3"><button type="button" title={o.code} className="whitespace-nowrap font-medium underline-offset-2 hover:underline">{shortCode(o.code)}</button></td>
                      <td className="whitespace-nowrap">{formatDate(o.deliveryDate)}</td>
                      <td className="whitespace-nowrap text-right">{formatVnd(o.totalAmount)}<span className="block text-muted">Đã thu {formatVnd(o.paidAmount)}</span></td>
                      <td className="whitespace-nowrap p-3"><OrderStatusChip status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          {list.data && list.data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-line p-3 text-small">
              <button type="button" className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button>
              <span>Trang {page + 1}/{list.data.totalPages}</span>
              <button type="button" className="btn btn-outline btn-sm" disabled={page + 1 >= list.data.totalPages} onClick={() => setPage(page + 1)}>Sau</button>
            </div>
          )}
        </section>

        {selectedId
          ? <OrderPanel key={selectedId} id={selectedId} onChanged={list.reload} />
          : <p className="card p-5 text-small text-muted">Chọn một đơn để xem chi tiết và xử lý.</p>}
      </div>
    </div>
  )
}

function OrderPanel({ id, onChanged }: { id: string; onChanged: () => void }) {
  const { data: order, loading, error, reload } = useApi(() => orderService.detail(id), [id])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string }>()

  const run = async (action: () => Promise<OrderDetail>, done: string) => {
    setBusy(true)
    setResult(undefined)
    try {
      await action()
      setResult({ ok: true, text: done })
      reload()
      onChanged()
    } catch (err) {
      setResult({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  if (loading && !order) return <Spinner />
  if (error || !order) return <ErrorState message={error ?? 'Không tải được đơn'} onRetry={reload} />

  const next = NEXT[order.status]
  const cancellable = order.status === 'PENDING_DEPOSIT' || (order.status === 'CONFIRMED' && order.paymentMethod === 'COD')

  const confirmDeposit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const amount = Number(new FormData(e.currentTarget).get('receivedAmount'))
    run(() => sellerService.confirmDeposit(order.id, amount), 'Đã xác nhận nhận cọc.')
  }

  return (
    <section className="card flex flex-col gap-4 p-5" aria-busy={busy}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-h3" title={order.code}>Đơn {shortCode(order.code)}</h2>
          <p className="text-small text-muted">Đặt {formatDateTime(order.createdAt)} · Nhận {formatDate(order.deliveryDate)}</p>
        </div>
        <span className="shrink-0"><OrderStatusChip status={order.status} /></span>
      </div>

      <div className="text-small">
        <p className="font-medium">{order.receiverName} · {order.receiverPhone}</p>
        <p className="text-muted">{order.shippingAddress}</p>
      </div>

      <ul className="flex flex-col gap-2 text-small">
        {order.lines.map((l) => (
          <li key={l.variantId} className="flex justify-between gap-3 border-t border-line pt-2">
            <span>{l.productName}<span className="block text-muted">{l.variantName} · {l.quantity} × {formatVnd(l.unitPrice)}</span></span>
            <span>{formatVnd(l.subtotal)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-line pt-2"><span>Phí giao hàng</span><span>{formatVnd(order.shippingFee)}</span></li>
        <li className="flex justify-between font-medium"><span>Tổng cộng</span><span>{formatVnd(order.totalAmount)}</span></li>
        <li className="flex justify-between text-muted"><span>{PAYMENT_METHOD_LABEL[order.paymentMethod]} · đã thu</span><span>{formatVnd(order.paidAmount)}</span></li>
        <li className="flex justify-between text-muted"><span>Còn lại</span><span>{formatVnd(order.remainingAmount)}</span></li>
      </ul>

      {result && <Notice tone={result.ok ? 'success' : 'danger'}>{result.text}</Notice>}

      {order.status === 'PENDING_DEPOSIT' && (
        <form noValidate onSubmit={confirmDeposit} className="flex flex-col gap-3 border-t border-line pt-4">
          <Notice>Chỉ xác nhận khi tiền đã vào tài khoản. Hạn giữ chỗ: {order.holdExpiresAt ? formatDateTime(order.holdExpiresAt) : '—'}.</Notice>
          <TextInput label={`Số tiền đã nhận (từ ${formatVnd(order.depositAmount)} đến ${formatVnd(order.totalAmount)})`} name="receivedAmount"
            type="number" min={order.depositAmount} max={order.totalAmount} defaultValue={order.depositAmount} required />
          <button type="submit" className="btn btn-primary self-start" disabled={busy}>Xác nhận đã nhận cọc</button>
        </form>
      )}

      {next && (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          {next.to === 'COMPLETED' && order.remainingAmount > 0 && (
            <Notice>Hoàn tất nghĩa là đã thu đủ {formatVnd(order.remainingAmount)} còn lại khi giao.</Notice>
          )}
          <button type="button" className="btn btn-primary self-start" disabled={busy}
            onClick={() => run(() => sellerService.changeStatus(order.id, next.to,
              next.to === 'COMPLETED' && order.remainingAmount > 0 ? order.remainingAmount : undefined), `Đã chuyển sang "${ORDER_STATUS_LABEL[next.to]}".`)}>
            {next.label}
          </button>
        </div>
      )}

      {cancellable && (
        <button type="button" className="btn btn-ghost self-start text-danger" disabled={busy}
          onClick={() => window.confirm(`Huỷ đơn ${shortCode(order.code)}? Tồn kho và năng lực nướng sẽ được hoàn lại.`)
            && run(() => orderService.cancel(order.id), 'Đã huỷ đơn.')}>
          Huỷ đơn
        </button>
      )}
    </section>
  )
}
