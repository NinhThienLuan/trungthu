import { useState } from 'react'
import { errorMessage } from '../../apis/http'
import { useAdminList } from '../../hooks/useAdminList'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatDate, formatDateTime, formatVnd, toIsoDate } from '../../lib/format'
import { SUBSCRIPTION_STATUS, subscriptionService, type Subscription } from '../../services/sellerService'
import { PageHeader } from '../../components/ui/PageHeader'
import { AdminListPagination } from '../../components/AdminListPagination'
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/States'

const TABS: Subscription['status'][] = ['PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED']
const endOfYear = () => toIsoDate(new Date(new Date().getFullYear(), 11, 31))

/** Admin sàn: xác nhận đã nhận phí gói rồi kích hoạt (chọn ngày hết hạn), hoặc huỷ */
export function SubscriptionsAdminPage() {
  useDocumentTitle('Gói bán hàng')
  const { status, setStatus, page, setPage, pagination, data, loading, error, reload } =
    useAdminList('PENDING_PAYMENT', subscriptionService.byStatus)
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
        description="Theo dõi thanh toán payOS và đối soát các yêu cầu chuyển khoản đã gửi trước đây." />
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} type="button" aria-pressed={status === t} className={cn('chip', status === t && 'chip-active')}
            onClick={() => { setNotice(undefined); setStatus(t) }}>{SUBSCRIPTION_STATUS[t].text}</button>
        ))}
      </div>
      <AdminListPagination data={pagination} page={page} loading={loading} error={error} noun="gói bán hàng" onChange={setPage} />
      {notice && <Notice tone={notice.ok ? 'success' : 'danger'}>{notice.text}</Notice>}
      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} />
        : !data?.content.length ? <EmptyState title="Không có gói nào" /> : (
          <div className="flex flex-col gap-4">
            {data.content.map((s) => (
              <article key={s.id} className="card flex flex-wrap items-end justify-between gap-4 p-5">
                <div className="text-small">
                  <h2 className="text-h3">{s.storeName ?? s.providerName} · {s.planName}</h2>
                  <p className="text-muted">{s.providerEmail} · {formatVnd(s.price)} · tối đa {s.maxProductsAllowed} sản phẩm</p>
                  <p className="text-muted">Gửi lúc {formatDateTime(s.createdAt)}{s.paymentCode && <> · {s.paymentCode}</>}</p>
                  {s.paymentNote && <p className="text-muted">{s.paymentCode ? 'Đối soát' : 'Ghi chú chuyển khoản'} · {s.paymentNote}</p>}
                  {s.paidAt && <p className="text-muted">payOS ghi nhận lúc {formatDateTime(s.paidAt)}</p>}
                  {s.status !== 'PENDING_PAYMENT' && s.status !== 'CANCELLED' && s.paymentStatus !== 'CANCELLED'
                    && s.startDate && s.endDate && <p className="text-muted">Hiệu lực {formatDate(s.startDate)} – {formatDate(s.endDate)}</p>}
                </div>
                {s.status === 'PENDING_PAYMENT' && s.paymentCode && (
                  <p className="text-small text-muted">{s.paymentNote ? 'Cần đối soát với payOS' : 'Chờ payOS xác nhận'}</p>
                )}
                {s.status === 'PENDING_PAYMENT' && !s.paymentCode && (
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
