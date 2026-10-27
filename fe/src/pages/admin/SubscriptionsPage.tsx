import { useState, type FormEvent } from 'react'
import { Badge, Empty, Modal, Notice, PageHeading, Panel } from '../../features/backoffice/ui'
import { useBackoffice } from '../../features/backoffice/store'
import { DEMO_DATE, PLANS, STORE_NAME, type Subscription } from '../../features/backoffice/model'
import { formatVnd } from '../../lib/format'

export function AdminSubscriptionsPage() {
  const { subscriptions, activatePlan } = useBackoffice()
  const [filter, setFilter] = useState('PENDING')
  const [selected, setSelected] = useState<Subscription>()
  const rows = subscriptions.filter(sub => filter === 'ALL' || sub.status === filter)
  function activate(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (selected) activatePlan(selected.id); setSelected(undefined) }
  return <>
    <PageHeading title="Kích hoạt gói SaaS" description="Đối soát chuyển khoản phí thuê gian hàng trước khi kích hoạt quyền lợi gói." />
    <Notice>Phí gói STANDARD 1.000.000đ / 20 SKU; VIP 3.000.000đ / 100 SKU và ưu tiên hiển thị. Sàn không thu hoa hồng đơn hàng.</Notice>
    <div className="bo-tabs">{[['PENDING', 'Chờ xác nhận'], ['ACTIVE', 'Đang hoạt động'], ['ALL', 'Tất cả']].map(([value, label]) => <button key={value} className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label} <span>{subscriptions.filter(sub => value === 'ALL' || sub.status === value).length}</span></button>)}</div>
    <div className="bo-toolbar"><span>{rows.length} yêu cầu gói</span><span className="bo-muted">Giao dịch: SUBSCRIPTION_FEE</span></div>
    <div className="bo-table-wrap"><table className="bo-table"><thead><tr><th>Gian hàng / Ngày yêu cầu</th><th>Gói</th><th className="bo-num">Phí cần đối soát</th><th>Nội dung chuyển khoản</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{rows.map(sub => <tr key={sub.id}><td><strong>{STORE_NAME}</strong><small>{sub.submittedAt}</small></td><td>{PLANS[sub.plan].name}<small>{PLANS[sub.plan].limit} SKU</small></td><td className="bo-num">{formatVnd(PLANS[sub.plan].price)}</td><td>{sub.transferNote}</td><td><Badge tone={sub.status === 'ACTIVE' ? 'good' : sub.status === 'PENDING' ? 'warning' : 'neutral'}>{sub.status === 'PENDING' ? 'Chờ xác nhận' : sub.status}</Badge></td><td>{sub.status === 'PENDING' ? <button className="bo-button bo-button-small" onClick={() => setSelected(sub)}>Đối soát</button> : <span className="bo-muted">{sub.end ? `Đến ${sub.end}` : '—'}</span>}</td></tr>)}</tbody></table>{!rows.length && <Empty>Chưa có yêu cầu đăng ký gói trong trạng thái này.</Empty>}</div>
    <Panel title="Nguyên tắc kích hoạt"><p>Chỉ kích hoạt khi số tiền và nội dung khớp sao kê. Quyền lợi mới được áp dụng sau khi xác nhận; mỗi gian hàng chỉ có một gói ACTIVE.</p></Panel>
    {selected && <Modal title="Đối soát phí thuê gian hàng" onClose={() => setSelected(undefined)}><dl className="bo-key-values"><div><dt>Gian hàng</dt><dd>{STORE_NAME}</dd></div><div><dt>Gói đăng ký</dt><dd>{PLANS[selected.plan].name}</dd></div><div><dt>Số tiền cần nhận</dt><dd>{formatVnd(PLANS[selected.plan].price)}</dd></div><div><dt>Nội dung</dt><dd>{selected.transferNote}</dd></div><div><dt>Thời hạn hiệu lực</dt><dd>{DEMO_DATE} – 2026-12-31</dd></div></dl><form className="bo-form" onSubmit={activate}><label className="bo-checkbox"><input type="checkbox" required />Tôi đã kiểm tra sao kê, xác nhận đúng số tiền và nội dung chuyển khoản.</label><button className="bo-button bo-button-primary">Xác nhận kích hoạt gói</button></form></Modal>}
  </>
}
