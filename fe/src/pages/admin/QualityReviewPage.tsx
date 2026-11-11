import { useState, type FormEvent } from 'react'
import { errorMessage } from '../../apis/http'
import { useAdminList } from '../../hooks/useAdminList'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatDateTime } from '../../lib/format'
import { adminService, type AdminComplianceDoc, type ComplianceStatus } from '../../services/adminService'
import type { ComplianceDocType } from '../../services/sellerService'
import { TextInput } from '../../components/ui/Field'
import { AdminListPagination } from '../../components/AdminListPagination'
import { DocumentPreview } from '../../components/DocumentPreview'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, ErrorState, Notice, Spinner } from '../../components/ui/States'

const STATUS_LABEL: Record<ComplianceStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Bị từ chối',
  EXPIRED: 'Hết hạn',
}
const TABS = [undefined, ...Object.keys(STATUS_LABEL) as ComplianceStatus[]]

const DOC_LABEL: Record<ComplianceDocType, string> = {
  FOOD_SAFETY_CERT: 'Giấy chứng nhận ATTP',
  BUSINESS_LICENSE: 'Giấy phép kinh doanh',
  IDENTITY_KYC: 'CCCD / hộ chiếu',
}

/** Admin sàn: duyệt hoặc từ chối giấy tờ seller nộp (BE1 /api/admin/compliance) */
export function QualityReviewPage() {
  useDocumentTitle('Thẩm định hồ sơ')
  const { status, setStatus, page, setPage, pagination, data, loading, error, reload } =
    useAdminList('PENDING', adminService.documents)
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

      <div role="group" aria-label="Lọc theo trạng thái hồ sơ" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t ?? 'all'} type="button" aria-pressed={status === t}
            className={cn('chip', status === t && 'chip-active')}
            onClick={() => { setNotice(undefined); setStatus(t) }}>{t ? STATUS_LABEL[t] : 'Tất cả'}</button>
        ))}
      </div>

      <AdminListPagination data={pagination} page={page} loading={loading} error={error} noun="hồ sơ" onChange={setPage} />
      {notice && <Notice tone={notice.ok ? 'success' : 'danger'}>{notice.text}</Notice>}

      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} />
        : !data?.content.length ? <EmptyState title="Không có hồ sơ nào" /> : (
          <div className="flex flex-col gap-4">
            {data.content.map((doc) => (
              <DocRow key={doc.id} doc={doc} showStatus={status === undefined} run={run} />
            ))}
          </div>
        )}
    </div>
  )
}

function DocRow({ doc, showStatus, run }: {
  doc: AdminComplianceDoc
  showStatus: boolean
  run: (action: () => Promise<unknown>, done: string) => Promise<void>
}) {
  const [rejecting, setRejecting] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [reasonError, setReasonError] = useState<string>()
  const reasonName = `reason-${doc.id}`
  const who = doc.providerName ?? doc.providerEmail

  const reject = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const reason = String(new FormData(e.currentTarget).get(reasonName) ?? '').trim()
    if (!reason) return setReasonError('Vui lòng nhập lý do từ chối hồ sơ.')
    setReasonError(undefined)
    run(() => adminService.reject(doc.id, reason), `Đã từ chối ${DOC_LABEL[doc.documentType]} của ${who}.`)
  }

  return (
    <article className="card flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-h3">{DOC_LABEL[doc.documentType]}</h2>
          {showStatus && <span className="chip my-1">{STATUS_LABEL[doc.verificationStatus]}</span>}
          <p className="text-small text-muted">{who} · {doc.providerEmail}</p>
          <p className="text-small text-muted">Nộp {formatDateTime(doc.submittedAt)}
            {doc.verifiedAt && ` · Xử lý ${formatDateTime(doc.verifiedAt)}${doc.verifiedByEmail ? ` bởi ${doc.verifiedByEmail}` : ''}`}</p>
        </div>
        <button type="button" onClick={() => setPreviewing(true)} className="btn btn-outline btn-sm">Xem tài liệu</button>
      </div>
      {doc.rejectionReason && <Notice tone="danger">Lý do từ chối: {doc.rejectionReason}</Notice>}
      {doc.verificationStatus === 'PENDING' && (
        rejecting ? (
          <form noValidate onSubmit={reject} className="flex flex-wrap items-end gap-3 border-t border-line pt-3">
            <TextInput label="Lý do từ chối" name={reasonName} error={reasonError} onChange={() => setReasonError(undefined)} className="min-w-0 basis-64 flex-1" placeholder="Ảnh mờ, giấy phép hết hạn..." maxLength={500} required />
            <button type="submit" className="btn btn-primary btn-sm">Xác nhận từ chối</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setRejecting(false); setReasonError(undefined) }}>Thôi</button>
          </form>
        ) : (
          <div className="flex gap-2 border-t border-line pt-3">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => run(() => adminService.approve(doc.id), `Đã duyệt ${DOC_LABEL[doc.documentType]} của ${who}.`)}>Duyệt</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setRejecting(true)}>Từ chối</button>
          </div>
        )
      )}
      {previewing && <DocumentPreview url={doc.documentUrl} title={`${DOC_LABEL[doc.documentType]} · ${who}`} onClose={() => setPreviewing(false)} />}
    </article>
  )
}
