import { useState, type FormEvent } from 'react'
import { rfqService } from '../services/rfqService'
import { useApi } from '../hooks/useApi'
import { errorMessage } from '../apis/http'
import { formatDate, formatVnd } from '../lib/format'
import type { BulkOrderResponse } from '../types/order'

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
          orders.data.map((order) => (
            <article key={order.id} className="space-y-3 rounded-md border border-line p-4 text-small">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{order.requestCode} · {order.providerName}</strong>
                <span className="font-semibold text-secondary">{statusLabel[order.status]}</span>
              </div>
              <p>{order.quantity} hộp × {order.cakesPerBox} bánh = {order.quantity * order.cakesPerBox} bánh · giao {formatDate(order.deliveryDate)}</p>
              <p>Giá gốc {formatVnd(order.grossAmount)} · giảm 30% {formatVnd(order.discountAmount)} · <b>thanh toán {formatVnd(order.totalAmount)}</b></p>
              <p>Cọc 50%: <b>{formatVnd(order.depositAmount)}</b> · còn lại {formatVnd(order.totalAmount - order.depositAmount)}</p>
              {order.status === 'WAITING_DEPOSIT' && <p>Giữ suất nướng đến {new Date(order.depositDeadline).toLocaleString('vi-VN')}. Chuyển khoản và gửi chứng từ cho xưởng; xưởng xác nhận thủ công.</p>}
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
              {role === 'buyer' && (order.status === 'WAITING_DEPOSIT' || order.status === 'PRODUCTION') &&
                <form onSubmit={(event) => saveDelivery(event, order.id)} className="grid gap-2 sm:grid-cols-3">
                  <label>Người nhận<input className="input mt-1" name="recipientName" defaultValue={order.recipientName ?? ''} maxLength={255} required /></label>
                  <label>Số điện thoại<input className="input mt-1" name="recipientPhone" defaultValue={order.recipientPhone ?? ''} maxLength={20} required /></label>
                  <label>Địa chỉ giao<input className="input mt-1" name="deliveryAddress" defaultValue={order.deliveryAddress ?? ''} maxLength={1000} required /></label>
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
            </article>))}
    </section>
  )
}
