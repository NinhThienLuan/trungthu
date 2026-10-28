import { useState, type FormEvent } from 'react'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatDateTime } from '../../lib/format'
import { adminService, type AdminComplianceDoc, type ComplianceStatus } from '../../services/adminService'
import type { ComplianceDocType } from '../../services/sellerService'
import { TextInput } from '../../components/ui/Field'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/States'

const TABS: Array<{ status: ComplianceStatus; label: string }> = [
  { status: 'PENDING', label: 'Chờ duyệt' },
  { status: 'APPROVED', label: 'Đã duyệt' },
  { status: 'REJECTED', label: 'Bị từ chối' },
  { status: 'EXPIRED', label: 'Hết hạn' },
]

const DOC_LABEL: Record<ComplianceDocType, string> = {
  FOOD_SAFETY_CERT: 'Giấy chứng nhận ATTP',
  BUSINESS_LICENSE: 'Giấy phép kinh doanh',
  IDENTITY_KYC: 'CCCD / hộ chiếu',
}

/** Admin sàn: duyệt hoặc từ chối giấy tờ seller nộp (BE1 /api/admin/compliance) */
export function QualityReviewPage() {
  useDocumentTitle('Thẩm định hồ sơ')
  const [status, setStatus] = useState<ComplianceStatus>('PENDING')
  const { data, loading, error, reload } = useApi(() => adminService.documents(status), [status])
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
      <PageHeader eyebrow="Quản trị sàn" title="Thẩm định hồ sơ seller" description="Xem tệp seller nộp rồi duyệt hoặc từ chối kèm lý do. Seller thấy kết quả ở trang Hồ sơ & thẩm định." />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.status} type="button" className={cn('chip', status === t.status && 'chip-active')}
            onClick={() => { setNotice(undefined); setStatus(t.status) }}>{t.label}</button>
        ))}
      </div>

      {notice && <Notice tone={notice.ok ? 'success' : 'danger'}>{notice.text}</Notice>}

      {loading && !data ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} />
        : !data?.length ? <EmptyState title="Không có hồ sơ nào" /> : (
          <div className="flex flex-col gap-4">
            {[...data].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)).map((doc) => (
              <DocRow key={doc.id} doc={doc} run={run} />
            ))}
          </div>
        )}
    </div>
  )
}

function DocRow({ doc, run }: { doc: AdminComplianceDoc; run: (action: () => Promise<unknown>, done: string) => Promise<void> }) {
  const [rejecting, setRejecting] = useState(false)
  const who = doc.providerName ?? doc.providerEmail

  const reject = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const reason = String(new FormData(e.currentTarget).get('reason') ?? '').trim()
    if (!reason) return
    run(() => adminService.reject(doc.id, reason), `Đã từ chối ${DOC_LABEL[doc.documentType]} của ${who}.`)
  }

  return (
    <article className="card flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-h3">{DOC_LABEL[doc.documentType]}</h2>
          <p className="text-small text-muted">{who} · {doc.providerEmail}</p>
          <p className="text-small text-muted">Nộp {formatDateTime(doc.submittedAt)}
            {doc.verifiedAt && ` · Xử lý ${formatDateTime(doc.verifiedAt)}${doc.verifiedByEmail ? ` bởi ${doc.verifiedByEmail}` : ''}`}</p>
        </div>
        <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Xem tệp</a>
      </div>
      {doc.rejectionReason && <Notice tone="danger">Lý do từ chối: {doc.rejectionReason}</Notice>}
      {doc.verificationStatus === 'PENDING' && (
        rejecting ? (
          <form noValidate onSubmit={reject} className="flex flex-wrap items-end gap-3 border-t border-line pt-3">
            <TextInput label="Lý do từ chối" name="reason" className="min-w-64 flex-1" placeholder="Ảnh mờ, giấy phép hết hạn..." maxLength={500} required />
            <button type="submit" className="btn btn-primary btn-sm">Xác nhận từ chối</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRejecting(false)}>Thôi</button>
          </form>
        ) : (
          <div className="flex gap-2 border-t border-line pt-3">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => run(() => adminService.approve(doc.id), `Đã duyệt ${DOC_LABEL[doc.documentType]} của ${who}.`)}>Duyệt</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setRejecting(true)}>Từ chối</button>
          </div>
        )
      )}
    </article>
  )
}
