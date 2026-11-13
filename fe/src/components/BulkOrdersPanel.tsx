import { useState, type FormEvent, type ReactNode } from 'react'
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

/** refreshKey: tải lại khi trang cha vừa chốt báo giá; onChanged: báo trang cha khi panel tạo RFQ bổ sung */
export function BulkOrdersPanel({ role, refreshKey = 0, onChanged }: {
  role: 'buyer' | 'provider'
  refreshKey?: number
  onChanged?: () => void
}) {
  const [version, setVersion] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const orders = useApi(role === 'buyer' ? rfqService.buyerOrders : rfqService.providerOrders, [role, version, refreshKey])

  const act = async (action: () => Promise<unknown>, done = 'Đã cập nhật đơn sỉ.') => {
    if (busy) return
    setBusy(true)
    setMessage(null)
    try {
      await action()
      setVersion((value) => value + 1)
      setMessage(done)
      onChanged?.()
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
        : !orders.data?.length ? <p className="text-small text-muted">Chưa có đơn sỉ đã chốt.</p>
        : role === 'buyer' ? groupByParent(orders.data).map((group) => (
          <ParentOrder key={group.requestId} group={group} busy={busy}
            onReorder={() => void act(() => rfqService.reorderShortfall(group.requestId),
              `Đã gửi yêu cầu báo giá mới cho ${group.missing} hộp còn thiếu. Xem báo giá ở danh sách RFQ phía trên.`)}>
            {group.orders.map(renderOrder)}
          </ParentOrder>
        )) : orders.data.map(renderOrder)}
    </section>
  )

  function renderOrder(order: BulkOrderResponse) {
    return (
            <article key={order.id} className="space-y-3 rounded-md border border-line p-4 text-small">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{order.requestCode} · {order.providerName}</strong>
                <span className="font-semibold text-secondary">{statusLabel[order.status]}</span>
              </div>
              <p>{order.quantity} hộp × {order.cakesPerBox} bánh = {order.quantity * order.cakesPerBox} bánh · giao {formatDate(order.deliveryDate)}</p>
              <p>Giá gốc {formatVnd(order.grossAmount)} · giảm 30% {formatVnd(order.discountAmount)} · <b>thanh toán {formatVnd(order.totalAmount)}</b></p>
              <p>Cọc tối thiểu: <b>{formatVnd(order.depositAmount)}</b> · còn lại {formatVnd(order.totalAmount - order.depositAmount)}</p>
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
            </article>
    )
  }
}

interface ParentGroup {
  requestId: string
  requestCode: string
  requestedQuantity: number
  orders: BulkOrderResponse[]
  /** Hộp của các đơn con còn hiệu lực (bỏ đơn đã huỷ) */
  allocated: number
  missing: number
  total: number
  status: string
}

const SHIPPED: BulkOrderResponse['status'][] = ['DELIVERING', 'WAITING_BALANCE', 'COMPLETED']

/** Đơn tổng = một RFQ; đơn con = đơn sỉ của từng xưởng. Trạng thái đơn tổng suy ra từ các đơn con */
function groupByParent(orders: BulkOrderResponse[]): ParentGroup[] {
  const groups = new Map<string, BulkOrderResponse[]>()
  for (const order of orders) groups.set(order.requestId, [...(groups.get(order.requestId) ?? []), order])
  return [...groups.values()].map((children) => {
    const active = children.filter((order) => order.status !== 'CANCELLED')
    const allocated = active.reduce((sum, order) => sum + order.quantity, 0)
    const shipped = active.filter((order) => SHIPPED.includes(order.status)).length
    const status = !active.length ? 'Đã huỷ toàn bộ'
      : active.every((order) => order.status === 'COMPLETED') ? 'Hoàn tất'
        : shipped ? (shipped === active.length ? 'Đang giao' : 'Đang giao một phần')
          : active.some((order) => order.status === 'WAITING_DEPOSIT') ? 'Chờ cọc'
            : 'Đang sản xuất'
    return {
      requestId: children[0].requestId,
      requestCode: children[0].requestCode,
      requestedQuantity: children[0].requestedQuantity,
      orders: children,
      allocated,
      missing: Math.max(0, children[0].requestedQuantity - allocated),
      total: active.reduce((sum, order) => sum + order.totalAmount, 0),
      status,
    }
  })
}

function ParentOrder({ group, busy, onReorder, children }: {
  group: ParentGroup
  busy: boolean
  onReorder: () => void
  children: ReactNode
}) {
  const split = group.orders.length > 1
  return (
    <div className="space-y-3 rounded-md border border-secondary/40 bg-champagne/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-small">
        <div>
          <strong className="text-navy">Đơn tổng {group.requestCode}</strong>
          <span className="text-muted"> · {group.allocated}/{group.requestedQuantity} hộp
            {split && ` · chia cho ${group.orders.filter((order) => order.status !== 'CANCELLED').length} xưởng`}
            {' · '}tổng {formatVnd(group.total)}</span>
        </div>
        <span className="font-semibold text-secondary">{group.status}</span>
      </div>
      {group.missing > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-amber-400/60 bg-amber-50 px-3 py-2 text-small text-amber-900">
          <span>Đơn tổng còn thiếu <b>{group.missing} hộp</b> (chốt chưa đủ hoặc có xưởng bị huỷ).</span>
          <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={onReorder}>
            Tìm xưởng cho {group.missing} hộp còn thiếu
          </button>
        </div>
      )}
      {children}
    </div>
  )
}
