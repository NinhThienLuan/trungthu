import { useState, type FormEvent } from 'react'
import { errorMessage } from '../../apis/http'
import { useApi } from '../../hooks/useApi'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatDateTime } from '../../lib/format'
import { useAuthStore } from '../../stores/authStore'
import { sellerService, type ComplianceDoc, type ComplianceDocType } from '../../services/sellerService'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, Notice, Spinner } from '../../components/ui/States'

const DOC_TYPES: Array<{ type: ComplianceDocType; label: string; hint: string }> = [
  { type: 'FOOD_SAFETY_CERT', label: 'Giấy chứng nhận ATTP', hint: 'Cơ sở đủ điều kiện an toàn thực phẩm' },
  { type: 'BUSINESS_LICENSE', label: 'Giấy phép kinh doanh', hint: 'Đăng ký kinh doanh hoặc hộ kinh doanh' },
  { type: 'IDENTITY_KYC', label: 'CCCD / hộ chiếu chủ cơ sở', hint: 'Ảnh hoặc PDF rõ nét' },
]

const STATUS: Record<ComplianceDoc['verificationStatus'], { label: string; tone: 'info' | 'success' | 'danger' }> = {
  PENDING: { label: 'Chờ admin duyệt', tone: 'info' },
  APPROVED: { label: 'Đã duyệt', tone: 'success' },
  REJECTED: { label: 'Bị từ chối', tone: 'danger' },
  EXPIRED: { label: 'Hết hạn', tone: 'danger' },
}

/** Seller: thông tin gian hàng + nộp giấy tờ thẩm định (BE1 /api/provider/compliance) */
export function ProfilePage() {
  useDocumentTitle('Hồ sơ & thẩm định')
  const user = useAuthStore((s) => s.user)
  const { data, loading, error, reload } = useApi(() => sellerService.documents(), [])

  // Bản nộp mới nhất của từng loại
  const latest = new Map<ComplianceDocType, ComplianceDoc>()
  for (const doc of [...(data ?? [])].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))) latest.set(doc.documentType, doc)
  const approved = [...latest.values()].some((d) => d.verificationStatus === 'APPROVED')

  return (
    <div className="page section flex flex-col gap-6">
      <PageHeader eyebrow="Gian hàng" title="Hồ sơ & thẩm định" description="Admin duyệt giấy tờ trước khi gian hàng được tin cậy trên sàn." />

      <section className="card grid gap-3 p-5 text-small sm:grid-cols-2">
        <p><span className="text-muted">Tên gian hàng: </span>{user?.storeName ?? '—'}</p>
        <p><span className="text-muted">Chủ cơ sở: </span>{user?.fullName}</p>
        <p><span className="text-muted">Email: </span>{user?.email}</p>
        <p><span className="text-muted">Điện thoại: </span>{user?.phone ?? '—'}</p>
        <p className="sm:col-span-2"><span className="text-muted">Địa chỉ: </span>{user?.address ?? '—'}</p>
      </section>

      {loading && !data ? <Spinner /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <Notice tone={approved ? 'success' : 'info'}>
            {approved ? 'Gian hàng đã có giấy tờ được duyệt.' : 'Chưa có giấy tờ nào được duyệt. Hãy nộp đủ 3 loại bên dưới.'}
          </Notice>
          <div className="grid gap-4 lg:grid-cols-3">
            {DOC_TYPES.map((d) => <DocCard key={d.type} {...d} doc={latest.get(d.type)} onUploaded={reload} />)}
          </div>
        </>
      )}
    </div>
  )
}

function DocCard({ type, label, hint, doc, onUploaded }: { type: ComplianceDocType; label: string; hint: string; doc?: ComplianceDoc; onUploaded: () => void }) {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string }>()
  const canUpload = !doc || doc.verificationStatus !== 'PENDING'

  const upload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const file = new FormData(e.currentTarget).get('file')
    if (!(file instanceof File) || file.size === 0) return setResult({ ok: false, text: 'Chọn một tệp để nộp.' })
    setBusy(true)
    setResult(undefined)
    try {
      await sellerService.uploadDocument(type, file)
      setResult({ ok: true, text: 'Đã nộp, đang chờ admin duyệt.' })
      onUploaded()
    } catch (err) {
      setResult({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card flex flex-col gap-3 p-5">
      <div>
        <h2 className="text-h3">{label}</h2>
        <p className="text-small text-muted">{hint}</p>
      </div>
      {doc ? (
        <div className="text-small">
          <Notice tone={STATUS[doc.verificationStatus].tone}>
            {STATUS[doc.verificationStatus].label}{doc.rejectionReason && `: ${doc.rejectionReason}`}
          </Notice>
          <p className="mt-2 text-muted">Nộp lúc {formatDateTime(doc.submittedAt)} · <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="underline">Xem tệp</a></p>
        </div>
      ) : <p className="text-small text-muted">Chưa nộp.</p>}
      {result && <Notice tone={result.ok ? 'success' : 'danger'}>{result.text}</Notice>}
      {canUpload && (
        <form noValidate onSubmit={upload} className="mt-auto flex flex-col gap-2">
          <label htmlFor={`file-${type}`} className="field-label">{doc ? 'Nộp bản mới' : 'Tệp giấy tờ (ảnh hoặc PDF)'}</label>
          <input id={`file-${type}`} name="file" type="file" accept="image/*,application/pdf" className="text-small" />
          <button type="submit" className="btn btn-primary btn-sm self-start" disabled={busy}>{busy ? 'Đang nộp...' : 'Nộp giấy tờ'}</button>
        </form>
      )}
    </section>
  )
}
