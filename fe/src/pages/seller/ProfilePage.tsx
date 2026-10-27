import { useState, type ChangeEvent } from 'react'
import { FileText, Upload } from 'lucide-react'
import { Badge, DocumentPreview, Notice, PageHeading, Panel } from '../../features/backoffice/ui'
import { kycApproved, useBackoffice } from '../../features/backoffice/store'
import { REVIEWS, SELLER_ID, STORE_NAME, type ComplianceDoc } from '../../features/backoffice/model'

export function SellerProfilePage() {
  const { docs, uploadDoc, notify } = useBackoffice()
  const [preview, setPreview] = useState<ComplianceDoc>()
  const approved = kycApproved(docs)
  function upload(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type) || !/\.(pdf|png|jpe?g)$/i.test(file.name)) notify('Chỉ nhận file PDF, PNG hoặc JPG.')
    else if (file.size > 10 * 1024 * 1024) notify('Tài liệu không được lớn hơn 10 MB.')
    else uploadDoc(id, file)
    event.target.value = ''
  }
  return <>
    <PageHeading title="Hồ sơ pháp lý" description="Nộp đủ giấy an toàn thực phẩm và đăng ký kinh doanh hoặc CCCD để được duyệt bán." />
    <div className="bo-object-heading"><div><span className="bo-muted">Gian hàng · {SELLER_ID}</span><h2>{STORE_NAME}</h2><p>Nguyễn Thị Phương · phuong@dongphuong.example · 0903456789</p></div><Badge tone={approved ? 'good' : 'warning'}>{approved ? 'KYC đã được duyệt' : 'KYC chưa được duyệt'}</Badge></div>
    <Notice>{approved ? 'Đã đủ hai loại giấy tờ được duyệt. Gói dịch vụ ACTIVE là điều kiện còn lại để đăng bán và nhận RFQ.' : 'Gian hàng chỉ được đăng bán và nhận RFQ sau khi đủ hồ sơ được duyệt và có gói dịch vụ ACTIVE.'}</Notice>
    <Panel title="Tài liệu bắt buộc" note="PDF, PNG hoặc JPG · tối đa 10 MB mỗi file">
      {docs.map(doc => <div className="bo-document-row" key={doc.id}><FileText size={22} /><div><strong>{doc.name}</strong><small>{doc.filename} · Nộp ngày {doc.submittedAt}</small>{doc.status === 'REJECTED' && <p className="bo-rejection">Lý do từ chối: {doc.reason}</p>}</div><Badge tone={doc.status === 'APPROVED' ? 'good' : doc.status === 'REJECTED' ? 'bad' : 'warning'}>{REVIEWS[doc.status]}</Badge><div className="bo-actions"><button className="bo-button bo-button-small" onClick={() => setPreview(doc)}>Xem tài liệu</button><label className="bo-button bo-button-small bo-file-label"><Upload size={14} />{doc.status === 'REJECTED' ? 'Nộp lại' : 'Thay tài liệu'}<input type="file" accept=".pdf,.png,.jpg,.jpeg" aria-label={`Nộp ${doc.name}`} onChange={event => upload(doc.id, event)} /></label></div></div>)}
    </Panel>
    <div className="bo-process"><div><span>1</span><strong>Seller nộp hồ sơ</strong><p>Hai loại tài liệu pháp lý bắt buộc.</p></div><div><span>2</span><strong>Admin thẩm định</strong><p>Duyệt hoặc từ chối kèm lý do.</p></div><div><span>3</span><strong>Gian hàng được duyệt</strong><p>Đủ hồ sơ mới đáp ứng điều kiện KYC.</p></div></div>
    {preview && <DocumentPreview doc={preview} onClose={() => setPreview(undefined)} />}
  </>
}

