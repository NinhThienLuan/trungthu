import { useState } from 'react'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatDateTime } from '../../lib/format'
import { COMPLAINT_STATUS, COMPLAINT_TYPE_LABEL, complaintService, type Complaint, type ComplaintStatus } from '../../services/complaintService'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/States'

const TABS: Array<{ key: 'ACTIVE' | ComplaintStatus; label: string }> = [
  { key: 'ACTIVE', label: 'Cần xử lý' },
  { key: 'RESOLVED', label: 'Đã giải quyết' },
  { key: 'REJECTED', label: 'Bị từ chối' },
]

/** Khiếu nại / đổi trả: seller xử lý khiếu nại của xưởng mình; admin sàn xem tất cả và phân xử */
export function ComplaintsPage({ scope }: { scope: 'provider' | 'admin' }) {
  useDocumentTitle('Khiếu nại')
  const { data, loading, error, reload } = useApi(() => (scope === 'admin' ? complaintService.all() : complaintService.forProvider()), [scope])
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('ACTIVE')
  const [notice, setNotice] = useState<{ ok: boolean; text: string }>()

  const run = async (action: () => Promise<unknown>, done: string) => {
    setNotice(undefined)
    try {
      await action()
      setNotice({ ok: true, text: done })
      reload()
      return true
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) })
      return false
    }
  }

  const rows = (data ?? []).filter((c) => (tab === 'ACTIVE' ? c.status === 'OPEN' || c.status === 'IN_PROGRESS' : c.status === tab))

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow={scope === 'admin' ? 'Quản trị sàn' : 'Gian hàng'} title="Khiếu nại / đổi trả"
        description={scope === 'admin'
          ? 'Toàn bộ khiếu nại trên sàn. Admin phân xử khi khách và xưởng không thống nhất.'
          : 'Nhận xử lý, liên hệ khách, rồi ghi rõ cách giải quyết (đổi bánh, hoàn tiền...) hoặc lý do từ chối.'} />
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={cn('chip', tab === t.key && 'chip-active')} onClick={() => setTab(t.key)}>
            {t.label}{t.key === 'ACTIVE' && data ? ` (${(data ?? []).filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length})` : ''}
          </button>
        ))}
      </div>
      {notice && <Notice tone={notice.ok ? 'success' : 'danger'}>{notice.text}</Notice>}
      {loading && !data ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} />
        : rows.length === 0 ? <EmptyState title="Không có khiếu nại nào" /> : (
          <div className="flex flex-col gap-4">
            {rows.map((c) => <ComplaintCard key={c.id} complaint={c} scope={scope} run={run} />)}
          </div>
        )}
    </div>
  )
}

function ComplaintCard({ complaint: c, scope, run }: {
  complaint: Complaint; scope: 'provider' | 'admin'; run: (action: () => Promise<unknown>, done: string) => Promise<boolean>
}) {
  const [closing, setClosing] = useState<'RESOLVED' | 'REJECTED'>()
  const [resolution, setResolution] = useState('')
  const done = c.status === 'RESOLVED' || c.status === 'REJECTED'

  return (
    <article className="card flex flex-col gap-2 p-5 text-small">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-h3">{c.subject}</h2>
          <p className="text-muted">
            {COMPLAINT_TYPE_LABEL[c.type]} · đơn …{c.orderCode.slice(-8).toUpperCase()}{scope === 'admin' && ` · ${c.storeName}`} · gửi {formatDateTime(c.createdAt)}
          </p>
        </div>
        <span className={cn('font-semibold', COMPLAINT_STATUS[c.status].tone)}>{COMPLAINT_STATUS[c.status].text}</span>
      </div>
      {c.description && <p className="whitespace-pre-line">{c.description}</p>}
      <p className="text-muted">Khách: {c.customerName}{c.customerPhone && ` · ${c.customerPhone}`}</p>
      {c.resolution && <Notice tone={c.status === 'REJECTED' ? 'danger' : 'success'}>{c.status === 'REJECTED' ? 'Lý do từ chối' : 'Cách xử lý'}: {c.resolution}</Notice>}
      {!done && (closing ? (
        <div className="flex flex-col gap-2 border-t border-line pt-3">
          <label htmlFor={`res-${c.id}`} className="field-label">{closing === 'RESOLVED' ? 'Cách giải quyết' : 'Lý do từ chối'}</label>
          <textarea id={`res-${c.id}`} className="input" rows={2} maxLength={2000} value={resolution} onChange={(e) => setResolution(e.target.value)}
            placeholder={closing === 'RESOLVED' ? 'Đổi 2 bánh mới, giao lại ngày 12/9' : 'Không có hình ảnh / video mở hộp'} />
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary btn-sm" disabled={!resolution.trim()}
              onClick={() => run(() => complaintService.update(scope, c.id, closing, resolution), closing === 'RESOLVED' ? 'Đã đóng khiếu nại: đã giải quyết.' : 'Đã từ chối khiếu nại.')}>
              Xác nhận
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setClosing(undefined)}>Thôi</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 border-t border-line pt-3">
          {c.status === 'OPEN' && (
            <button type="button" className="btn btn-outline btn-sm" onClick={() => run(() => complaintService.update(scope, c.id, 'IN_PROGRESS'), 'Đã nhận xử lý khiếu nại.')}>Nhận xử lý</button>
          )}
          {c.status === 'IN_PROGRESS' && <button type="button" className="btn btn-primary btn-sm" onClick={() => setClosing('RESOLVED')}>Đã giải quyết</button>}
          <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => setClosing('REJECTED')}>Từ chối</button>
        </div>
      ))}
    </article>
  )
}
