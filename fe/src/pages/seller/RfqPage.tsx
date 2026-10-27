import { useState } from 'react'
import { Download, Mail, Phone, Search } from 'lucide-react'
import { Badge, Empty, Modal, Notice, OfficeLink, PageHeading } from '../../features/backoffice/ui'
import { eligible, useBackoffice } from '../../features/backoffice/store'
import { RFQS, type Rfq } from '../../features/backoffice/model'

const logoFile = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="420" height="180"><rect width="420" height="180" fill="#fff"/><text x="210" y="105" font-family="serif" font-size="52" fill="#092441" text-anchor="middle">HOA AN</text><text x="210" y="150" font-family="sans-serif" font-size="14" fill="#555" text-anchor="middle"></text></svg>')}`
export function SellerRfqPage() {
  const { docs, subscriptions } = useBackoffice()
  const canReceive = eligible(docs, subscriptions)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Rfq>()
  const rows = canReceive ? RFQS.filter(rfq => `${rfq.company} ${rfq.code}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'))) : []
  return <>
    <PageHeading title="Yêu cầu mua sỉ RFQ" description="Xem nhu cầu doanh nghiệp và tự liên hệ khách để trao đổi báo giá ngoài hệ thống." />
    {!canReceive ? <Notice>Gian hàng chưa được phân phối RFQ. Cần <OfficeLink to="/seller/profile">KYC đã duyệt</OfficeLink> và <OfficeLink to="/seller/subscription">gói dịch vụ ACTIVE</OfficeLink>.</Notice> : <Notice>RFQ được phân phối đến tất cả xưởng đủ điều kiện. Yêu cầu mua sỉ không tạo đơn, không giữ tồn kho và không thu cọc.</Notice>}
    <div className="bo-toolbar"><label className="bo-search"><Search size={16} /><input aria-label="Tìm RFQ" placeholder="Tìm công ty hoặc mã RFQ…" value={query} onChange={event => setQuery(event.target.value)} /></label><span className="bo-muted">{rows.length} yêu cầu · DISTRIBUTED</span></div>
    <div className="bo-table-wrap"><table className="bo-table"><thead><tr><th>Doanh nghiệp / Mã yêu cầu</th><th className="bo-num">Số lượng</th><th>Ngày nhận</th><th>Ngày gửi</th><th>Thao tác</th></tr></thead><tbody>{rows.map(rfq => <tr key={rfq.code}><td><strong>{rfq.company}</strong><small>{rfq.code}</small></td><td className="bo-num">{rfq.quantity} hộp</td><td>{rfq.deliveryDate}</td><td>{rfq.submittedAt}</td><td><button className="bo-button bo-button-small" onClick={() => setSelected(rfq)}>Xem yêu cầu</button></td></tr>)}</tbody></table>{!rows.length && <Empty>{canReceive ? 'Không có yêu cầu mua sỉ phù hợp với từ khóa.' : 'Thông tin RFQ sẽ hiển thị sau khi gian hàng đủ điều kiện.'}</Empty>}</div>
    <p className="bo-footnote">Điều kiện gửi yêu cầu: ít nhất 20 hộp, ngày nhận cách ngày gửi ít nhất 3 ngày. MVP không có đấu thầu hoặc gửi báo giá trực tuyến.</p>
    {selected && canReceive && <Modal title={selected.code} onClose={() => setSelected(undefined)}><div className="bo-detail-title"><strong>{selected.company}</strong><Badge>DISTRIBUTED</Badge></div><dl className="bo-key-values"><div><dt>Mã số thuế</dt><dd>{selected.taxCode}</dd></div><div><dt>Người liên hệ</dt><dd>{selected.contact}</dd></div><div><dt>Số lượng</dt><dd>{selected.quantity} hộp</dd></div><div><dt>Ngày nhận</dt><dd>{selected.deliveryDate}</dd></div></dl><p>{selected.note}</p><div className="bo-contact"><a href={`tel:${selected.phone}`}><Phone size={16} />{selected.phone}</a><a href={`mailto:${selected.email}`}><Mail size={16} />{selected.email}</a></div>{selected.logo ? <a className="bo-button" href={logoFile} download="hoa-an-logo.svg"><Download size={15} />Tải logo</a> : <p className="bo-muted">Khách không đính kèm logo.</p>}</Modal>}
  </>
}
