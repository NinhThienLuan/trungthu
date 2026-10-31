import { useState } from 'react'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatDate, formatVnd } from '../../lib/format'
import { SUBSCRIPTION_STATUS, subscriptionService, type SubscriptionPlanCode } from '../../services/sellerService'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, Notice, Spinner } from '../../components/ui/States'

/** Seller: chọn gói bán hàng (giá do sàn quy định), theo dõi yêu cầu chờ admin kích hoạt */
export function SubscriptionPage() {
  useDocumentTitle('Gói bán hàng')
  const plans = useApi(() => subscriptionService.plans(), [])
  const mine = useApi(() => subscriptionService.mine(), [])
  const [picked, setPicked] = useState<SubscriptionPlanCode>()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string }>()

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true)
    setNotice(undefined)
    try {
      await action()
      setNotice({ ok: true, text: done })
      setPicked(undefined)
      setNote('')
      mine.reload()
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  if ((plans.loading && !plans.data) || (mine.loading && !mine.data)) return <Spinner />
  if (plans.error || mine.error) return <div className="page section"><ErrorState message={plans.error ?? mine.error ?? ''} onRetry={() => { plans.reload(); mine.reload() }} /></div>

  const active = mine.data?.find((s) => s.status === 'ACTIVE')
  const pending = mine.data?.find((s) => s.status === 'PENDING_PAYMENT')

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Gian hàng" title="Gói bán hàng"
        description="Gian hàng cần một gói đang chạy (và hồ sơ đã duyệt) để khách đặt được hàng. Chuyển khoản phí gói cho sàn, ghi mã giao dịch; admin xác nhận rồi kích hoạt." />

      {active ? (
        <Notice tone="success">Gói <b>{active.planName}</b> đang chạy đến {active.endDate && formatDate(active.endDate)} · tối đa {active.maxProductsAllowed} sản phẩm.</Notice>
      ) : (
        <Notice tone="danger">Chưa có gói đang chạy: khách chưa đặt được hàng của gian hàng.</Notice>
      )}
      {pending && (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-small">
            Đang chờ admin xác nhận gói <b>{pending.planName}</b> ({formatVnd(pending.price)})
            {pending.paymentNote && <> · mã giao dịch: {pending.paymentNote}</>}
          </p>
          <button type="button" className="btn btn-ghost btn-sm text-danger" disabled={busy}
            onClick={() => window.confirm('Huỷ yêu cầu gói đang chờ?') && run(() => subscriptionService.cancel(pending.id), 'Đã huỷ yêu cầu gói.')}>
            Huỷ yêu cầu
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.data?.map((p) => (
          <button key={p.code} type="button" disabled={!!pending} onClick={() => setPicked(p.code)}
            className={cn('card flex flex-col gap-2 p-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              picked === p.code ? 'ring-2 ring-navy' : 'hover:bg-champagne/30')}>
            <span className="text-h3">{p.name}</span>
            <span className="font-serif text-h2 text-navy">{formatVnd(p.price)}</span>
            <span className="text-small text-muted">Tối đa {p.maxProducts} sản phẩm · đến hết năm</span>
            {active?.planName === p.name && <span className="text-small font-semibold text-success">Gói hiện tại</span>}
          </button>
        ))}
      </div>

      {picked && (
        <div className="card flex flex-col gap-3 p-5">
          <label htmlFor="paymentNote" className="field-label">Mã giao dịch / ghi chú chuyển khoản (để admin đối chiếu)</label>
          <input id="paymentNote" className="input" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="FT26301xxxx" />
          <button type="button" className="btn btn-primary self-start" disabled={busy}
            onClick={() => run(() => subscriptionService.request(picked, note), 'Đã gửi yêu cầu gói. Admin sẽ kích hoạt sau khi nhận tiền.')}>
            Gửi yêu cầu gói {plans.data?.find((p) => p.code === picked)?.name}
          </button>
        </div>
      )}

      {notice && <Notice tone={notice.ok ? 'success' : 'danger'}>{notice.text}</Notice>}

      {!!mine.data?.length && (
        <section className="card overflow-x-auto p-0">
          <table className="w-full text-small">
            <thead className="text-left text-muted"><tr><th className="p-3">Gói</th><th>Giá</th><th>Thời gian</th><th className="p-3">Trạng thái</th></tr></thead>
            <tbody>
              {mine.data.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="p-3 font-medium">{s.planName}</td>
                  <td>{formatVnd(s.price)}</td>
                  <td className="whitespace-nowrap">{s.status === 'PENDING_PAYMENT' ? '—' : `${s.startDate && formatDate(s.startDate)} – ${s.endDate && formatDate(s.endDate)}`}</td>
                  <td className={cn('p-3 font-medium', SUBSCRIPTION_STATUS[s.status].tone)}>{SUBSCRIPTION_STATUS[s.status].text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
