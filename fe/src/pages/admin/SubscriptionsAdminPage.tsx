import { useState } from 'react'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatDate, formatDateTime, formatVnd, toIsoDate } from '../../lib/format'
import { SUBSCRIPTION_STATUS, subscriptionService, type Subscription } from '../../services/sellerService'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/States'

const TABS: Subscription['status'][] = ['PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'SUSPENDED']
const endOfYear = () => toIsoDate(new Date(new Date().getFullYear(), 11, 31))

/** Admin sàn: xác nhận đã nhận phí gói rồi kích hoạt (chọn ngày hết hạn), hoặc huỷ */
export function SubscriptionsAdminPage() {
  useDocumentTitle('Gói bán hàng')
  const [status, setStatus] = useState<Subscription['status']>('PENDING_PAYMENT')
  const { data, loading, error, reload } = useApi(() => subscriptionService.byStatus(status), [status])
  const [endDates, setEndDates] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<{ ok: boolean; text: string }>()

  const run = async (action: () => Promise<unknown>, done: string) => {
    setNotice(undefined)
    try {
      await action()
      setNotice({ ok: true, text: done })
      reload()
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) })
    }
  }

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Quản trị sàn" title="Gói bán hàng của seller"
        description="Kiểm tra đã nhận tiền (đối chiếu mã giao dịch) rồi kích hoạt. Kích hoạt gói mới sẽ cho gói cũ của xưởng hết hạn." />
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} type="button" className={cn('chip', status === t && 'chip-active')}
            onClick={() => { setNotice(undefined); setStatus(t) }}>{SUBSCRIPTION_STATUS[t].text}</button>
        ))}
      </div>
      {notice && <Notice tone={notice.ok ? 'success' : 'danger'}>{notice.text}</Notice>}
      {loading && !data ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} />
        : !data?.length ? <EmptyState title="Không có gói nào" /> : (
          <div className="flex flex-col gap-4">
            {data.map((s) => (
              <article key={s.id} className="card flex flex-wrap items-end justify-between gap-4 p-5">
                <div className="text-small">
                  <h2 className="text-h3">{s.storeName ?? s.providerName} · {s.planName}</h2>
                  <p className="text-muted">{s.providerEmail} · {formatVnd(s.price)} · tối đa {s.maxProductsAllowed} sản phẩm</p>
                  <p className="text-muted">Gửi lúc {formatDateTime(s.createdAt)}{s.paymentNote && <> · mã giao dịch: <b className="text-ink">{s.paymentNote}</b></>}</p>
                  {s.status !== 'PENDING_PAYMENT' && s.startDate && s.endDate && <p className="text-muted">Hiệu lực {formatDate(s.startDate)} – {formatDate(s.endDate)}</p>}
                </div>
                {s.status === 'PENDING_PAYMENT' && (
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="text-small">
                      <span className="field-label">Hết hạn</span>
                      <input type="date" className="input" min={toIsoDate(new Date())} value={endDates[s.id] ?? endOfYear()}
                        onChange={(e) => setEndDates((d) => ({ ...d, [s.id]: e.target.value }))} />
                    </label>
                    <button type="button" className="btn btn-primary btn-sm"
                      onClick={() => run(() => subscriptionService.activate(s.id, endDates[s.id] ?? endOfYear()), `Đã kích hoạt gói ${s.planName} cho ${s.storeName ?? s.providerEmail}.`)}>
                      Đã nhận tiền · Kích hoạt
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm text-danger"
                      onClick={() => window.confirm('Huỷ yêu cầu gói này?') && run(() => subscriptionService.adminCancel(s.id), 'Đã huỷ yêu cầu gói.')}>
                      Huỷ
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
    </div>
  )
}
