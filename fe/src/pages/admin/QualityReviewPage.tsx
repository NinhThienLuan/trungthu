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

/**
 * Cách admin tự xác minh giấy tờ thật/giả: hệ thống không tự kết luận (không có API cơ quan cấp),
 * nên đưa link cổng tra cứu chính thức và các điểm cần đối chiếu cho từng loại giấy.
 */
const VERIFY_GUIDE: Record<ComplianceDocType, { checks: string[]; links: Array<{ label: string; href: string }> }> = {
  BUSINESS_LICENSE: {
    checks: ['Tên doanh nghiệp/hộ kinh doanh và mã số trên giấy khớp với thông tin gian hàng',
      'Tra mã số doanh nghiệp hoặc mã số thuế: đúng tên, trạng thái "đang hoạt động"',
      'Có dấu đỏ và chữ ký của cơ quan đăng ký kinh doanh'],
    links: [
      { label: 'Cổng đăng ký doanh nghiệp quốc gia', href: 'https://dangkykinhdoanh.gov.vn' },
      { label: 'Tra cứu mã số thuế (Tổng cục Thuế)', href: 'https://tracuunnt.gdt.gov.vn/tcnnt/mstdn.jsp' },
    ],
  },
  FOOD_SAFETY_CERT: {
    checks: ['Tên cơ sở và địa chỉ sản xuất khớp với gian hàng',
      'Còn hạn (giấy ATTP có hiệu lực 3 năm kể từ ngày cấp)',
      'Số giấy chứng nhận và cơ quan cấp (Sở Y tế / Ban quản lý ATTP) rõ ràng, có dấu đỏ'],
    links: [{ label: 'Cục An toàn thực phẩm', href: 'https://vfa.gov.vn' }],
  },
  IDENTITY_KYC: {
    checks: ['Họ tên trùng với chủ gian hàng/người đại diện trên giấy phép kinh doanh',
      'Ảnh chụp thật: không lệch phông chữ ở số CCCD, không viền cắt ghép, có ảnh chân dung rõ',
      'Có thể yêu cầu seller chụp kèm CCCD cầm trên tay nếu nghi ngờ'],
    links: [],
  },
}

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
      <PageHeader eyebrow="Quản trị sàn" title="Thẩm định hồ sơ seller" description="Xem tệp seller nộp, đối chiếu với cổng tra cứu chính thức rồi duyệt hoặc từ chối kèm lý do. Hệ thống tự cảnh báo file trùng với xưởng khác hoặc nộp lại bản đã bị từ chối." />

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
          {doc.rejectedCount != null && (
            <p className={cn('mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold',
              doc.rejectedCount === 0 ? 'bg-emerald-500/10 text-emerald-800'
                : doc.rejectedCount >= 3 ? 'bg-danger/15 text-danger' : 'bg-amber-500/15 text-amber-900')}>
              {doc.rejectedCount === 0 ? 'Chưa từng bị từ chối' : `Tài khoản đã bị từ chối ${doc.rejectedCount} lần`}
            </p>
          )}
          <p className="text-small text-muted">Nộp {formatDateTime(doc.submittedAt)}
            {doc.verifiedAt && ` · Xử lý ${formatDateTime(doc.verifiedAt)}${doc.verifiedByEmail ? ` bởi ${doc.verifiedByEmail}` : ''}`}</p>
        </div>
        <button type="button" onClick={() => setPreviewing(true)} className="btn btn-outline btn-sm">Xem tài liệu</button>
      </div>
      {doc.warnings?.map((warning) => <Notice key={warning} tone="danger">Nghi vấn: {warning}</Notice>)}
      {doc.rejectionReason && <Notice tone="danger">Lý do từ chối: {doc.rejectionReason}</Notice>}
      {doc.verificationStatus === 'PENDING' && (
        <details className="rounded border border-line bg-surface/40 p-3 text-small">
          <summary className="cursor-pointer font-semibold text-navy">Cách kiểm tra {DOC_LABEL[doc.documentType]} thật hay giả</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {VERIFY_GUIDE[doc.documentType].checks.map((check) => <li key={check}>{check}</li>)}
          </ul>
          {VERIFY_GUIDE[doc.documentType].links.length > 0 && (
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {VERIFY_GUIDE[doc.documentType].links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-primary underline">{link.label} ↗</a>
              ))}
            </p>
          )}
        </details>
      )}
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
