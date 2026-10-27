import { ArrowRight } from 'lucide-react'
import { Badge, MetricStrip, OfficeLink, PageHeading, Panel } from '../../features/backoffice/ui'
import { kycApproved, useBackoffice } from '../../features/backoffice/store'
import { PLANS, STORE_NAME } from '../../features/backoffice/model'
import { formatVnd } from '../../lib/format'

export function AdminOverviewPage() {
  const { docs, subscriptions } = useBackoffice()
  const pendingDocs = docs.filter(doc => doc.status === 'PENDING')
  const pendingSubs = subscriptions.filter(sub => sub.status === 'PENDING')
  const active = subscriptions.filter(sub => sub.status === 'ACTIVE')
  return <>
    <PageHeading title="Quản trị nền tảng" description="Duyệt điều kiện kinh doanh và xác nhận phí thuê gian hàng của seller." />
    <MetricStrip items={[{ label: 'Tài liệu cần duyệt', value: pendingDocs.length, hint: 'Hồ sơ KYC gian hàng' }, { label: 'Gói chờ đối soát', value: pendingSubs.length, hint: 'Chưa có hiệu lực' }, { label: 'Phí gói đã xác nhận', value: formatVnd(active.reduce((sum, sub) => sum + PLANS[sub.plan].price, 0)), hint: 'Tổng phí của các gói đang ACTIVE' }]} />
    <div className="bo-grid-2"><Panel title="Hàng đợi KYC" note={`${STORE_NAME} · ${kycApproved(docs) ? 'Đã đủ hồ sơ' : 'Chưa đủ hồ sơ được duyệt'}`} action={<OfficeLink to="/admin/kyc">Mở hồ sơ <ArrowRight size={14} /></OfficeLink>}><div className="bo-list">{docs.map(doc => <div key={doc.id} className="bo-list-row"><div><strong>{doc.name}</strong><small>{doc.submittedAt}</small></div><Badge tone={doc.status === 'APPROVED' ? 'good' : doc.status === 'PENDING' ? 'warning' : 'bad'}>{doc.status === 'APPROVED' ? 'Đã duyệt' : doc.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}</Badge></div>)}</div></Panel>
      <Panel title="Gói dịch vụ gian hàng" note="Phí SaaS chuyển khoản cho sàn" action={<OfficeLink to="/admin/subscriptions">Đối soát gói <ArrowRight size={14} /></OfficeLink>}><div className="bo-list">{subscriptions.slice(0, 3).map(sub => <div key={sub.id} className="bo-list-row"><div><strong>{PLANS[sub.plan].name} · {STORE_NAME}</strong><small>{sub.status === 'PENDING' ? 'Chờ kiểm tra sao kê' : sub.status === 'ACTIVE' ? `Hiệu lực đến ${sub.end}` : 'Đã kết thúc hiệu lực'}</small></div><span className="bo-num">{formatVnd(PLANS[sub.plan].price)}</span></div>)}</div></Panel></div>
    <Panel title="Phạm vi quản trị"><p>Admin thẩm định tài liệu và kích hoạt gói thuê gian hàng. Seller nhận tiền cọc từ khách và tự xử lý đơn B2C. Các xưởng đủ điều kiện cùng nhận RFQ và liên hệ doanh nghiệp ngoài nền tảng.</p></Panel>
  </>
}
