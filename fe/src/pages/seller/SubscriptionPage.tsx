import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatDate, formatDateTime, formatVnd } from '../../lib/format'
import { isSubscriptionActive, notifySellerStatusChanged } from '../../lib/sellerEligibility'
import { SUBSCRIPTION_STATUS, subscriptionService, type Subscription, type SubscriptionPlanCode } from '../../services/sellerService'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, Notice, Spinner } from '../../components/ui/States'

export function SubscriptionPage() {
  useDocumentTitle('Gói bán hàng')
  const plans = useApi(() => subscriptionService.plans(), [])
  const { data: history, loading, error, reload } = useApi(() => subscriptionService.mine(), [])
  const [picked, setPicked] = useState<SubscriptionPlanCode>()
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string }>()

  const active = history?.find((s) => isSubscriptionActive(s))
  const pending = history?.find((s) => s.status === 'PENDING_PAYMENT')
  const selected = plans.data?.find((plan) => plan.code === picked)
  const pendingCode = pending?.paymentCode

  useEffect(() => {
    if (!pendingCode) return
    const timer = window.setInterval(reload, 5000)
    window.addEventListener('focus', reload)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', reload)
    }
  }, [pendingCode, reload])

  useEffect(() => {
    notifySellerStatusChanged()
  }, [active?.id, pending?.id])

  const run = async (action: () => Promise<Subscription>, fallback?: string) => {
    setBusy(true)
    setNotice(undefined)
    try {
      const subscription = await action()
      const message = subscription.status === 'ACTIVE' ? 'Đã nhận thanh toán và kích hoạt gói.'
        : subscription.status === 'CANCELLED' ? 'Đã hủy yêu cầu thanh toán.'
          : subscription.status === 'EXPIRED' ? 'Yêu cầu đã hết hạn. Bạn có thể chọn lại gói.'
            : subscription.paymentNote ? undefined : fallback
      if (message) setNotice({ ok: true, text: message })
      setPicked(undefined)
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
      reload()
    }
  }

  if ((plans.loading && !plans.data) || (loading && !history)) return <Spinner />
  if (plans.error || (error && !history)) return <div className="page section"><ErrorState message={plans.error ?? error ?? ''} onRetry={() => { plans.reload(); reload() }} /></div>

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Gian hàng" title="Gói bán hàng"
        description="Quét VietQR để thanh toán phí gói cho sàn. Gói tự kích hoạt khi payOS xác nhận đã nhận đủ tiền. Gian hàng cần hồ sơ đã duyệt để nhận đơn." />

      {active ? (
        <Notice tone="success">Gói <b>{active.planName}</b> đang chạy đến {active.endDate && formatDate(active.endDate)} · tối đa {active.maxProductsAllowed} sản phẩm.</Notice>
      ) : (
        <Notice tone="danger">Chưa có gói đang chạy: khách chưa đặt được hàng của gian hàng.</Notice>
      )}
      {pending && (
        <section className="card flex flex-wrap items-start gap-6 p-5" aria-labelledby="subscription-payment-heading">
          {pending.qrPayload && (
            <div className="mx-auto max-w-full shrink-0 overflow-hidden rounded-lg border border-line bg-white sm:mx-0">
              <QRCodeSVG value={pending.qrPayload} size={208} marginSize={4} className="h-auto max-w-full"
                title={`Mã VietQR thanh toán gói ${pending.planName}`} />
            </div>
          )}
          <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
            <h2 id="subscription-payment-heading" className="text-h3">Gói {pending.planName} · {formatVnd(pending.price)}</h2>
            {pendingCode ? (
              <>
                <p className="text-small text-muted">Mã thanh toán {pendingCode}</p>
                {pending.paymentNote ? <Notice tone="danger">{pending.paymentNote} Liên hệ hỗ trợ sàn và cung cấp mã thanh toán.</Notice>
                  : pending.qrPayload ? <p className="text-small">Mở ứng dụng ngân hàng và quét mã VietQR. Trạng thái gói sẽ tự cập nhật trên trang này.</p>
                    : <p className="text-small">Mở phiên thanh toán để tiếp tục.</p>}
              </>
            ) : (
              <p className="text-small">Yêu cầu chuyển khoản đang chờ admin đối soát{pending.paymentNote && <> · mã giao dịch {pending.paymentNote}</>}.</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {pendingCode && !pending.paymentNote && (pending.checkoutUrl ? (
                <a className="btn btn-primary btn-sm" href={pending.checkoutUrl} target="_blank" rel="noopener noreferrer">
                  Mở payOS
                </a>
              ) : (
                <button type="button" className="btn btn-primary btn-sm" disabled={busy}
                  onClick={() => run(() => subscriptionService.openCheckout(pending.id))}>Hiện mã thanh toán</button>
              ))}
              {pendingCode && (
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy}
                  onClick={() => run(() => subscriptionService.refreshPayment(pending.id), 'payOS chưa xác nhận thanh toán.')}>
                  Kiểm tra thanh toán
                </button>
              )}
              {(!pendingCode || !pending.paymentNote) && (
                <button type="button" className="btn btn-ghost btn-sm text-danger" disabled={busy}
                  onClick={() => window.confirm('Hủy yêu cầu gói đang chờ?')
                    && run(() => subscriptionService.cancel(pending.id), 'Yêu cầu chưa thể hủy khi giao dịch đang được xử lý.')}>
                  Hủy yêu cầu
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.data?.map((p) => (
          <button key={p.code} type="button"
            disabled={busy || !!pending || (!!active && (active.planName === p.name || p.maxProducts < (active.maxProductsAllowed ?? 0)))}
            aria-pressed={picked === p.code} onClick={() => setPicked(p.code)}
            className={cn('card flex flex-col gap-2 p-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              picked === p.code ? 'ring-2 ring-navy' : 'hover:bg-champagne/30')}>
            <span className="text-h3">{p.name}</span>
            <span className="font-sans text-h2 text-navy">{formatVnd(p.price)}</span>
            <span className="text-small text-muted">Tối đa {p.maxProducts} sản phẩm · đến hết năm</span>
            {active?.planName === p.name && <span className="text-small font-semibold text-success">Gói hiện tại</span>}
          </button>
        ))}
      </div>

      {selected && !pending && (
        <div className="card flex flex-col gap-3 p-5">
          {active && <p className="text-small">Gói mới thay gói hiện tại ngay khi thanh toán đủ phí. Phí đã thanh toán của gói hiện tại không được khấu trừ.</p>}
          <button type="button" className="btn btn-primary self-start" disabled={busy}
            onClick={() => run(async () => {
              const subscription = await subscriptionService.request(selected.code)
              return subscriptionService.openCheckout(subscription.id)
            })}>
            {busy ? 'Đang mở thanh toán…' : `Thanh toán ${formatVnd(selected.price)}`}
          </button>
        </div>
      )}

      {notice && <div role="status"><Notice tone={notice.ok ? 'success' : 'danger'}>{notice.text}</Notice></div>}

      {!!history?.length && (
        <section className="card overflow-x-auto p-0">
          <table className="w-full text-small">
            <thead className="text-left text-muted"><tr><th className="p-3">Gói</th><th>Giá</th><th>Thời gian</th><th className="p-3">Trạng thái</th></tr></thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="p-3 font-medium">{s.planName}</td>
                  <td>{formatVnd(s.price)}</td>
                  <td className="whitespace-nowrap">{s.status === 'PENDING_PAYMENT' || s.paymentStatus === 'CANCELLED' || s.status === 'CANCELLED'
                    ? '—' : `${s.startDate && formatDate(s.startDate)} – ${s.endDate && formatDate(s.endDate)}`}</td>
                  <td className={cn('p-3 font-medium', SUBSCRIPTION_STATUS[s.status].tone)}>
                    {s.status === 'PENDING_PAYMENT' && !s.paymentCode ? 'Chờ admin đối soát' : SUBSCRIPTION_STATUS[s.status].text}
                    {s.paidAt && <span className="block text-muted">Đã trả {formatDateTime(s.paidAt)}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
