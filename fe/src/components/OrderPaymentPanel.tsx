import { useEffect, useState } from 'react'
import { Clock, QrCode } from 'lucide-react'
import { Notice } from './ui/States'
import { useApi } from '../hooks/useApi'
import { orderService } from '../services/orderService'
import { formatVnd } from '../lib/format'
import type { OrderDetail } from '../types/order'

function useCountdown(deadline: string | null) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!deadline) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [deadline])
  if (!deadline) return null
  return Math.max(0, Math.floor((Date.parse(deadline) - now) / 1000))
}

/**
 * Khối thanh toán của 1 đơn:
 * - COD (CONFIRMED): không cọc, trả khi nhận
 * - VIETQR: mỗi đơn nhận một QR vào tài khoản xưởng, xưởng đối soát thủ công
 * - Các trạng thái khác: tình trạng đã thanh toán / còn lại
 */
export function OrderPaymentPanel({ order }: { order: OrderDetail }) {
  const seconds = useCountdown(order.status === 'PENDING_DEPOSIT' ? order.holdExpiresAt : null)
  const expired = order.status === 'PENDING_DEPOSIT' && seconds === 0

  if (order.status === 'CANCELLED') {
    return <Notice tone="danger">Đơn đã huỷ{order.paymentMethod !== 'COD' && order.paidAmount === 0 ? ' (quá hạn thanh toán hoặc đã huỷ)' : ''}.</Notice>
  }

  if (order.paymentMethod === 'COD') {
    return (
      <Notice tone="success">
        Đơn đã được xác nhận. Thanh toán <strong>{formatVnd(order.remainingAmount)}</strong> khi nhận hàng.
      </Notice>
    )
  }

  if (order.status !== 'PENDING_DEPOSIT') {
    return (
      <Notice tone="success">
        Xưởng đã xác nhận cọc. Đã trả {formatVnd(order.paidAmount)}
        {order.remainingAmount > 0 && <> · còn lại {formatVnd(order.remainingAmount)} khi nhận hàng</>}.
      </Notice>
    )
  }

  if (order.paymentMethod === 'VIETQR') {
    return <VietQrPanel order={order} seconds={seconds ?? 0} expired={expired} />
  }

  return <Notice tone="danger">Phương thức thanh toán này chưa được hỗ trợ.</Notice>
}

function VietQrPanel({ order, seconds, expired }: { order: OrderDetail; seconds: number; expired: boolean }) {
  const { data: pay, loading, error, reload } = useApi(
    () => expired ? Promise.resolve(null) : orderService.vietQr(order.id),
    [order.id, expired],
  )
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  if (expired) return <Notice tone="danger">Đã hết thời gian thanh toán. Đơn sẽ được huỷ và trả lại hàng/slot.</Notice>
  if (loading) return <Notice>Đang lấy mã VietQR cho đơn này...</Notice>
  if (error || !pay) return <Notice tone="danger">Không lấy được mã VietQR: {error ?? 'Không có thông tin thanh toán'} <button type="button" className="underline" onClick={reload}>Thử lại</button></Notice>

  return (
    <div className="grid gap-5 md:grid-cols-[11rem_1fr]">
      <div className="flex aspect-square items-center justify-center rounded-sm border border-line bg-ivory">
        {pay.imageUrl ? (
          <img src={pay.imageUrl} alt={`Mã VietQR đơn ${order.code}`} className="size-full object-contain p-2" />
        ) : (
          <div className="flex flex-col items-center gap-2 p-3 text-center text-muted">
            <QrCode className="size-10 text-gold" aria-hidden />
            <span className="text-small">Mã QR sẽ hiển thị khi xưởng cấu hình tài khoản nhận tiền</span>
          </div>
        )}
      </div>
      <div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-small">
          <dt className="text-muted">Số tiền cần chuyển</dt>
          <dd className="font-sans text-h3 text-navy">{formatVnd(pay.amount)}</dd>
          {order.depositAmount < order.totalAmount && (
            <>
              <dt className="text-muted">Còn lại khi nhận</dt>
              <dd>{formatVnd(order.totalAmount - order.depositAmount)}</dd>
            </>
          )}
          <dt className="text-muted">Ngân hàng</dt>
          <dd>{pay.bankCode}</dd>
          <dt className="text-muted">Số tài khoản</dt>
          <dd className="font-semibold">{pay.accountNumber}</dd>
          <dt className="text-muted">Chủ tài khoản</dt>
          <dd>{pay.accountName}</dd>
          <dt className="text-muted">Nội dung CK</dt>
          <dd className="font-semibold">{pay.transferContent}</dd>
        </dl>
        <div className="mt-4">
          <Notice>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4" aria-hidden />
              Còn <strong className="tabular-nums">{hours}:{minutes}:{secs}</strong>. Chuyển đúng số tiền và nội dung; xưởng xác nhận sau khi nhận được tiền.
            </span>
          </Notice>
        </div>
      </div>
    </div>
  )
}
