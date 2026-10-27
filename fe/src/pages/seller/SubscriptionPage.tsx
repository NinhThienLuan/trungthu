import { Badge, Notice, PageHeading, Panel } from '../../features/backoffice/ui'
import { activePlan, planFor, useBackoffice } from '../../features/backoffice/store'
import { PLANS, SELLER_ID, type PlanId } from '../../features/backoffice/model'
import { formatVnd } from '../../lib/format'

export function SellerSubscriptionPage() {
  const { subscriptions, skus, requestPlan } = useBackoffice()
  const active = activePlan(subscriptions)
  const plan = planFor(subscriptions)
  const pending = subscriptions.find(sub => sub.status === 'PENDING')
  return <>
    <PageHeading title="Gói dịch vụ gian hàng" description="Phí thuê gian hàng SaaS. Sàn không thu hoa hồng trên đơn hàng." />
    <div className="bo-inline-summary"><div><strong>{plan.name}</strong> · {skus.length} / {plan.limit} SKU {active && <span className="bo-muted">· Hiệu lực {active.start} – {active.end}</span>}</div><Badge tone={active ? 'good' : 'warning'}>{active ? 'ACTIVE' : 'Chưa có gói ACTIVE'}</Badge></div>
    {pending && <Notice>Yêu cầu gói {PLANS[pending.plan].name} đang chờ admin đối soát. Nội dung chuyển khoản: <strong>SUB-{SELLER_ID}</strong>. Quyền lợi gói hiện tại giữ nguyên cho đến khi gói mới được kích hoạt.</Notice>}
    <div className="bo-grid-2 bo-plans">{(Object.keys(PLANS) as PlanId[]).map(id => <Panel key={id} title={PLANS[id].name} note={id === 'VIP' ? 'Dành cho xưởng có danh mục lớn' : 'Dành cho gian hàng tiêu chuẩn'} action={active?.plan === id ? <Badge tone="good">Đang sử dụng</Badge> : undefined}><p className="bo-price">{formatVnd(PLANS[id].price)}</p><ul><li>Tối đa {PLANS[id].limit} SKU</li><li>Đăng bán khi KYC đã được duyệt</li><li>Nhận yêu cầu mua sỉ RFQ</li><li>{PLANS[id].featured ? 'Ưu tiên hiển thị đầu danh sách' : 'Hiển thị theo thứ tự thông thường'}</li></ul><button className="bo-button" disabled={!!pending || active?.plan === id} onClick={() => requestPlan(id)}>{active?.plan === id ? 'Gói hiện tại' : pending ? 'Đang chờ đối soát' : `Chọn gói ${PLANS[id].name}`}</button></Panel>)}</div>
    <Panel title="Thanh toán và kích hoạt" note="Chuyển khoản phí gói cho sàn, tách biệt với tiền cọc đơn hàng của khách."><ol className="bo-numbered"><li>Chọn STANDARD hoặc VIP để tạo yêu cầu chờ xác nhận.</li><li>Chuyển đúng số tiền với nội dung <strong>SUB-{SELLER_ID}</strong>.</li><li>Admin kiểm tra sao kê và xác nhận kích hoạt. Gói mới chuyển sang ACTIVE.</li></ol></Panel>
    <Panel title="Lịch sử yêu cầu gói"><div className="bo-table-wrap"><table className="bo-table"><thead><tr><th>Gói / Ngày yêu cầu</th><th className="bo-num">Phí gói</th><th>Nội dung chuyển khoản</th><th>Trạng thái</th></tr></thead><tbody>{subscriptions.map(sub => <tr key={sub.id}><td><strong>{PLANS[sub.plan].name}</strong><small>{sub.submittedAt}</small></td><td className="bo-num">{formatVnd(PLANS[sub.plan].price)}</td><td>SUB-{SELLER_ID}</td><td><Badge tone={sub.status === 'ACTIVE' ? 'good' : sub.status === 'PENDING' ? 'warning' : 'neutral'}>{sub.status === 'PENDING' ? 'Chờ xác nhận' : sub.status}</Badge></td></tr>)}</tbody></table></div></Panel>
  </>
}
