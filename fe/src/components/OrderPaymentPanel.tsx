import { useEffect, useState } from 'react'
import { Clock, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
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
 * - PAYOS chờ cọc: link và QR riêng theo xưởng, hết hạn sau tối đa 5 giờ
 * - VIETQR cũ: thông tin chuyển khoản thủ công
 * - Các trạng thái khác: tình trạng đã thanh toán / còn lại
 */
export function OrderPaymentPanel({ order }: { order: OrderDetail }) {
  const seconds = useCountdown(order.status === 'PENDING_DEPOSIT' ? order.holdExpiresAt : null)
  const expired = order.status === 'PENDING_DEPOSIT' && seconds === 0
  const mm = String(Math.floor((seconds ?? 0) / 60)).padStart(2, '0')
  const ss = String((seconds ?? 0) % 60).padStart(2, '0')

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

  if (order.paymentMethod === 'PAYOS') {
    return <PayosPanel order={order} seconds={seconds ?? 0} expired={expired} />
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

function PayosPanel({ order, seconds, expired }: { order: OrderDetail; seconds: number; expired: boolean }) {
  const { data: payment, loading, error, reload } = useApi(
    () => expired ? Promise.resolve(null) : orderService.payosLink(order.id),
    [order.id, expired],
  )
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  if (expired) return <Notice tone="danger">Đã hết thời gian thanh toán. Đơn sẽ được huỷ và trả lại hàng/slot.</Notice>
  if (loading) return <Notice>Đang lấy mã thanh toán PayOS cho đơn này...</Notice>
  if (error) {
    return <Notice tone="danger">Không lấy được mã PayOS: {error} <button type="button" className="underline" onClick={reload}>Thử lại</button></Notice>
  }

  return (
    <div className="grid gap-5 md:grid-cols-[11rem_1fr]">
      <div className="flex aspect-square items-center justify-center rounded-sm border border-line bg-white p-2">
        {payment?.qrCode ? (
          <QRCodeSVG value={payment.qrCode} size={176} title={`Mã PayOS đơn ${order.code}`} className="max-w-full" />
        ) : <QrCode className="size-10 text-gold" aria-hidden />}
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-small text-muted">Thanh toán riêng cho xưởng <strong className="text-navy">{order.storeName}</strong></p>
        <p className="font-serif text-h3 text-navy">{formatVnd(payment?.amount ?? order.depositAmount)}</p>
        {order.depositAmount < order.totalAmount && (
          <p className="text-small text-muted">Còn lại {formatVnd(order.totalAmount - order.depositAmount)} khi nhận hàng</p>
        )}
        {payment?.checkoutUrl && (
          <a href={payment.checkoutUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary self-start">
            Mở trang thanh toán PayOS
          </a>
        )}
        {payment?.paymentLinkId.startsWith('demo-') && (
          <Notice>Đây là mã QR demo, không chuyển khoản. Bật API thật và cấu hình kênh seller để thanh toán.</Notice>
        )}
        <Notice>
          <span className="inline-flex items-center gap-2">
            <Clock className="size-4" aria-hidden />
            Còn <strong className="tabular-nums">{hours}:{minutes}:{secs}</strong> để thanh toán.
          </span>
        </Notice>
      </div>
    </div>
  )
}
