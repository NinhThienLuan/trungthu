import { useState, type FormEvent } from 'react'
import { rfqService } from '../services/rfqService'
import { useApi } from '../hooks/useApi'
import { errorMessage } from '../apis/http'
import { formatDate, formatVnd } from '../lib/format'
import type { BulkOrderResponse } from '../types/order'
import { QrCode } from 'lucide-react'

function DepositQr({ order }: { order: BulkOrderResponse }) {
  const { data, loading, error, reload } = useApi(() => rfqService.vietQr(order.id), [order.id])
  if (loading) return <p>Đang lấy mã QR chuyển cọc...</p>
  if (error || !data) return <p role="alert">Không lấy được mã QR: {error ?? 'Thiếu thông tin thanh toán'} <button type="button" className="underline" onClick={reload}>Thử lại</button></p>
  return <div className="flex flex-wrap items-center gap-4 rounded-md border border-line bg-ivory p-4">
    {data.imageUrl ? <img src={data.imageUrl} alt={`Mã QR chuyển cọc đơn ${order.requestCode}`} className="size-48 rounded bg-white object-contain p-1" />
      : <QrCode className="size-20 text-gold" aria-hidden />}
    <div className="space-y-1">
      <p className="font-semibold">Quét mã để chuyển cọc {formatVnd(data.amount)}</p>
      <p>Ngân hàng: {data.bankCode} · Số tài khoản: <b>{data.accountNumber}</b></p>
      <p>Chủ tài khoản: {data.accountName}</p>
      <p>Nội dung chuyển khoản: <b>{data.transferContent}</b></p>
      <p className="text-muted">Xưởng xác nhận đơn sau khi nhận được tiền.</p>
    </div>
  </div>
}

const statusLabel: Record<BulkOrderResponse['status'], string> = {
  WAITING_DEPOSIT: 'Chờ xác nhận cọc',
  PRODUCTION: 'Đang sản xuất',
  READY_TO_SHIP: 'Sẵn sàng giao',
  DELIVERING: 'Đang giao',
  WAITING_BALANCE: 'Chờ tất toán',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
}

