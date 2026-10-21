import { useEffect, useState } from 'react'
import { Clock, QrCode } from 'lucide-react'
import { Notice } from './ui/States'
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
 * - VIETQR chờ cọc (PENDING_DEPOSIT): mã QR + số tiền + đếm ngược giữ chỗ (hết hạn -> BE tự huỷ)
 * - Các trạng thái khác: tình trạng đã thanh toán / còn lại
 */
export function OrderPaymentPanel({ order }: { order: OrderDetail }) {
  const seconds = useCountdown(order.status === 'PENDING_DEPOSIT' ? order.holdExpiresAt : null)
  const expired = order.status === 'PENDING_DEPOSIT' && seconds === 0
  const mm = String(Math.floor((seconds ?? 0) / 60)).padStart(2, '0')
  const ss = String((seconds ?? 0) % 60).padStart(2, '0')

  if (order.status === 'CANCELLED') {
    return <Notice tone="danger">Đơn đã huỷ{order.paymentMethod === 'VIETQR' && order.paidAmount === 0 ? ' (quá hạn giữ chỗ hoặc đã huỷ)' : ''}.</Notice>
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

  const pay = order.payment
  return (
    <div className="grid gap-5 md:grid-cols-[11rem_1fr]">
      <div className="flex aspect-square items-center justify-center rounded-sm border border-line bg-ivory">
        {pay?.qrImageUrl ? (
          <img src={pay.qrImageUrl} alt={`Mã VietQR đơn ${order.code}`} className="size-full object-contain p-2" />
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
          <dd className="font-serif text-h3 text-navy">{formatVnd(order.depositAmount)}</dd>
          {order.depositAmount < order.totalAmount && (
            <>
              <dt className="text-muted">Còn lại khi nhận</dt>
              <dd>{formatVnd(order.totalAmount - order.depositAmount)}</dd>
            </>
          )}
          {pay && (
            <>
              <dt className="text-muted">Ngân hàng</dt>
              <dd>{pay.bankName}</dd>
              <dt className="text-muted">Số tài khoản</dt>
              <dd className="font-semibold">{pay.bankAccount}</dd>
              <dt className="text-muted">Nội dung CK</dt>
              <dd className="font-semibold">{pay.transferNote}</dd>
            </>
          )}
        </dl>
        <div className="mt-4">
          {expired ? (
            <Notice tone="danger">Đã hết thời gian giữ chỗ, đơn sẽ bị huỷ. Vui lòng đặt lại.</Notice>
          ) : (
            <Notice>
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4" aria-hidden />
                Giữ chỗ còn <strong className="tabular-nums">{mm}:{ss}</strong>. Xưởng xác nhận sau khi nhận được tiền.
              </span>
            </Notice>
          )}
        </div>
      </div>
    </div>
  )
}
