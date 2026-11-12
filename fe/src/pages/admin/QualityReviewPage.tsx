import { useState, type FormEvent } from 'react'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cn, formatDateTime } from '../../lib/format'
import { adminService, type AdminComplianceDoc, type ComplianceStatus } from '../../services/adminService'
import type { ComplianceDocType } from '../../services/sellerService'
import { TextInput } from '../../components/ui/Field'
import { DocumentPreview } from '../../components/DocumentPreview'
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
  useDocumentTitle('Thẩm định chất lượng xưởng')
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
      <PageHeader eyebrow="Quản trị sàn" title="Thẩm định chất lượng xưởng" description="Đối chiếu thông tin với nguồn cấp giấy tờ, kiểm tra ảnh gốc và liên hệ cơ quan cấp khi nghi ngờ giả mạo. Ảnh hoặc kết quả AI không tự chứng minh giấy tờ là thật." />

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
  const [previewing, setPreviewing] = useState(false)
  const [reasonError, setReasonError] = useState<string>()
  const [verificationNote, setVerificationNote] = useState('')
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
          <p className="text-small text-muted">{who} · {doc.providerEmail}</p>
          <p className="text-small font-medium text-danger">Tài khoản đã bị từ chối {doc.providerRejectionCount} lần</p>
          <p className="text-small text-muted">Nộp {formatDateTime(doc.submittedAt)}
            {doc.verifiedAt && ` · Xử lý ${formatDateTime(doc.verifiedAt)}${doc.verifiedByEmail ? ` bởi ${doc.verifiedByEmail}` : ''}`}</p>
        </div>
        <button type="button" onClick={() => setPreviewing(true)} className="btn btn-outline btn-sm">Xem tài liệu</button>
      </div>
      {doc.rejectionReason && <Notice tone="danger">Lý do từ chối: {doc.rejectionReason}</Notice>}
      {doc.verificationNote && <Notice tone="success">Cách đã đối chiếu: {doc.verificationNote}</Notice>}
      {doc.verificationStatus === 'PENDING' && (
        rejecting ? (
          <form noValidate onSubmit={reject} className="flex flex-wrap items-end gap-3 border-t border-line pt-3">
            <TextInput label="Lý do từ chối" name={reasonName} error={reasonError} onChange={() => setReasonError(undefined)} className="min-w-0 basis-64 flex-1" placeholder="Ảnh mờ, giấy phép hết hạn..." maxLength={500} required />
            <button type="submit" className="btn btn-primary btn-sm">Xác nhận từ chối</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setRejecting(false); setReasonError(undefined) }}>Thôi</button>
          </form>
        ) : (
          <div className="flex flex-col gap-2 border-t border-line pt-3">
            <label htmlFor={`verify-${doc.id}`} className="field-label">Nguồn và cách đối chiếu trước khi duyệt</label>
            <textarea id={`verify-${doc.id}`} className="input" rows={2} maxLength={1000} value={verificationNote}
              onChange={(event) => setVerificationNote(event.target.value)}
              placeholder="Ví dụ: tra số giấy phép trên cổng cơ quan cấp, đối chiếu tên xưởng và ngày hiệu lực" />
            <div className="flex gap-2">
            <button type="button" className="btn btn-primary btn-sm" disabled={!verificationNote.trim()} onClick={() => run(() => adminService.approve(doc.id, verificationNote.trim()), `Đã duyệt ${DOC_LABEL[doc.documentType]} của ${who}.`)}>Duyệt</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setRejecting(true)}>Từ chối</button>
            </div>
          </div>
        )
      )}
      {previewing && <DocumentPreview url={doc.documentUrl} title={`${DOC_LABEL[doc.documentType]} · ${who}`} onClose={() => setPreviewing(false)} />}
    </article>
  )
}
