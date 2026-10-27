import { useState, type FormEvent } from 'react'
import { Check, FileText, X } from 'lucide-react'
import { Badge, DocumentPreview, Empty, Modal, Notice, PageHeading, Panel } from '../../features/backoffice/ui'
import { kycApproved, useBackoffice } from '../../features/backoffice/store'
import { REVIEWS, SELLER_ID, STORE_NAME, type ComplianceDoc, type ReviewStatus } from '../../features/backoffice/model'

export function AdminCompliancePage() {
  const { docs, reviewDoc } = useBackoffice()
  const [filter, setFilter] = useState<ReviewStatus | 'ALL'>('PENDING')
  const [preview, setPreview] = useState<ComplianceDoc>()
  const [rejectId, setRejectId] = useState<string>()
  const rows = docs.filter(doc => filter === 'ALL' || doc.status === filter)
  function reject(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (rejectId) reviewDoc(rejectId, 'REJECTED', String(new FormData(event.currentTarget).get('reason'))); setRejectId(undefined) }
  return <>
    <PageHeading title="Duyệt hồ sơ KYC" description="Kiểm tra giấy an toàn thực phẩm và giấy tờ pháp lý trước khi cho phép gian hàng hoạt động." />
    <div className="bo-object-heading"><div><span className="bo-muted">Hồ sơ gian hàng · {SELLER_ID}</span><h2>{STORE_NAME}</h2><p>Nguyễn Thị Phương · phuong@dongphuong.example · 0903456789</p></div><Badge tone={kycApproved(docs) ? 'good' : 'warning'}>{kycApproved(docs) ? 'Đủ hồ sơ được duyệt' : 'Chưa đủ điều kiện KYC'}</Badge></div>
    <div className="bo-tabs" aria-label="Lọc tài liệu KYC">{(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(status => <button key={status} className={filter === status ? 'is-active' : ''} onClick={() => setFilter(status)} aria-pressed={filter === status}>{status === 'ALL' ? 'Tất cả' : REVIEWS[status]} <span>{docs.filter(doc => status === 'ALL' || doc.status === status).length}</span></button>)}</div>
    <div className="bo-grid-kyc"><Panel title="Tài liệu thẩm định" note={`${rows.length} tài liệu trong bộ lọc`}>{rows.map(doc => <article className="bo-review-doc" key={doc.id}><div className="bo-document-row"><FileText size={22} /><div><strong>{doc.name}</strong><small>{doc.filename} · Nộp {doc.submittedAt}</small></div><Badge tone={doc.status === 'APPROVED' ? 'good' : doc.status === 'REJECTED' ? 'bad' : 'warning'}>{REVIEWS[doc.status]}</Badge></div>{doc.reason && <p className="bo-rejection">Lý do từ chối: {doc.reason}</p>}<div className="bo-actions"><button className="bo-button" onClick={() => setPreview(doc)}>Xem tài liệu</button>{doc.status === 'PENDING' && <><button className="bo-button bo-button-primary" onClick={() => reviewDoc(doc.id, 'APPROVED')}><Check size={15} />Duyệt tài liệu</button><button className="bo-button" onClick={() => setRejectId(doc.id)}><X size={15} />Từ chối</button></>}</div></article>)}{!rows.length && <Empty>Không có tài liệu {filter === 'PENDING' ? 'chờ duyệt. Hồ sơ mới hoặc nộp lại sẽ xuất hiện tại đây.' : 'trong trạng thái này.'}</Empty>}</Panel>
      <Panel title="Điều kiện thẩm định"><ul className="bo-check-copy"><li>Giấy chứng nhận an toàn thực phẩm rõ ràng, còn hiệu lực.</li><li>Đăng ký kinh doanh hoặc CCCD khớp với chủ gian hàng.</li><li>Từ chối phải ghi rõ lý do để seller nộp lại.</li></ul><Notice>Chỉ khi cả hai loại tài liệu được duyệt, gian hàng mới đạt KYC. Seller còn cần gói ACTIVE để đăng bán và nhận RFQ.</Notice></Panel>
    </div>
    {preview && <DocumentPreview doc={preview} onClose={() => setPreview(undefined)} />}
    {rejectId && <Modal title="Từ chối tài liệu" onClose={() => setRejectId(undefined)}><p>{docs.find(doc => doc.id === rejectId)?.name}</p><form className="bo-form" onSubmit={reject}><label>Lý do từ chối<textarea name="reason" required minLength={5} maxLength={500} rows={4} placeholder="Ví dụ: Ảnh bị mờ, vui lòng nộp bản chụp rõ thông tin và dấu xác nhận." /></label><button className="bo-button bo-button-danger">Gửi lý do từ chối</button></form></Modal>}
  </>
}