export function BulkOrdersPanel({ role }: { role: 'buyer' | 'provider' }) {
  const [version, setVersion] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const orders = useApi(role === 'buyer' ? rfqService.buyerOrders : rfqService.providerOrders, [role, version])

  const act = async (action: () => Promise<unknown>) => {
    if (busy) return
    setBusy(true)
    setMessage(null)
    try {
      await action()
      setVersion((value) => value + 1)
      setMessage('Đã cập nhật đơn sỉ.')
    } catch (error) {
      setMessage(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  const saveDelivery = (event: FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void act(() => rfqService.delivery(id, {
      recipientName: String(data.get('recipientName') ?? '').trim(),
      recipientPhone: String(data.get('recipientPhone') ?? '').trim(),
      deliveryAddress: String(data.get('deliveryAddress') ?? '').trim(),
    }))
  }

  return (
    <section className="space-y-4 rounded-md border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-h3 text-primary">Đơn sỉ đã chốt</h3>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setVersion((v) => v + 1)}>Tải lại</button>
      </div>
      {message && <p role="status" className="text-small text-primary">{message}</p>}
      {orders.loading ? <p>Đang tải đơn sỉ...</p> : orders.error ? <p role="alert">{orders.error}</p>
        : !orders.data?.length ? <p className="text-small text-muted">Chưa có đơn sỉ đã chốt.</p> :
          orders.data.map((order, index) => {
            const completedDays = order.productionDays.filter((day) => day.completed).length
            const totalDays = order.productionDays.length
            const progress = totalDays ? Math.round(completedDays / totalDays * 100) : 0
            return (
            <article key={order.id} className="space-y-3 rounded-md border border-line p-4 text-small">
              {role === 'buyer' && order.groupId && orders.data?.findIndex((item) => item.groupId === order.groupId) === index &&
                <div className="rounded-md bg-champagne/40 p-3">
                  <b>Đơn tổng {order.requestCode}</b>
                  <p>{order.groupQuantity} hộp · {orders.data.filter((item) => item.groupId === order.groupId).length} đơn theo xưởng · tổng {formatVnd(order.groupTotalAmount)}</p>
                </div>}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{order.requestCode} · {order.providerName}</strong>
                <span className="font-semibold text-secondary">{statusLabel[order.status]}</span>
              </div>
              <p>{order.quantity} hộp × {order.cakesPerBox} bánh = {order.quantity * order.cakesPerBox} bánh · giao {formatDate(order.deliveryDate)}</p>
              <p>Giá gốc {formatVnd(order.grossAmount)} · giảm 30% {formatVnd(order.discountAmount)} · <b>thanh toán {formatVnd(order.totalAmount)}</b></p>
              <p>Cọc 50%: <b>{formatVnd(order.depositAmount)}</b> · còn lại {formatVnd(order.totalAmount - order.depositAmount)}</p>
              {order.status === 'WAITING_DEPOSIT' && <p>Giữ suất nướng đến {new Date(order.depositDeadline).toLocaleString('vi-VN')}. Chuyển khoản và gửi chứng từ cho xưởng; xưởng xác nhận thủ công.</p>}
              {role === 'buyer' && order.status === 'WAITING_DEPOSIT' && <DepositQr order={order} />}
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <b>Tiến độ sản xuất</b>
                  <span>{completedDays}/{totalDays} đợt nướng hoàn thành · {progress}%</span>
                </div>
                <div role="progressbar" aria-label={`Tiến độ sản xuất đơn ${order.requestCode}`} aria-valuemin={0} aria-valuemax={totalDays} aria-valuenow={completedDays}
                  className="h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-secondary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div>
                <b>Lịch nướng</b>
                <ul className="mt-1 flex flex-wrap gap-2">
                  {order.productionDays.map((day) => <li key={day.id} className="rounded border border-line px-2 py-1">
                    {formatDate(day.date)}: {day.cakes} bánh {day.completed ? '✓' : ''}
                    {role === 'provider' && order.status === 'PRODUCTION' && !day.completed &&
                      <button type="button" className="ml-2 text-secondary underline" disabled={busy}
                        onClick={() => void act(() => rfqService.completeDay(order.id, day.id))}>Xác nhận xong</button>}
                  </li>)}
                </ul>
              </div>
              {role === 'buyer' && (order.status === 'WAITING_DEPOSIT' || order.status === 'PRODUCTION' || order.status === 'READY_TO_SHIP') &&
                <form onSubmit={(event) => saveDelivery(event, order.id)} className="grid gap-2 sm:grid-cols-3">
                  <b className="sm:col-span-3">Thông tin giao nhận</b>
                  <label>Người nhận<input className="input mt-1" name="recipientName" autoComplete="name" defaultValue={order.recipientName ?? ''} maxLength={255} required /></label>
                  <label>Số điện thoại<input className="input mt-1" name="recipientPhone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={order.recipientPhone ?? ''} maxLength={20} required /></label>
                  <label>Địa chỉ giao<input className="input mt-1" name="deliveryAddress" autoComplete="street-address" defaultValue={order.deliveryAddress ?? ''} maxLength={1000} required /></label>
                  <button type="submit" className="btn btn-outline btn-sm sm:col-span-3" disabled={busy}>Lưu thông tin giao hàng</button>
                </form>}
              {order.deliveryAddress && <p>Giao cho {order.recipientName} · {order.recipientPhone} · {order.deliveryAddress}</p>}
              {role === 'buyer' && order.status === 'WAITING_DEPOSIT' &&
                <button type="button" className="btn btn-outline btn-sm" disabled={busy}
                  onClick={() => void act(() => rfqService.cancelOrder(order.id))}>Hủy đơn trước khi cọc</button>}
              {role === 'provider' && order.status === 'WAITING_DEPOSIT' &&
                <button type="button" className="btn btn-primary btn-sm" disabled={busy}
                  onClick={() => void act(() => rfqService.confirmDeposit(order.id))}>Đã nhận cọc</button>}
              {role === 'provider' && order.status === 'READY_TO_SHIP' &&
                <button type="button" className="btn btn-primary btn-sm" disabled={busy}
                  onClick={() => void act(() => rfqService.dispatch(order.id))}>Bắt đầu giao</button>}
              {role === 'provider' && order.status === 'DELIVERING' &&
                <button type="button" className="btn btn-primary btn-sm" disabled={busy}
                  onClick={() => void act(() => rfqService.delivered(order.id))}>Đã giao hàng</button>}
              {role === 'provider' && order.status === 'WAITING_BALANCE' &&
                <button type="button" className="btn btn-primary btn-sm" disabled={busy}
                  onClick={() => void act(() => rfqService.confirmBalance(order.id))}>Đã nhận phần còn lại</button>}
            </article>)})}
    </section>
  )
}
